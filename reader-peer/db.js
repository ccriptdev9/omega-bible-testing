const Bitswarm = require("bitswarm");
const dDatabase = require("dDatabase");
const goodbye = require("graceful-goodbye");
const Unichain = require("unichain");
const fs = require("fs/promises");

const STORAGE = "./reader-storage";
let db;

async function initializeReaderPeer() {
  let data = await fs.readFile("../key.json", "utf-8");
  const { dbKey } = JSON.parse(data);

  const unichain = new Unichain(STORAGE, dbKey, {
    sparse: true,
  });

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  db = new dDatabase(unichain, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  swarm.on("connection", (conn) => {
    console.log("Reader Peer - got a connection!");

    // unichain.replicate(conn, { sparse: true });
    db.replicate(conn, { sparse: true });
  });

  await unichain.ready();
  const discovery = swarm.join(unichain.discoveryKey);

  discovery.flushed().then(() => {
    console.log("Reader peer initialized successfully...");
  });
}

async function getDataFromReaderPeer(key) {
  const data = await db.get(key);

  if (data?.value) {
    return JSON.parse(data.value);
  }
}

module.exports = { initializeReaderPeer, getDataFromReaderPeer };
