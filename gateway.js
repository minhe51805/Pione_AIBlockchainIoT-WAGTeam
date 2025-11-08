/**
 * UNIFIED GATEWAY - PORT 3000 (EXTERNAL)
 * 
 * Gộp tất cả services:
 * - Blockchain Bridge
 * - API Proxy (Flask + AI Service)
 * - Frontend (Next.js static build)
 */

import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ====== Database Connection ======
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

// ====== Blockchain Setup ======
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

let _privateKey = process.env.PRIVATE_KEY || "c838981a09fff3fd401e01002732c43e6f53de1b72c535264d9ed3e8cc019130";
if (_privateKey && !_privateKey.startsWith("0x")) {
  _privateKey = `0x${_privateKey}`;
}

const wallet = new ethers.Wallet(_privateKey, provider);

const abiFile = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SoilDataStore.sol/SoilDataStore.json")
);
const abi = abiFile.abi;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

console.log('✅ Blockchain connected:', CONTRACT_ADDRESS);

// ====== Helper Functions ======
function toVnTimestampStringFromGmt(ts) {
  const dateUtc = new Date(ts);
  if (Number.isNaN(dateUtc.getTime())) return null;
  const vnMs = dateUtc.getTime() + 7 * 3600 * 1000;
  const d = new Date(vnMs);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function formatEpochToVnString(epochSeconds) {
  const ms = Number(epochSeconds) * 1000;
  if (!Number.isFinite(ms)) return null;
  const d = new Date(ms + 7 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

function normalizeMeasuredAtVNFromPayload(body) {
  if (body?.created_at && typeof body.created_at === "string") return body.created_at;
  const ts = body?.timestamp;
  if (!ts) return null;
  if (typeof ts === "string") {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(ts)) return ts;
    const s = toVnTimestampStringFromGmt(ts);
    if (s) return s;
  }
  if (typeof ts === "number") {
    const s = toVnTimestampStringFromGmt(new Date(ts * 1000).toUTCString());
    if (s) return s;
  }
  return null;
}

// ====== Blockchain Functions ======
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
                s.soil_temperature_c, s.soil_moisture_pct,
                s.conductivity_us_cm, s.ph_value,
                s.nitrogen_mg_kg, s.phosphorus_mg_kg, s.potassium_mg_kg, s.salt_mg_l,
                s.air_temperature_c, s.air_humidity_pct, s.is_raining;
    `;
    const { rows: claimed } = await client.query(claimSql, [limit, workerId]);
    await client.query('COMMIT');

    const results = [];
    for (const r of claimed) {
      try {
        const dataString = JSON.stringify({
          id: r.id,
          measured_at_epoch: r.measured_at_epoch,
          soil_temperature_c: r.soil_temperature_c,
          soil_moisture_pct: r.soil_moisture_pct,
          conductivity_us_cm: r.conductivity_us_cm,
          ph_value: r.ph_value,
          nitrogen_mg_kg: r.nitrogen_mg_kg,
          phosphorus_mg_kg: r.phosphorus_mg_kg,
          potassium_mg_kg: r.potassium_mg_kg,
          salt_mg_l: r.salt_mg_l,
          air_temperature_c: r.air_temperature_c,
          air_humidity_pct: r.air_humidity_pct,
          is_raining: r.is_raining
        });
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(dataString));

        const tx = await contract.storeSensorReading(
          BigInt(r.id),
          BigInt(r.measured_at_epoch),
          BigInt(Math.round(Number(r.soil_temperature_c) * 10)),
          BigInt(Math.round(Number(r.soil_moisture_pct) * 10)),
          BigInt(Number(r.conductivity_us_cm)),
          BigInt(Math.round(Number(r.ph_value) * 10)),
          BigInt(Number(r.nitrogen_mg_kg)),
          BigInt(Number(r.phosphorus_mg_kg)),
          BigInt(Number(r.potassium_mg_kg)),
          BigInt(Number(r.salt_mg_l)),
          BigInt(Math.round(Number(r.air_temperature_c) * 10)),
          BigInt(Math.round(Number(r.air_humidity_pct) * 10)),
          Boolean(r.is_raining),
          dataHash
        );
        await tx.wait();
        await dbPool.query(
          `UPDATE sensor_readings SET onchain_status = 'confirmed', onchain_tx_hash = $1, confirmed_at_vn = NOW() WHERE id = $2`,
          [tx.hash, r.id]
        );
        results.push({ id: r.id, txHash: tx.hash });
      } catch (e) {
        await dbPool.query(
          `UPDATE sensor_readings SET onchain_status = 'failed', retry_count = COALESCE(retry_count,0) + 1, last_error = LEFT($1, 200) WHERE id = $2`,
          [e.message || String(e), r.id]
        );
        results.push({ id: r.id, error: e.message || String(e) });
      }
    }
    return results;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { }
    throw err;
  } finally {
    client.release();
  }
}

// ====== BLOCKCHAIN ENDPOINTS ======
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

app.get("/getData", async (req, res) => {
  try {
    const count = Number(await contract.getCount());
    let records = [];
    for (let i = 0; i < count; i++) {
      const r = await contract.getRecord(i);
      records.push({
        id: i,
        measuredAtVN: formatEpochToVnString(Number(r.measuredAtVN)),
        soilTemperature: Number(r.soilTemperature) / 10,
        soilMoisture: Number(r.soilMoisture) / 10,
        conductivity: Number(r.conductivity),
        phValue: Number(r.phValue) / 10,
        nitrogen: Number(r.nitrogen),
        phosphorus: Number(r.phosphorus),
        potassium: Number(r.potassium),
        salt: Number(r.salt),
        airTemperature: Number(r.airTemperature) / 10,
        airHumidity: Number(r.airHumidity) / 10,
        isRaining: Number(r.isRaining) === 1,
        reporter: r.reporter
      });
    }
    res.json(records);
  } catch (err) {
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
      soilTemperature: Number(r.soilTemperature) / 10,
      soilMoisture: Number(r.soilMoisture) / 10,
      conductivity: Number(r.conductivity),
      phValue: Number(r.phValue) / 10,
      nitrogen: Number(r.nitrogen),
      phosphorus: Number(r.phosphorus),
      potassium: Number(r.potassium),
      salt: Number(r.salt),
      airTemperature: Number(r.airTemperature) / 10,
      airHumidity: Number(r.airHumidity) / 10,
      isRaining: Number(r.isRaining) === 1,
      reporter: r.reporter
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

app.post("/api/pushDailyInsight", async (req, res) => {
  try {
    const {
      id, date, sampleCount, recommendedCrop, confidence,
      soilHealthScore, healthRating, isAnomalyDetected, recommendations
    } = req.body;

    if (!id || !date || !recommendedCrop) {
      return res.status(400).json({ error: "Missing required fields: id, date, recommendedCrop" });
    }

    const dateTimestamp = Math.floor(new Date(date + "T00:00:00+07:00").getTime() / 1000);
    const confidenceScaled = Math.round((confidence || 0) * 100);
    const healthScoreScaled = Math.round((soilHealthScore || 0) * 10);
    const ratingMap = { "POOR": 0, "FAIR": 1, "GOOD": 2, "EXCELLENT": 3 };
    const healthRatingNum = ratingMap[healthRating?.toUpperCase()] || 1;
    const recommendationsJson = JSON.stringify(recommendations || []);

    const dataToHash = JSON.stringify({ id, date, recommendedCrop, confidence, soilHealthScore, healthRating });
    const recordHash = ethers.keccak256(ethers.toUtf8Bytes(dataToHash));

    const tx = await contract.storeDailyInsight(
      BigInt(id), BigInt(dateTimestamp), BigInt(sampleCount || 0),
      recommendedCrop, BigInt(confidenceScaled), BigInt(healthScoreScaled),
      healthRatingNum, Boolean(isAnomalyDetected), recommendationsJson, recordHash
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      date: date
    });
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

app.get("/api/getDailyInsights", async (req, res) => {
  try {
    const count = Number(await contract.getDailyInsightCount());
    let insights = [];
    for (let i = 0; i < count; i++) {
      const r = await contract.getDailyInsight(i);
      const ratingMap = ["POOR", "FAIR", "GOOD", "EXCELLENT"];
      let recommendations = [];
      try {
        recommendations = JSON.parse(r.recommendations || "[]");
      } catch (e) { }

      insights.push({
        id: i,
        date: formatEpochToVnString(Number(r.dateTimestamp)),
        sampleCount: Number(r.sampleCount),
        recommendedCrop: r.recommendedCrop,
        confidence: Number(r.confidence) / 10000,
        soilHealthScore: Number(r.soilHealthScore) / 10,
        healthRating: ratingMap[r.healthRating] || "UNKNOWN",
        isAnomalyDetected: r.isAnomalyDetected,
        recommendations: recommendations,
        reporter: r.reporter
      });
    }
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

app.get("/api/getLatestDailyInsight", async (req, res) => {
  try {
    const r = await contract.getLatestDailyInsight();
    const ratingMap = ["POOR", "FAIR", "GOOD", "EXCELLENT"];
    let recommendations = [];
    try {
      recommendations = JSON.parse(r.recommendations || "[]");
    } catch (e) { }

    const insight = {
      date: formatEpochToVnString(Number(r.dateTimestamp)),
      sampleCount: Number(r.sampleCount),
      recommendedCrop: r.recommendedCrop,
      confidence: Number(r.confidence) / 10000,
      soilHealthScore: Number(r.soilHealthScore) / 10,
      healthRating: ratingMap[r.healthRating] || "UNKNOWN",
      isAnomalyDetected: r.isAnomalyDetected,
      recommendations: recommendations,
      reporter: r.reporter
    };
    res.json(insight);
  } catch (err) {
    res.status(500).json({ error: err?.message || String(err) });
  }
});

// ====== PROXY TO UNIFIED BACKEND (Port 8080) ======
// IMPORTANT: API proxy MIDDLEWARE must come BEFORE static files!
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Manual proxy middleware for /api/* requests
app.use(async (req, res, next) => {
  // Only handle /api/* requests
  if (!req.url.startsWith('/api/')) {
    return next();
  }

  const targetUrl = `${BACKEND_URL}${req.url}`;
  console.log(`→ Proxying: ${req.method} ${req.url} → ${targetUrl}`);

  try {
    // Node 18+ has native fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for AI endpoints

    const options = {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json'
      },
      signal: controller.signal
    };

    // Add body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      options.body = bodyData;
      console.log(`   → Body (${bodyData.length} bytes):`, bodyData.substring(0, 100));
    }

    const response = await fetch(targetUrl, options);
    clearTimeout(timeout);

    // Copy response headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const data = await response.text();
    console.log(`   ← Response: ${response.status} (${data.length} bytes)`);
    res.status(response.status).send(data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message, error.stack);
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'Gateway timeout', details: 'Backend took too long to respond' });
    } else {
      res.status(500).json({ error: 'Backend service unavailable', details: error.message });
    }
  }
});

// ====== SERVE FRONTEND STATIC FILES (after API routes) ======
// Serve Next.js static build from /Dapp/frontend/out  
const frontendPath = path.join(__dirname, 'Dapp', 'frontend', 'out');
if (fs.existsSync(frontendPath)) {
  // Serve static files first (CSS, JS, images, etc.)
  app.use(express.static(frontendPath));

  // Handle HTML routes with proper fallback
  app.use((req, res, next) => {
    // Skip API requests
    if (req.url.startsWith('/api')) {
      return next();
    }

    // Clean path (remove query params and trailing slashes)
    const cleanPath = req.path.replace(/\/$/, '') || '/';

    // Map routes to HTML files
    const routeToFile = {
      '/': 'index.html',
      '/dashboard': 'dashboard.html',
      '/linkaccount': 'linkaccount.html',
      '/settings': 'settings.html'
    };

    const htmlFile = routeToFile[cleanPath];
    if (htmlFile) {
      const filePath = path.join(frontendPath, htmlFile);
      if (fs.existsSync(filePath)) {
        console.log(`→ Serving: ${req.url} → ${htmlFile}`);
        return res.sendFile(filePath);
      }
    }

    // Fallback to index.html for unknown routes (SPA behavior)
    console.log(`→ Fallback: ${req.url} → index.html`);
    res.sendFile(path.join(frontendPath, 'index.html'));
  });

  console.log('✅ Frontend static files loaded from:', frontendPath);
} else {
  console.warn('⚠️  Frontend build not found at:', frontendPath);
  console.warn('   Run: cd Dapp/frontend && npm run build');
}

// ====== START SERVER ======
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║        🌾 PIONE AGROTWIN - UNIFIED GATEWAY 🌾              ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Gateway running on: http://0.0.0.0:${PORT}`);
  console.log(`\n📍 Endpoints:`);
  console.log(`   🌐 Frontend:          http://localhost:${PORT}/`);
  console.log(`   📥 Data API:          http://localhost:${PORT}/api/data`);
  console.log(`   🤖 AI API:            http://localhost:${PORT}/api/ai/*`);
  console.log(`   👤 Auth API:          http://localhost:${PORT}/api/auth/*`);
  console.log(`   📊 Dashboard API:     http://localhost:${PORT}/api/dashboard/*`);
  console.log(`   ⛓️  Blockchain API:    http://localhost:${PORT}/getData`);
  console.log(`\n🔗 Backend Proxy:       ${BACKEND_URL}`);
  console.log(`📦 Database:            ${process.env.PGHOST}:${process.env.PGPORT}`);
  console.log(`⛓️  Contract:            ${CONTRACT_ADDRESS}`);
  console.log('\n');
});

