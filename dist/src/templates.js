import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FUI_AS_VERSION, RUNTIME_VERSION } from "./versions.js";
const TEMPLATE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "templates");
function collectTemplateFiles(root, relativePath = "") {
    const absolutePath = resolve(root, relativePath);
    const stats = statSync(absolutePath);
    if (stats.isFile()) {
        return new Map([[relativePath, readFileSync(absolutePath, "utf8")]]);
    }
    const output = new Map();
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
function replaceTemplateTokens(value, context) {
    return value
        .replaceAll("__PACKAGE_NAME__", context.packageName)
        .replaceAll("__PROJECT_NAME__", context.projectName)
        .replaceAll("__FUI_AS_VERSION__", FUI_AS_VERSION)
        .replaceAll("__RUNTIME_VERSION__", RUNTIME_VERSION);
}
export function createTemplateFiles(template, context) {
    const templateDirectory = resolve(TEMPLATE_ROOT, template);
    const files = collectTemplateFiles(templateDirectory);
    const output = new Map();
    for (const [filePath, contents] of files) {
        output.set(filePath, replaceTemplateTokens(contents, context));
    }
    return output;
}
