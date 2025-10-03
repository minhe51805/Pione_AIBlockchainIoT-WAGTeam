import express from "express";
import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import { time } from "console";
import { isNumberObject } from "util/types";
dotenv.config();

const app = express();
app.use(express.json());


const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const abiFile = JSON.parse(
  fs.readFileSync("./artifacts/contracts/SoilDataStore.sol/SoilDataStore.json")
);
const abi = abiFile.abi;

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);


app.post("/pushData", async (req, res) => {
  try {
    let { timestamp, moisture, temperature, humidity } = req.body;

    if (!isNumberObject(timestamp) && typeof timestamp !== "number") {
      timestamp = Math.floor(new Date(timestamp).getTime() / 1000);
    } else if (timestamp > 1e12) {
      timestamp = Math.floor(timestamp / 1000);
    }

    const tx = await contract.storeData(
      Number(timestamp),
      Math.round(moisture * 10),
      Math.round(temperature * 10),
      Math.round(humidity * 10)
    );

    await tx.wait();

    res.json({ status: "ok", txHash: tx.hash, savedTimestamp: timestamp });
  } catch (err) {
    console.error("pushData error:", err);
    res.status(500).json({ error: err.message });
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
        timestamp: Number(r.timestamp),
        moisture: Number(r.moisture) / 10,
        temperature: Number(r.temperature) / 10,
        humidity: Number(r.humidity) / 10,
        reporter: r.reporter
      });
    }
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
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
      timestamp: Number(r.timestamp),
      moisture: Number(r.moisture) / 10,
      temperature: Number(r.temperature) / 10,
      humidity: Number(r.humidity) / 10,
      reporter: r.reporter
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
