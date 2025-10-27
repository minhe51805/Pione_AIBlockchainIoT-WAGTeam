import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const app = express();
app.use(express.json());

// ====== Postgres ======
const { Pool } = pkg;
const dbPool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST,
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE
    });

// No external pull URL; event-driven via /api/data

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abiFile = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SoilDataStore.sol/SoilDataStore.json")
);
const abi = abiFile.abi;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
console.log(' CONTRACT_ADDRESS:', CONTRACT_ADDRESS);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

// ====== Helpers ======
function toVnTimestampStringFromGmt(ts) {
  const dateUtc = new Date(ts);
  if (Number.isNaN(dateUtc.getTime())) return null;
  const vnMs = dateUtc.getTime() + 7 * 3600 * 1000;
  const d = new Date(vnMs);
  const pad = (n) => String(n).padStart(2, "0");
  const s = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return s;
}

function formatEpochToVnString(epochSeconds) {
  const ms = Number(epochSeconds) * 1000;
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms + 7 * 3600 * 1000); // VN = UTC+7
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function normalizeMeasuredAtVNFromPayload(body) {
  if (body?.created_at && typeof body.created_at === "string") return body.created_at;
  const ts = body?.timestamp;
  if (!ts) return null;
  if (typeof ts === "string") {
    // If already in format YYYY-MM-DD HH:MM:SS (local VN time from device), accept as is
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ts)) return ts;
    // Else try convert from GMT string to VN time string
    const s = toVnTimestampStringFromGmt(ts);
    if (s) return s;
  }
  if (typeof ts === "number") {
    const s = toVnTimestampStringFromGmt(new Date(ts * 1000).toUTCString());
    if (s) return s;
  }
  return null;
}

// Removed ingestLatest (pulling) to avoid duplicate code paths

