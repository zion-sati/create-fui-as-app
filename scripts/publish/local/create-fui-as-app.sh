#!/usr/bin/env bash

set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/lib/common.sh"

PACKAGE_DIR="${REPO_ROOT}/v2/create-fui-as-app"
if [ ! -f "${PACKAGE_DIR}/package.json" ]; then
  PACKAGE_DIR="${REPO_ROOT}"
fi
TEMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

log_step "Running @effindomv2/create-fui-as-app publish checks"
ensure_npm_deps "${PACKAGE_DIR}" "npm install --silent"
run_in_dir "${PACKAGE_DIR}" npm run lint
run_in_dir "${PACKAGE_DIR}" npm run typecheck
run_in_dir "${PACKAGE_DIR}" npm test
run_in_dir "${PACKAGE_DIR}" npm pack --dry-run >/dev/null

SCAFFOLD_DIR="${TEMP_DIR}/scaffold-smoke"
run_in_dir "${PACKAGE_DIR}" node dist/src/cli.js "${SCAFFOLD_DIR}"
SCAFFOLD_MVC_DIR="${TEMP_DIR}/scaffold-mvc-smoke"
run_in_dir "${PACKAGE_DIR}" node dist/src/cli.js "${SCAFFOLD_MVC_DIR}" --template mvc

if [ -d "${REPO_ROOT}/v2/fui-as" ] && [ -d "${REPO_ROOT}/v2/browser-bridge" ]; then
  runtime_tarball_name="$(run_in_dir "${REPO_ROOT}/v2/browser-bridge" npm pack --ignore-scripts --pack-destination "${TEMP_DIR}" | tail -n 1)"
  fui_as_tarball_name="$(run_in_dir "${REPO_ROOT}/v2/fui-as" npm pack --ignore-scripts --pack-destination "${TEMP_DIR}" | tail -n 1)"
  runtime_tarball="${TEMP_DIR}/${runtime_tarball_name}"
  fui_as_tarball="${TEMP_DIR}/${fui_as_tarball_name}"
  node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
const [packageJsonPath, fuiAsTarball, runtimeTarball] = process.argv.slice(1);
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.dependencies = Object.assign({}, packageJson.dependencies, {
  "@effindomv2/fui-as": `file:${fuiAsTarball}`,
  "@effindomv2/runtime": `file:${runtimeTarball}`,
});
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
' "${SCAFFOLD_DIR}/package.json" "${fui_as_tarball}" "${runtime_tarball}"
  node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
const [packageJsonPath, fuiAsTarball, runtimeTarball] = process.argv.slice(1);
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
packageJson.dependencies = Object.assign({}, packageJson.dependencies, {
  "@effindomv2/fui-as": `file:${fuiAsTarball}`,
  "@effindomv2/runtime": `file:${runtimeTarball}`,
});
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
' "${SCAFFOLD_MVC_DIR}/package.json" "${fui_as_tarball}" "${runtime_tarball}"
fi

log_step "Running scaffolded-app smoke build"
run_in_dir "${SCAFFOLD_DIR}" npm install --silent
run_in_dir "${SCAFFOLD_DIR}" npm audit --audit-level=low
run_in_dir "${SCAFFOLD_DIR}" npm run build
run_in_dir "${SCAFFOLD_DIR}" npm run test

log_step "Running scaffolded MVC app smoke build"
run_in_dir "${SCAFFOLD_MVC_DIR}" npm install --silent
run_in_dir "${SCAFFOLD_MVC_DIR}" npm audit --audit-level=low
run_in_dir "${SCAFFOLD_MVC_DIR}" npm run build
run_in_dir "${SCAFFOLD_MVC_DIR}" npm run test
