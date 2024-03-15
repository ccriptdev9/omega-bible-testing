const Bitswarm = require("bitswarm");
const dDatabase = require("dDatabase");
const goodbye = require("graceful-goodbye");
const b4a = require("b4a");
const Chainstore = require("chainstore");
const fs = require("fs/promises");

const STORAGE = "./writer-storage";
let dbStore, indexStore;

async function initializeSeedPeer() {
  const store = new Chainstore(STORAGE);

  const unichain1 = store.get({ name: "bible-unichain" });
  const unichain2 = store.get({ name: "keys-to-index-unichain" });

  await Promise.all([unichain1.ready(), unichain2.ready()]);

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  dbStore = new dDatabase(unichain1, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  indexStore = new dDatabase(unichain2, {
    keyEncoding: "utf-8",
    valueEncoding: "utf-8",
  });

  swarm.on("connection", (conn) => {
    console.log("Seed Peer - got a connection!");

    store.replicate(conn);
  });

  if (unichain1.length === 0) {
    console.log(
      "appending second unichain's key to the first - ",
      b4a.toString(unichain2.key, "hex")
    );
    await unichain1.append(b4a.toString(unichain2.key, "hex"));
  }

  let indexStoreKey = await unichain1.get(0);
  console.log("indexStoreKey - ", b4a.toString(unichain2.key, "hex"));

  const discovery = swarm.join(unichain1.discoveryKey);
  await discovery.flushed();

  const dbStoreKey = b4a.toString(unichain1.key, "hex");
  indexStoreKey = b4a.toString(unichain2.key, "hex");
  await storeDBKey(dbStoreKey, indexStoreKey);

  console.log("Seed peer initialized successfully...");
}

async function storeDBKey(dbKey, indexKey) {
  const jsonData = JSON.stringify({ dbKey, indexKey });
  await fs.writeFile("../key.json", jsonData);
}

async function saveData(key, value) {
  await dbStore.put(key, JSON.stringify(value));
  let data = await dbStore.get(key);

  if (data?.seq) {
    console.log("key: ", key, " --> index: ", data.seq);
    await indexStore.put(key, data.seq);
  }

  console.log("Seed peer has stored the data - ", data?.seq);
}

async function getDataFromSeedPeer(key) {
  // const data = await dbStore.get(key);

  // if (data?.value) {
  //   return JSON.parse(data.value);
  // }

  console.log("key", key);
  // const data = await db.get(key);

  let data = await indexStore.get(key);

  if (data?.value) {
    const index = data.value;
    console.log("index - ", index);

    data = await dbStore.getBySeq(index);

    if (data?.value) {
      return JSON.parse(data.value);
    }
  }
}

module.exports = { initializeSeedPeer, saveData, getDataFromSeedPeer };
