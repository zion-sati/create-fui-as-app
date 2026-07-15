import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const outputDir = "public";
const buildMode = readBuildModeArg();

function readBuildModeArg(): "debug" | "release" {
  const index = process.argv.indexOf("--build-mode");
  const value = index >= 0 ? process.argv[index + 1] : "debug";
  if (value === "debug" || value === "release") return value;
  throw new Error("--build-mode must be debug or release.");
}

function renderRuntimeConfig(): string {
  const manifest = JSON.parse(readFileSync("node_modules/@effindomv2/runtime/dist/effindom.v2.manifest.json", "utf8")) as {
    runtime_set_hash?: string;
  };
  if (typeof manifest.runtime_set_hash !== "string" || manifest.runtime_set_hash.length === 0) {
    throw new Error("Installed EffinDOM runtime does not declare runtime_set_hash.");
  }
  const cdnManifestUrl = `https://runtime.effindom.dev/v2/manifests/${manifest.runtime_set_hash}.json`;
  const entries = [
    '  manifestUrl: "./runtime/dist/effindom.v2.manifest.json",',
    `  manifestUrls: ${JSON.stringify([cdnManifestUrl, "./runtime/dist/effindom.v2.manifest.json"])},`,
    `  expectedRuntimeSetHash: ${JSON.stringify(manifest.runtime_set_hash)},`,
    `  buildMode: ${JSON.stringify(buildMode)},`,
  ];
  return `window.__effindomRuntime = Object.assign({}, window.__effindomRuntime, {\n${entries.join("\n")}\n});\n`;
}

interface StageConfig {
  stage: Record<string, string>;
}

function resolveGlob(pattern: string): string[] {
  const slash = pattern.lastIndexOf("/");
  if (slash === -1) {
    const suffix = pattern.startsWith("*.") ? pattern.slice(1) : "";
    if (suffix.length === 0) return [];
    return readdirSync(".").filter((f) => f.endsWith(suffix));
  }

  const dir = pattern.slice(0, slash);
  const filePart = pattern.slice(slash + 1);

  if (filePart === "**") {
    return [dir];
  }

  if (filePart.startsWith("*.")) {
    const suffix = filePart.slice(1);
    try {
      return readdirSync(dir)
        .filter((f) => f.endsWith(suffix))
        .map((f) => join(dir, f));
    } catch {
      return [];
    }
  }

  if (existsSync(pattern)) {
    return [pattern];
  }

  return [];
}

function stageProjectAssets(outputDir: string): void {
  const configPath = "stage-assets.json";
  if (!existsSync(configPath)) {
    return;
  }

  const raw = readFileSync(configPath, "utf8");
  const config: StageConfig = JSON.parse(raw);

  for (const [pattern, destDir] of Object.entries(config.stage)) {
    const matches = resolveGlob(pattern);
    if (matches.length === 0) {
      continue;
    }

    const dest = join(outputDir, "runtime", destDir);
    mkdirSync(dest, { recursive: true });

    for (const match of matches) {
      if (statSync(match).isDirectory()) {
        cpSync(match, dest, { recursive: true });
      } else {
        copyFileSync(match, join(dest, basename(match)));
      }
    }
  }
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(`${outputDir}/runtime`, { recursive: true });

cpSync("node_modules/@effindomv2/runtime/dist", `${outputDir}/runtime/dist`, { recursive: true });
cpSync("node_modules/@effindomv2/runtime/dist/fonts", `${outputDir}/runtime/fonts`, { recursive: true });
stageProjectAssets(outputDir);
copyFileSync("node_modules/@effindomv2/runtime/dist/bridge.js", `${outputDir}/bridge.js`);
if (existsSync("node_modules/@effindomv2/runtime/dist/bridge.js.map")) {
  copyFileSync("node_modules/@effindomv2/runtime/dist/bridge.js.map", `${outputDir}/bridge.js.map`);
}
writeFileSync(
  `${outputDir}/effindom-runtime-config.js`,
  renderRuntimeConfig(),
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
copyFileSync("favicon.ico", `${outputDir}/favicon.ico`);
