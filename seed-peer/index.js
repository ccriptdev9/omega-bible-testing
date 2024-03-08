const express = require("express");
const app = express();

const { initializeSeedPeer } = require("./db");
initializeSeedPeer();

app.use(express.json());
app.use("/bibles", require("./routes"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
