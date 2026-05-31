#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");

const fuiAsPackagePath = resolve(repoRoot, "v2/fui-as/package.json");
const createFuiAsVersionsPath = resolve(packageRoot, "src/versions.ts");
const ossExportTemplatePackagePath = resolve(
  repoRoot,
  "scripts/oss-export/templates/fui-as/package.json",
);

async function readJson(path: string): Promise<{ version?: unknown }> {
  return JSON.parse(await readFile(path, "utf8"));
}

async function writeIfChanged(path: string, content: string): Promise<void> {
  const current = await readFile(path, "utf8").catch(() => null);
  if (current === content) {
    return;
  }
  await writeFile(path, content);
}

const fuiAsPackage = await readJson(fuiAsPackagePath);
if (typeof fuiAsPackage.version !== "string" || fuiAsPackage.version.length === 0) {
  throw new Error(`Invalid version in ${fuiAsPackagePath}`);
}

const fuiAsVersion = fuiAsPackage.version;

await writeIfChanged(
  createFuiAsVersionsPath,
  `export const FUI_AS_VERSION = "${fuiAsVersion}";\nexport const RUNTIME_VERSION = "0.1.1";\n`,
);

const ossExportTemplatePackage = (await readJson(ossExportTemplatePackagePath)) as {
  version?: string;
  [key: string]: unknown;
};
if (ossExportTemplatePackage.version !== fuiAsVersion) {
  ossExportTemplatePackage.version = fuiAsVersion;
}

await writeIfChanged(
  ossExportTemplatePackagePath,
  `${JSON.stringify(ossExportTemplatePackage, null, 2)}\n`,
);
