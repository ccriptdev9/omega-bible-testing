const Bitswarm = require("bitswarm");
const dDrive = require("dDrive");
const Localddrive = require("localddrive");
const Chainstore = require("chainstore");
const debounce = require("debounceify");
const b4a = require("b4a");
const goodbye = require("graceful-goodbye");
const fs = require("fs/promises");

async function initializeWriterDrive() {
  const store = new Chainstore("./writer-drive");

  const swarm = new Bitswarm();
  goodbye(() => swarm.destroy());

  swarm.on("connection", (conn) => store.replicate(conn));

  const local = new Localddrive("./bible-audios");

  const ddrive = new dDrive(store);
  await ddrive.ready();

  const mirror = debounce(() => mirrorDrive(local, ddrive));

  const discovery = swarm.join(ddrive.discoveryKey);
  await discovery.flushed();
  console.log("drive key:", b4a.toString(ddrive.key, "hex"));

  await storeDriveKey(b4a.toString(ddrive.key, "hex"));

  // start the mirroring process (i.e copying) of content from writer-dir to the drive
  // whenever something is entered (other than '/n' or Enter )in the command-line
  //   stdio.in.setEncoding("utf-8");
  //   stdio.in.on("data", (data) => {
  //     if (!data.match("\n")) return;
  //     mirror();
  //   });

  process.stdin.setEncoding("utf-8");
  process.stdin.on("data", () => mirror());
}

async function storeDriveKey(driveKey) {
  let data = await fs.readFile("../key.json", "utf-8");
  const { dbKey } = JSON.parse(data);

  const jsonData = JSON.stringify({ dbKey, driveKey });
  await fs.writeFile("../key.json", jsonData);
}

// this function copies the contents from writer-dir directory to the drive
async function mirrorDrive(local, ddrive) {
  console.log("started mirroring changes from write-local into the drive...");

  const mirror = local.mirror(ddrive);
  await mirror.done();

  console.log("finished mirroring:", mirror.count);
}

initializeWriterDrive();
