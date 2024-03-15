const Bitswarm = require("bitswarm");
const dDrive = require("dDrive");
const Localddrive = require("localddrive");
const Chainstore = require("chainstore");
const debounce = require("debounceify");
const b4a = require("b4a");
const goodbye = require("graceful-goodbye");

const fs = require("fs");
let ddrive;

const STORAGE = process.argv[4] ? `./${process.argv[4]}` : "./reader-drive";

async function initializeReaderDrive() {
  let data = await fs.promises.readFile("../key.json", "utf-8");
  const { driveKey } = JSON.parse(data);

  console.log("STORAGE", STORAGE);

  const store = new Chainstore(STORAGE);

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  swarm.on("connection", (conn) => {
    console.log("drives connected...");
    store.replicate(conn);
  });

  //   const local = new Localddrive("./bible-audios");
  ddrive = new dDrive(store, b4a.from(driveKey, "hex"));
  await ddrive.ready();

  //   const mirror = debounce(() => mirrorDrive(local, ddrive));
  //   ddrive.core.on("append", mirror);

  const discovery = swarm.join(ddrive.discoveryKey);
  discovery.flushed().then(() => {
    console.log("Reader drive intiailized...");
  });

  // mirror();
}

async function mirrorDrive(local, ddrive) {
  console.log("started mirroring remote drive into local...");

  const mirror = ddrive.mirror(local);
  await mirror.done();

  console.log("finished mirroring:", mirror.count);
}

async function getFileFromReaderDrive(path) {
  console.log("file path - ", path);
  const file = await ddrive.get(path);
  console.log("file - ", file);

  return file;
}

module.exports = { initializeReaderDrive, getFileFromReaderDrive };
