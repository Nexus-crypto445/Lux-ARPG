const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Example route
app.get("/api/example", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Port for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
