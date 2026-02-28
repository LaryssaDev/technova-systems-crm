
import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { INITIAL_USERS } from "./constants.tsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");

// Initial data structure
const getInitialData = () => ({
  users: INITIAL_USERS,
  clients: [],
  goals: [{ month: new Date().toISOString().slice(0, 7), targetValue: 5000, reachedValue: 0, isCompleted: false }],
  meetings: [],
  financialEntries: [],
  fixedCosts: [],
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get("/api/state", (req, res) => {
    console.log("GET /api/state - Fetching state");
    if (fs.existsSync(DATA_FILE)) {
      try {
        const data = fs.readFileSync(DATA_FILE, "utf-8");
        res.json(JSON.parse(data));
      } catch (e) {
        console.error("Error reading data file:", e);
        res.status(500).json({ error: "Failed to read data" });
      }
    } else {
      console.log("Data file not found, returning initial data");
      res.json(getInitialData());
    }
  });

  app.post("/api/state", (req, res) => {
    const newState = req.body;
    console.log("POST /api/state - Saving state", { 
      clients: newState.clients?.length,
      entries: newState.financialEntries?.length 
    });

    if (!newState || typeof newState !== 'object') {
      return res.status(400).json({ error: "Invalid state data" });
    }

    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(newState, null, 2));
      res.json({ status: "ok" });
    } catch (e) {
      console.error("Error writing data file:", e);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
