import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { renderRoutedPageHead, resolveRouteManifest, routeHead } from "@effindomv2/fui-as/browser/routed-app-conventions";
import { routeManifest } from "../src/route-config";

const outputDir = "public";
const resolvedManifest = resolveRouteManifest(routeManifest);
const indexTemplate = readFileSync("index.html", "utf8");
const routeShellTemplate = readFileSync("route-shell.html", "utf8");
const loadingOverlayStyles = readFileSync("node_modules/@effindomv2/fui-as/browser/loading-overlay-styles.html", "utf8");
const loadingOverlayBody = readFileSync("node_modules/@effindomv2/fui-as/browser/loading-overlay-body.html", "utf8");

function renderLoadingOverlay(template: string): string {
  return template
    .replace("{{LOADING_OVERLAY_STYLES}}", loadingOverlayStyles)
    .replace("{{LOADING_OVERLAY_BODY}}", loadingOverlayBody);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(`${outputDir}/runtime`, { recursive: true });
for (const route of resolvedManifest.routes) {
  mkdirSync(`${outputDir}/${route.shellDir}`, { recursive: true });
}

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
copyFileSync("favicon.ico", `${outputDir}/favicon.ico`);
const defaultRoute = resolvedManifest.routes.length == 0 ? undefined : resolvedManifest.routes[0];
const defaultRouteTitle = defaultRoute == null ? "FUI-AS Routed App" : defaultRoute.title;
const defaultRouteHref = defaultRoute == null ? "/home/" : defaultRoute.publishedRoutePath;
writeFileSync(
  `${outputDir}/index.html`,
  renderLoadingOverlay(indexTemplate)
    .replace("{{HEAD}}", renderRoutedPageHead(defaultRouteTitle, defaultRoute == null ? routeHead() : defaultRoute.headTags))
    .replaceAll("{{REDIRECT_HREF}}", defaultRouteHref),
  "utf8",
);
for (const route of resolvedManifest.routes) {
  writeFileSync(
    `${outputDir}/${route.shellDir}/index.html`,
    renderLoadingOverlay(routeShellTemplate).replace("{{HEAD}}", renderRoutedPageHead(route.title, route.headTags)),
    "utf8",
  );
}
