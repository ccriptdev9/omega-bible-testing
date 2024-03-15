const Bitswarm = require("bitswarm");
const dDatabase = require("dDatabase");
const goodbye = require("graceful-goodbye");
const Chainstore = require("chainstore");
const fs = require("fs/promises");

const STORAGE = process.argv[2] ? `./${process.argv[2]}` : "./reader-storage";
let dbStore, unichain, indexStore;

async function initializeReaderPeer() {
  let data = await fs.readFile("../key.json", "utf-8");
  const { dbKey, indexKey } = JSON.parse(data);

  const store = new Chainstore(STORAGE);

  console.log("dbKey - ", dbKey);
  console.log("indexKey - ", indexKey);

  await store.ready();

  const unichain1 = store.get({ key: dbKey });
  await unichain1.ready();

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  dbStore = new dDatabase(unichain1, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  await dbStore.ready();

  swarm.on("connection", (conn) => {
    console.log("Reader Peer - got a connection!");

    store.replicate(conn);
  });

  await unichain1.update();

  const unichain2 = store.get({ key: indexKey });
  await unichain2.update();

  indexStore = new dDatabase(unichain2, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  await indexStore.ready();

  const discovery = swarm.join(unichain1.discoveryKey);
  discovery.flushed().then(() => {
    console.log("Reader peer initialized successfully...");
  });
}

async function getDataFromReaderPeer(key) {
  console.log("key", key);
  // let index = await indexStore.get(key);

  // console.log("type - ", typeof index?.value);

  // const data = await dbStore.get(key);

  // if (data?.value) {
  //   return JSON.parse(data.value);
  // }

  let data = await indexStore.get(key);

  if (data?.value) {
    const index = Number(data.value);
    console.log("index", index);

    data = await dbStore.getBySeq(index);

    if (data?.value) {
      return JSON.parse(data.value);
    }
  }
}

module.exports = { initializeReaderPeer, getDataFromReaderPeer };
