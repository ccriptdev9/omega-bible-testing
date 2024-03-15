// unichain -> hypercore -> scroll
// dddatabase -> hyperbee -> database
// bitswarm -> hyperswarm -> flock
// bitswarm -> hyperswarm -> flock
// chainstore -> corestore -> keeper
// hyperdrive -> ddrive -> drive
// chainstore -> corestore -> keeper

const Flock = require("@omegajs/flock");
const Database = require("@omegajs/database");
const goodbye = require("graceful-goodbye");
const Keeper = require("@omegajs/keeper");
const fs = require("fs/promises");
const b4a = require("b4a");

const STORAGE = "./writer-storage-new";
let db;

async function initializeSeedPeer() {
  const keeper = new Keeper(STORAGE);

  const scroll = keeper.get({ name: "bible-scroll" });

  await keeper.ready();
  await scroll.ready();

  const flock = new Flock();
  goodbye(() => flock.destroy());

  db = new Database(scroll, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  flock.on("connection", (conn) => {
    console.log("Seed Peer - got a connection!");

    keeper.replicate(conn);
  });

  const discovery = flock.join(scroll.discoveryKey);
  await discovery.flushed();

  const dbStoreKey = b4a.toString(scroll.key, "hex");
  await storeDBKey(dbStoreKey);

  console.log("Seed peer initialized successfully...");
}

async function storeDBKey(dbKey) {
  const jsonData = JSON.stringify({ dbKey });
  await fs.writeFile("../key.json", jsonData);
}

async function saveData(key, value) {
  await db.put(key, JSON.stringify(value));
  //   let data = await db.get(key);

  //   if (data?.seq) {
  //     console.log("key: ", key, " --> index: ", data.seq);
  //     await indexStore.put(key, data.seq);
  //   }

  console.log("Seed peer has stored the data");
}

async function getDataFromSeedPeer(key) {
  console.log("key", key);
  const data = await db.get(key);

  if (data?.value) {
    return JSON.parse(data.value);
  }

  //   let data = await indexStore.get(key);

  //   if (data?.value) {
  //     const index = data.value;
  //     console.log("index - ", index);

  //     data = await dbStore.getBySeq(index);

  //     if (data?.value) {
  //       return JSON.parse(data.value);
  //     }
  //   }
}

module.exports = { initializeSeedPeer, saveData, getDataFromSeedPeer };
