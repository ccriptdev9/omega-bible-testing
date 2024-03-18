const express = require("express");
const app = express();

const { initializeSeedPeer } = require("./db");
const { initializeWriterDrive } = require("./drive");
initializeSeedPeer().then(() => {
  initializeWriterDrive();
});

// Middleware function to log each API request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use("/bibles", require("./routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
