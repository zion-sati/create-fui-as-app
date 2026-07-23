import { copyFileSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FUI_AS_VERSION, RUNTIME_VERSION } from "./versions.js";

export type TemplateName = "hello" | "mvc";

export interface TemplateContext {
  readonly projectName: string;
  readonly packageName: string;
}

const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "templates");
const BINARY_TEMPLATE_FILES = new Set(["favicon.ico"]);
const SHARED_LOADING_OVERLAY_STYLES = readFileSync(resolve(TEMPLATE_ROOT, "loading-overlay-styles.html"), "utf8");
const SHARED_LOADING_OVERLAY_BODY = readFileSync(resolve(TEMPLATE_ROOT, "loading-overlay-body.html"), "utf8");

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
    if (BINARY_TEMPLATE_FILES.has(nestedRelativePath)) {
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

function outputPathForTemplate(filePath: string): string {
  return filePath === "gitignore" ? ".gitignore" : filePath;
}

export function createTemplateFiles(template: TemplateName, context: TemplateContext): Map<string, string> {
  const templateDirectory = resolve(TEMPLATE_ROOT, template);
  const files = collectTemplateFiles(templateDirectory);
  const output = new Map<string, string>();
  output.set("loading-overlay-styles.html", SHARED_LOADING_OVERLAY_STYLES);
  output.set("loading-overlay-body.html", SHARED_LOADING_OVERLAY_BODY);
  for (const [filePath, contents] of files) {
    const replaced = replaceTemplateTokens(contents, context);
    output.set(outputPathForTemplate(filePath), replaced);
  }
  return output;
}

export function copyTemplateBinaryAssets(template: TemplateName, destinationDirectory: string): void {
  for (const binaryFile of BINARY_TEMPLATE_FILES) {
    const sourcePath = resolve(TEMPLATE_ROOT, template, binaryFile);
    const destinationPath = resolve(destinationDirectory, binaryFile);
    copyFileSync(sourcePath, destinationPath);
  }
}
