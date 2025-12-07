const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let characters = [];

app.get("/api/characters", (req, res) => {
  res.json(characters);
});

app.post("/api/characters", (req, res) => {
  const newChar = { id: Date.now(), ...req.body };
  characters.push(newChar);
  res.json(newChar);
});

app.put("/api/characters/:id", (req, res) => {
  const id = Number(req.params.id);
  characters = characters.map(c => (c.id === id ? req.body : c));
  res.json(req.body);
});

app.delete("/api/characters/:id", (req, res) => {
  const id = Number(req.params.id);
  characters = characters.filter(c => c.id !== id);
  res.json({ success: true });
});

app.listen(3001, () => console.log("Backend running on port 3001"));
