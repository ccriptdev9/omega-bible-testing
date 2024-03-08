const express = require("express");
const app = express();

const { initializeReaderPeer } = require("./db");
initializeReaderPeer();

// Middleware function to log each API request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use("/bibles", require("./routes"));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
