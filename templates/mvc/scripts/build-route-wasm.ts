import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { routeManifest } from "../src/route-config";
import { resolveRouteManifest } from "@effindomv2/fui-as/browser/routed-app-conventions";

const args = process.argv.slice(2);
let target = "release";
let publish = false;
let routeKey = "";
let buildAll = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  switch (arg) {
    case "--all":
      buildAll = true;
      break;
    case "--route":
      routeKey = args[++index] ?? "";
      break;
    case "--target":
      target = args[++index] ?? "release";
      break;
    case "--publish":
      publish = true;
      break;
    default:
      if (routeKey === "") {
        routeKey = arg;
      } else {
        throw new Error(`Unknown argument: ${arg}`);
      }
      break;
  }
}

const resolvedManifest = resolveRouteManifest(routeManifest);
const selectedRoutes = buildAll
  ? resolvedManifest.routes
  : resolvedManifest.routes.filter((route): boolean => route.key === routeKey);

if (!buildAll && selectedRoutes.length === 0) {
  throw new Error(`Unknown route key: ${routeKey}`);
}

mkdirSync("public", { recursive: true });

for (const route of selectedRoutes) {
  const ascArgs = [
    route.entrypoint,
    "--config",
    "asconfig.json",
    "--target",
    target,
    "--outFile",
    `public/${route.wasmFile}`,
  ];

  if (publish) {
    ascArgs.push("--optimizeLevel", "3", "--shrinkLevel", "2", "--noAssert");
  }

  console.log(`Building ${route.title} -> ${route.wasmFile}`);
  const result = spawnSync("asc", ascArgs, { stdio: "inherit" });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.signal !== null) {
    throw new Error(`AssemblyScript compiler terminated by ${result.signal} while building ${route.key}.`);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
