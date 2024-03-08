const Bitswarm = require("bitswarm");
const dDatabase = require("dDatabase");
const goodbye = require("graceful-goodbye");
const b4a = require("b4a");
const Unichain = require("unichain");
const fs = require("fs/promises");

const STORAGE = "./writer-storage";
let db;

async function initializeSeedPeer() {
  const unichain = new Unichain(STORAGE, "", { sparse: true });

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  db = new dDatabase(unichain, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  swarm.on("connection", (conn) => {
    console.log("Seed Peer - got a connection!");
    // unichain.replicate(conn, { sparse: true });
    db.replicate(conn, { sparse: true });
  });

  await unichain.ready();
  const discovery = swarm.join(unichain.discoveryKey);

  await discovery.flushed();

  const key = b4a.toString(unichain.key, "hex");
  await storeDBKey(key);

  console.log("Seed peer initialized successfully...");
}

async function storeDBKey(dbKey) {
  const jsonData = JSON.stringify({ dbKey });
  await fs.writeFile("../key.json", jsonData);
}

async function saveData(key, value) {
  await db.put(key, JSON.stringify(value));
  console.log("Seed peer has stored the data.");
}

async function getDataFromSeedPeer(key) {
  const data = await db.get(key);

  if (data?.value) {
    return JSON.parse(data.value);
  }
}

module.exports = { initializeSeedPeer, saveData, getDataFromSeedPeer };
