const Bitswarm = require("bitswarm");
const dDrive = require("dDrive");
const Localddrive = require("localddrive");
const Chainstore = require("chainstore");
const debounce = require("debounceify");
const b4a = require("b4a");
const goodbye = require("graceful-goodbye");

const fs = require("fs/promises");

async function initializeReaderDrive() {
  let data = await fs.readFile("../key.json", "utf-8");
  const { driveKey } = JSON.parse(data);

  const store = new Chainstore("./reader-drive");

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  swarm.on("connection", (conn) => store.replicate(conn));

  const local = new Localddrive("./bible-audios");
  const ddrive = new dDrive(store, b4a.from(driveKey, "hex"));

  await ddrive.ready();

  const mirror = debounce(() => mirrorDrive(local, ddrive));

  // call the mirror function whenever content gets appended
  // to the Hypercore instance of the hyperdrive
  ddrive.core.on("append", mirror);

  const foundPeers = store.findingPeers();

  // join a topic
  swarm.join(ddrive.discoveryKey, { client: true, server: false });
  swarm.flush().then(() => foundPeers());

  // start the mirroring process (i.e copying the contents from remote drive to local dir)
  // mirror();
}

async function mirrorDrive(local, ddrive) {
  console.log("started mirroring remote drive into local...");

  const mirror = ddrive.mirror(local);
  await mirror.done();

  console.log("finished mirroring:", mirror.count);
}

initializeReaderDrive();
