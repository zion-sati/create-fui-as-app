import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { workerManifest } from "../src/worker-config";

const args = process.argv.slice(2);
let target = "release";
let publish = false;
let workerKey = "";
let buildAll = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  switch (arg) {
    case "--all":
      buildAll = true;
      break;
    case "--worker":
      workerKey = args[++index] ?? "";
      break;
    case "--target":
      target = args[++index] ?? "release";
      break;
    case "--publish":
      publish = true;
      break;
    default:
      if (workerKey === "") {
        workerKey = arg;
      } else {
        throw new Error(`Unknown argument: ${arg}`);
      }
      break;
  }
}

const selectedWorkers = buildAll
  ? workerManifest
  : workerManifest.filter((worker): boolean => worker.key === workerKey);

if (!buildAll && selectedWorkers.length === 0) {
  throw new Error(`Unknown worker key: ${workerKey}`);
}

mkdirSync("public", { recursive: true });

for (const worker of selectedWorkers) {
  const ascArgs = [
    worker.entrypoint,
    "--config",
    "asconfig.json",
    "--target",
    target,
    "--outFile",
    `public/${worker.wasmFile}`,
  ];

  if (publish) {
    ascArgs.push("--optimizeLevel", "3", "--shrinkLevel", "2", "--noAssert");
  }

  console.log(`Building worker ${worker.key} -> ${worker.wasmFile}`);
  const result = spawnSync("asc", ascArgs, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
