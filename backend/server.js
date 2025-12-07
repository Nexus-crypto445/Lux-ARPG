const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// API routes
const charRoutes = require("./routes/characters");
app.use("/api/characters", charRoutes);

// simple root
app.get("/", (req, res) => {
  res.send("Backend is running! Use /api/characters to manage characters.");
});

// Add a convenience test route if you want
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Serve frontend build if you want backend to serve static in single-service setups.
// (Not used if you deploy frontend as Render Static Site.)
const FRONTEND_BUILD = path.join(__dirname, "..", "frontend", "build");
const fs = require("fs");
if (fs.existsSync(FRONTEND_BUILD)) {
  app.use(express.static(FRONTEND_BUILD));
  app.get("*", (req, res) => {
    res.sendFile(path.join(FRONTEND_BUILD, "index.html"));
  });
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
