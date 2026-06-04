import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const outputDir = "public";
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(`${outputDir}/runtime`, { recursive: true });

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
const indexTemplate = readFileSync("index.html", "utf8");
const loadingOverlayStyles = readFileSync("node_modules/@effindomv2/fui-as/browser/loading-overlay-styles.html", "utf8");
const loadingOverlayBody = readFileSync("node_modules/@effindomv2/fui-as/browser/loading-overlay-body.html", "utf8");
writeFileSync(
  `${outputDir}/index.html`,
  indexTemplate
    .replace("{{LOADING_OVERLAY_STYLES}}", loadingOverlayStyles)
    .replace("{{LOADING_OVERLAY_BODY}}", loadingOverlayBody),
  "utf8",
);
copyFileSync("favicon.svg", `${outputDir}/favicon.svg`);
