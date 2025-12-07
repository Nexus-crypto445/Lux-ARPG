const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const DATA_DIR = path.join(__dirname, "..", "data");
const CHAR_FILE = path.join(DATA_DIR, "characters.json");

// Ensure data file exists
async function readChars() {
  try {
    const txt = await fs.readFile(CHAR_FILE, "utf8");
    return JSON.parse(txt || "[]");
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(CHAR_FILE, "[]", "utf8");
      return [];
    }
    throw err;
  }
}

async function writeChars(arr) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CHAR_FILE, JSON.stringify(arr, null, 2), "utf8");
}

// list
router.get("/", async (req, res) => {
  const chars = await readChars();
  res.json(chars);
});

// get single
router.get("/:id", async (req, res) => {
  const chars = await readChars();
  const ch = chars.find(c => String(c.id) === String(req.params.id));
  if (!ch) return res.status(404).json({ error: "Not found" });
  res.json(ch);
});

// create
router.post("/", async (req, res) => {
  const chars = await readChars();
  const payload = req.body || {};
  const id = Date.now(); // simple id
  const created = {
    id,
    name: payload.name || "New Hero",
    level: payload.level || 1,
    class: payload.class || "Adventurer",
    subclass: payload.subclass || null,
    stats: payload.stats || { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
    inventory: payload.inventory || [],
    difficulty: payload.difficulty || "Normal",
    rarityBias: payload.rarityBias || "Common",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  chars.push(created);
  await writeChars(chars);
  res.status(201).json(created);
});

// update
router.put("/:id", async (req, res) => {
  const chars = await readChars();
  const idx = chars.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const payload = req.body || {};
  const updated = {
    ...chars[idx],
    ...payload,
    updatedAt: new Date().toISOString()
  };
  chars[idx] = updated;
  await writeChars(chars);
  res.json(updated);
});

// delete
router.delete("/:id", async (req, res) => {
  let chars = await readChars();
  const idx = chars.findIndex(c => String(c.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const removed = chars.splice(idx, 1)[0];
  await writeChars(chars);
  res.json({ success: true, removed });
});

module.exports = router;
