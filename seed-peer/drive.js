const Bitswarm = require("bitswarm");
const dDrive = require("dDrive");
const Localddrive = require("localddrive");
const Chainstore = require("chainstore");
const debounce = require("debounceify");
const b4a = require("b4a");
const goodbye = require("graceful-goodbye");
const fs = require("fs/promises");

let ddrive;

async function initializeWriterDrive() {
  const store = new Chainstore("./writer-drive");

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  swarm.on("connection", (conn) => {
    console.log("drives connected...");

    store.replicate(conn);
  });

  const local = new Localddrive("./bible-audios");

  ddrive = new dDrive(store);
  await ddrive.ready();

  const mirror = debounce(() => mirrorDrive(local, ddrive));

  const discovery = swarm.join(ddrive.discoveryKey);
  discovery.flushed().then(() => {
    console.log("Writer drive initialized...");
  });

  console.log("drive key:", b4a.toString(ddrive.key, "hex"));

  await storeDriveKey(b4a.toString(ddrive.key, "hex"));

  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", () => mirror());
}

async function storeDriveKey(driveKey) {
  let data = await fs.readFile("../key.json", "utf-8");
  const { dbKey, indexKey } = JSON.parse(data);

  const jsonData = JSON.stringify({ dbKey, indexKey, driveKey });

  console.log("jsonData", jsonData);

  await fs.writeFile("../key.json", jsonData);

  console.log("drive key stored...");
}

// path: audio-bible-{audioBibleId}-chapter-{chapterId}.mp3

async function storeInDrive(path, file) {
  console.log("file path - ", path);

  await ddrive.put(path, file);
  console.log("File buffer stored in seed-peer's drive...");
}

async function mirrorDrive(local, ddrive) {
  console.log("started mirroring changes from local into the drive...");

  const mirror = local.mirror(ddrive);
  await mirror.done();

  console.log("finished mirroring:", mirror.count);
}

async function getFileFromDrive(path) {
  console.log("file path - ", path);
  const file = await ddrive.get(path);
  console.log("file - ", file);
}

module.exports = { storeInDrive, getFileFromDrive, initializeWriterDrive };
