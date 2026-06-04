import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FUI_AS_VERSION, RUNTIME_VERSION } from "./versions.js";

export type TemplateName = "hello" | "mvc";

export interface TemplateContext {
  readonly projectName: string;
  readonly packageName: string;
}

const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "templates");
const SHARED_LOADING_OVERLAY_STYLES = `.effindom-loading-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.72), rgba(10, 20, 34, 0.82));
  backdrop-filter: blur(10px);
  z-index: 2;
}

.effindom-loading-overlay[hidden] {
  display: none;
}

.effindom-loading-card {
  max-width: 420px;
  padding: 22px 24px;
  border: 1px solid rgba(148, 163, 184, 0.32);
  border-radius: 18px;
  background: rgba(6, 12, 21, 0.80);
  text-align: center;
  box-shadow: 0 18px 48px rgba(2, 6, 23, 0.30);
}

.effindom-loading-overlay[data-state="error"] .effindom-loading-card {
  border-color: rgba(248, 113, 113, 0.50);
  background: rgba(69, 10, 10, 0.78);
}

.effindom-loading-kicker {
  margin: 0 0 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7dd3fc;
}

.effindom-loading-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
}

.effindom-loading-detail {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: #cbd5e1;
}`;
const SHARED_LOADING_OVERLAY_BODY = `<div
  class="effindom-loading-overlay"
  id="effindom-loading-overlay"
  data-state="loading"
  aria-live="polite"
  aria-hidden="true"
  hidden>
  <div class="effindom-loading-card">
    <p class="effindom-loading-kicker">EffinDom backstage</p>
    <h2 class="effindom-loading-title" id="effindom-loading-title">Teaching the pixels their lines...</h2>
    <p class="effindom-loading-detail" id="effindom-loading-detail">The runtime orchestra is tuning up behind the canvas.</p>
  </div>
</div>`;

function collectTemplateFiles(root: string, relativePath = ""): Map<string, string> {
  const absolutePath = resolve(root, relativePath);
  const stats = statSync(absolutePath);
  if (stats.isFile()) {
    return new Map<string, string>([[relativePath, readFileSync(absolutePath, "utf8")]]);
  }

  const output = new Map<string, string>();
  for (const entry of readdirSync(absolutePath)) {
    const nestedRelativePath = relativePath.length === 0 ? entry : `${relativePath}/${entry}`;
    const nestedAbsolutePath = resolve(root, nestedRelativePath);
    const nestedStats = statSync(nestedAbsolutePath);
    if (nestedStats.isDirectory()) {
      const nestedFiles = collectTemplateFiles(root, nestedRelativePath);
      for (const [filePath, contents] of nestedFiles) {
        output.set(filePath, contents);
      }
      continue;
    }
    output.set(nestedRelativePath, readFileSync(nestedAbsolutePath, "utf8"));
  }
  return output;
}

function replaceTemplateTokens(value: string, context: TemplateContext): string {
  return value
    .replaceAll("__PACKAGE_NAME__", context.packageName)
    .replaceAll("__PROJECT_NAME__", context.projectName)
    .replaceAll("__FUI_AS_VERSION__", FUI_AS_VERSION)
    .replaceAll("__RUNTIME_VERSION__", RUNTIME_VERSION);
}

function expandSharedLoadingOverlay(value: string): string {
  return value
    .replaceAll("{{LOADING_OVERLAY_STYLES}}", SHARED_LOADING_OVERLAY_STYLES)
    .replaceAll("{{LOADING_OVERLAY_BODY}}", SHARED_LOADING_OVERLAY_BODY);
}

export function createTemplateFiles(template: TemplateName, context: TemplateContext): Map<string, string> {
  const templateDirectory = resolve(TEMPLATE_ROOT, template);
  const files = collectTemplateFiles(templateDirectory);
  const output = new Map<string, string>();
  for (const [filePath, contents] of files) {
    const replaced = replaceTemplateTokens(contents, context);
    output.set(filePath, filePath.endsWith(".html") ? expandSharedLoadingOverlay(replaced) : replaced);
  }
  return output;
}