async function bridgePending(limit = 3) {
  const workerId = process.env.BRIDGE_WORKER_ID || `node-${process.pid}`;
  const client = await dbPool.connect();
  try {
    await client.query('BEGIN');
    const claimSql = `
      WITH c AS (
        SELECT id
        FROM sensor_readings
        WHERE onchain_status = 'pending'
        ORDER BY measured_at_vn ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE sensor_readings s
      SET onchain_status = 'sent', locked_by = $2, locked_at = NOW()
      FROM c
      WHERE s.id = c.id
      RETURNING s.id,
                EXTRACT(EPOCH FROM s.measured_at_vn AT TIME ZONE 'Asia/Ho_Chi_Minh')::bigint AS measured_at_epoch,
                s.temperature_c, s.humidity_pct, s.conductivity_us_cm, s.ph_value,
                s.nitrogen_mg_kg, s.phosphorus_mg_kg, s.potassium_mg_kg, s.salt_mg_l;
    `;
    const { rows: claimed } = await client.query(claimSql, [limit, workerId]);
    await client.query('COMMIT');

    const results = [];
    for (const r of claimed) {
      try {
        const tx = await contract.storeData(
          BigInt(r.measured_at_epoch),
          BigInt(Math.round(Number(r.temperature_c) * 10)),
          BigInt(Math.round(Number(r.humidity_pct) * 10)),
          BigInt(Number(r.conductivity_us_cm)),
          BigInt(Math.round(Number(r.ph_value) * 10)),
          BigInt(Number(r.nitrogen_mg_kg)),
          BigInt(Number(r.phosphorus_mg_kg)),
          BigInt(Number(r.potassium_mg_kg)),
          BigInt(Number(r.salt_mg_l))
        );
        const receipt = await tx.wait();
        await dbPool.query(
          `UPDATE sensor_readings
           SET onchain_status = 'confirmed', onchain_tx_hash = $1, confirmed_at_vn = NOW()
           WHERE id = $2`,
          [tx.hash, r.id]
        );
        results.push({ id: r.id, txHash: tx.hash, status: receipt.status });
      } catch (e) {
        await dbPool.query(
          `UPDATE sensor_readings
           SET onchain_status = 'failed', retry_count = COALESCE(retry_count,0) + 1, last_error = LEFT($1, 200)
           WHERE id = $2`,
          [e.message || String(e), r.id]
        );
        results.push({ id: r.id, error: e.message || String(e) });
      }
    }
    return results;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
}

// ====== Bridge endpoint ======

// ====== Direct IoT push endpoint (event-driven) ======
// Payload ví dụ từ thiết bị / aggregator:
app.post("/api/data", async (req, res) => {
  try {
    const measuredAtVN = normalizeMeasuredAtVNFromPayload(req.body);
    if (!measuredAtVN) {
      return res.status(400).json({ error: "missing measured_at_vn/timestamp" });
    }
    const temperature_c = Number(req.body?.temperature);
    const humidity_pct = Number(req.body?.humidity);
    const conductivity_us_cm = Number(req.body?.conductivity);
    const ph_value = Number(req.body?.ph);
    const nitrogen_mg_kg = Number(req.body?.nitrogen);
    const phosphorus_mg_kg = Number(req.body?.phosphorus);
    const potassium_mg_kg = Number(req.body?.potassium);
    const salt_mg_l = Number(req.body?.salt);
    
    if (!Number.isFinite(temperature_c) || !Number.isFinite(humidity_pct) || 
        !Number.isFinite(conductivity_us_cm) || !Number.isFinite(ph_value) ||
        !Number.isFinite(nitrogen_mg_kg) || !Number.isFinite(phosphorus_mg_kg) ||
        !Number.isFinite(potassium_mg_kg) || !Number.isFinite(salt_mg_l)) {
      return res.status(400).json({ error: "invalid numeric fields" });
    }

    const insertSql = `
      INSERT INTO sensor_readings (
        measured_at_vn, temperature_c, humidity_pct,
        conductivity_us_cm, ph_value, nitrogen_mg_kg,
        phosphorus_mg_kg, potassium_mg_kg, salt_mg_l
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (measured_at_vn) DO NOTHING
      RETURNING id
    `;
    const result = await dbPool.query(insertSql, [
      measuredAtVN, temperature_c, humidity_pct,
      conductivity_us_cm, ph_value, nitrogen_mg_kg,
      phosphorus_mg_kg, potassium_mg_kg, salt_mg_l
    ]);

    // Optional: bridge immediately when enabled
    if (process.env.BRIDGE_ON_INSERT === "true" && result.rowCount > 0) {
      try { await bridgePending(1); } catch (e) { console.error("bridge on insert error:", e); }
    }

    res.json({ status: "ok", measured_at_vn: measuredAtVN, inserted: result.rowCount > 0, id: result.rows?.[0]?.id ?? null });
  } catch (err) {
    console.error("/api/data error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

app.post("/bridgePending", async (req, res) => {
  try {
    const limit = req.body?.limit ? Number(req.body.limit) : 3;
    const results = await bridgePending(limit);
    res.json({ status: "ok", results });
  } catch (err) {
    console.error("/bridgePending error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// Removed legacy /pushData endpoint to avoid duplicate write paths

app.get("/getData", async (req, res) => {
  try {
    const count = Number(await contract.getCount());
    let records = [];
    for (let i = 0; i < count; i++) {
      const r = await contract.getRecord(i);
      records.push({
        id: i,
        measuredAtVN: formatEpochToVnString(Number(r.measuredAtVN)),
        temperatureC: Number(r.temperatureC) / 10,
        humidityPct: Number(r.humidityPct) / 10,
        conductivity: Number(r.conductivity),
        phValue: Number(r.phValue) / 10,
        nitrogen: Number(r.nitrogen),
        phosphorus: Number(r.phosphorus),
        potassium: Number(r.potassium),
        salt: Number(r.salt),
        reporter: r.reporter
      });
    }
    res.json(records);
  } catch (err) {
    console.error("/getData error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

app.get("/getDataRange", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "Please provide start & end date (YYYY-MM-DD)" });
    }

    const startTime = Math.floor(new Date(start).getTime() / 1000);
    const endTime = Math.floor(new Date(end).getTime() / 1000);

    const list = await contract.getRecordsByTimeRange(startTime, endTime);

    const result = list.map((r, i) => ({
      id: i,
      measuredAtVN: formatEpochToVnString(Number(r.measuredAtVN)),
      temperatureC: Number(r.temperatureC) / 10,
      humidityPct: Number(r.humidityPct),
      moisturePct: Number(r.moisturePct),
      reporter: r.reporter
    }));

    res.json(result);
  } catch (err) {
    console.error("/getDataRange error:", err);
    res.status(500).json({ error: err?.message || String(err) });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
