import { accessSync } from "node:fs";
import { resolveRouteManifest } from "@effindomv2/fui-as/browser/routed-app-conventions";
import { routeManifest } from "../src/route-config";

const resolvedManifest = resolveRouteManifest(routeManifest);
const expectedFiles = [
  "public/index.html",
  "public/harness.js",
  "public/bridge.js",
  "public/effindom-runtime-config.js",
  "public/runtime/dist/effindom.v2.manifest.json",
  "public/runtime/fonts/NotoSans-Regular.ttf",
];

for (const route of resolvedManifest.routes) {
  expectedFiles.push(
    `public/${route.shellDir}/index.html`,
    `public/${route.wasmFile}`,
  );
}

for (const filePath of expectedFiles) {
  accessSync(filePath);
}
