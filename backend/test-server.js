const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("NUS Tour Backend Test Server");
});

// API endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Test server running at http://localhost:${PORT}`);
});
