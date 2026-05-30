import { accessSync } from "node:fs";

const expectedFiles = [
  "public/index.html",
  "public/harness.js",
  "public/home/index.html",
  "public/settings/index.html",
  "public/home.wasm",
  "public/settings.wasm",
  "public/bridge.js",
  "public/effindom-runtime-config.js",
  "public/runtime/dist/effindom.v2.manifest.json",
  "public/runtime/fonts/NotoSans-Regular.ttf",
];

for (const filePath of expectedFiles) {
  accessSync(filePath);
}
