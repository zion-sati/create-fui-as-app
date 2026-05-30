import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

const outputDir = "public";
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(`${outputDir}/runtime`, { recursive: true });
mkdirSync(`${outputDir}/home`, { recursive: true });
mkdirSync(`${outputDir}/settings`, { recursive: true });

cpSync("node_modules/@effindomv2/runtime/dist", `${outputDir}/runtime/dist`, { recursive: true });
cpSync("node_modules/@effindomv2/runtime/dist/fonts", `${outputDir}/runtime/fonts`, { recursive: true });
copyFileSync("node_modules/@effindomv2/runtime/dist/bridge.js", `${outputDir}/bridge.js`);
if (existsSync("node_modules/@effindomv2/runtime/dist/bridge.js.map")) {
  copyFileSync("node_modules/@effindomv2/runtime/dist/bridge.js.map", `${outputDir}/bridge.js.map`);
}
writeFileSync(
  `${outputDir}/effindom-runtime-config.js`,
  'window.__effindomRuntime = Object.assign({}, window.__effindomRuntime, { manifestUrl: "./runtime/dist/effindom.v2.manifest.json" });\n',
  "utf8",
);
copyFileSync("index.html", `${outputDir}/index.html`);
copyFileSync("route-shell.html", `${outputDir}/home/index.html`);
copyFileSync("route-shell.html", `${outputDir}/settings/index.html`);
