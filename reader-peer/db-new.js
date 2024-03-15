const Flock = require("@omegajs/flock");
const Database = require("@omegajs/database");
const goodbye = require("graceful-goodbye");
const Keeper = require("@omegajs/keeper");
const fs = require("fs/promises");
const b4a = require("b4a");

const STORAGE = process.argv[2] ? `./${process.argv[2]}` : "./reader-storage";
let db;

async function initializeReaderPeer() {
  let data = await fs.readFile("../key.json", "utf-8");
  const { dbKey } = JSON.parse(data);

  const keeper = new Keeper(STORAGE);

  console.log("dbKey - ", dbKey);

  await keeper.ready();

  const scroll = keeper.get({ key: b4a.from(dbKey, "hex") });
  await scroll.ready();

  const flock = new Flock();
  goodbye(() => flock.destroy());

  db = new Database(scroll, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  await db.ready();

  flock.on("connection", (conn) => {
    console.log("Reader Peer - got a connection!");

    keeper.replicate(conn, { sparse: true });
  });

  const discovery = flock.join(scroll.discoveryKey);
  discovery.flushed().then(() => {
    console.log("Reader peer initialized successfully...");
  });
}

async function getDataFromReaderPeer(key) {
  console.log("key", key);

  const data = await db.get(key);
  if (data?.value) {
    return JSON.parse(data.value);
  }

  //   let data = await indexStore.get(key);

  //   if (data?.value) {
  //     const index = Number(data.value);
  //     console.log("index", index);

  //     data = await dbStore.getBySeq(index);

  //     if (data?.value) {
  //       return JSON.parse(data.value);
  //     }
  //   }
}

module.exports = { initializeReaderPeer, getDataFromReaderPeer };
