import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createProject } from "../src/scaffold.js";

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

void test("createProject writes hello-world scaffold including AssemblyScript tsconfig", () => {
  const root = mkdtempSync(join(tmpdir(), "create-fui-as-app-"));
  const target = join(root, "my-app");
  try {
    createProject({
      targetDirectory: target,
      projectName: "my-app",
    });

    const tsconfig = readJson(join(target, "tsconfig.json")) as {
      extends: string;
      include: string[];
      compilerOptions?: {
        paths?: Record<string, string[]>;
      };
    };
    assert.equal(tsconfig.extends, "assemblyscript/std/assembly.json");
    assert.deepEqual(tsconfig.include, ["src/**/*.ts"]);
    assert.deepEqual(tsconfig.compilerOptions?.paths?.["@effindomv2/fui-as/src/*"], [
      "./node_modules/@effindomv2/fui-as/src/*",
    ]);

    const packageJson = readJson(join(target, "package.json")) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
      allowScripts: Record<string, boolean>;
    };
    const shell = readFileSync(join(target, "index.html"), "utf8");
    assert.equal(typeof packageJson.scripts.dev, "string");
    assert.equal(typeof packageJson.scripts.build, "string");
    assert.equal(typeof packageJson.scripts.publish, "string");
    assert.equal(packageJson.scripts.build.includes("--build-mode debug"), true);
    assert.equal(packageJson.scripts["build:dev"].includes("--build-mode debug"), true);
    assert.equal(packageJson.scripts.publish.includes("--build-mode release"), true);
    assert.equal(packageJson.scripts.build.includes("--devtools-dom-mirror"), false);
    assert.equal(packageJson.scripts.publish.includes("--devtools-dom-mirror"), false);
    assert.equal(typeof packageJson.scripts["publish:stage"], "string");
    assert.equal(typeof packageJson.scripts["build:dev"], "string");
    assert.equal(typeof packageJson.scripts["build:wasm:dev"], "string");
    assert.equal(typeof packageJson.scripts.test, "string");
    assert.equal(typeof packageJson.scripts["generate:host"], "string");
    assert.equal(packageJson.scripts["publish:stage"], "tsx scripts/stage-publish.ts");
    assert.equal(packageJson.devDependencies.esbuild, "0.28.1");
    assert.equal(packageJson.allowScripts["esbuild@0.28.1"], true);
    assert.equal(readFileSync(join(target, "src", "HelloWorld.ts"), "utf8").includes("Hello world"), true);
    const appSource = readFileSync(join(target, "src", "App.ts"), "utf8");
    assert.equal(appSource.includes("createManagedApplication"), true);
    assert.equal(appSource.includes('Application.caption("my-app")'), true);
    assert.equal(readFileSync(join(target, "src", "HelloWorld.ts"), "utf8").includes("this.themeBinding.dispose()"), true);
    assert.equal(existsSync(join(target, ".npmrc")), false);
    assert.equal(existsSync(join(target, ".gitignore")), true);
    assert.equal(readFileSync(join(target, "README.md"), "utf8").includes("FUI-AS Hello World App"), true);
    const loadingOverlayBody = readFileSync(join(target, "loading-overlay-body.html"), "utf8");
    const loadingOverlayStyles = readFileSync(join(target, "loading-overlay-styles.html"), "utf8");
    assert.equal(shell.includes("{{LOADING_OVERLAY_BODY}}"), true);
    assert.equal(shell.includes("{{LOADING_OVERLAY_STYLES}}"), true);
    assert.equal(loadingOverlayBody.includes('data-effindom-loading-visual'), true);
    assert.equal(loadingOverlayBody.includes('__effindomLoadingBootstrap'), true);
    assert.equal(loadingOverlayBody.includes('Runtime assets'), true);
    assert.equal(loadingOverlayBody.includes('effindom-loading-progress'), true);
    assert.equal(loadingOverlayStyles.includes('@keyframes effindom-loading-frame'), true);
    assert.equal(loadingOverlayStyles.includes('user-select: none'), true);
    assert.equal(readFileSync(join(target, "scripts", "prepare-runtime.ts"), "utf8").includes("devToolsDomMirror"), false);
    assert.equal(readFileSync(join(target, "src", "fui", "Fui.ts"), "utf8").includes("@effindomv2/fui-as/src/Fui"), true);
    assert.deepEqual(
      (readJson(join(target, "src", "host", "tsconfig.json")) as { compilerOptions: { lib: string[] } }).compilerOptions.lib,
      ["ES2022", "DOM"],
    );
    assert.equal(readFileSync(join(target, "src", "host", "host-events.ts"), "utf8").includes("appHostEvents"), true);
    assert.equal(readFileSync(join(target, "src", "host", "host-services.ts"), "utf8").includes("appHostServices"), true);
    assert.equal(readFileSync(join(target, "src", "host", "generated", "HostEvents.ts"), "utf8").includes("onAppClockTick"), true);
    assert.equal(
      readFileSync(join(target, "src", "host", "generated", "HostEvents.ts"), "utf8").includes("Callback0"),
      false,
    );
    assert.equal(
      readFileSync(join(target, "src", "host", "generated", "HostServices.ts"), "utf8").includes("appClockNowUnixSeconds"),
      true,
    );
    assert.deepEqual(
      readFileSync(join(target, "favicon.ico")),
      readFileSync(join(process.cwd(), "templates", "hello", "favicon.ico")),
    );
    assert.equal(statSync(join(target, "favicon.ico")).size > 10_000, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

void test("createProject writes mvc scaffold when template is mvc", () => {
  const root = mkdtempSync(join(tmpdir(), "create-fui-as-app-"));
  const target = join(root, "my-mvc-app");
  try {
    createProject({
      targetDirectory: target,
      projectName: "my-mvc-app",
      template: "mvc",
    });

    const packageJson = readJson(join(target, "package.json")) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
      allowScripts: Record<string, boolean>;
    };
    assert.equal(typeof packageJson.scripts["build:wasm:home"], "string");
    assert.equal(typeof packageJson.scripts["build:wasm:settings"], "string");
    assert.equal(typeof packageJson.scripts.publish, "string");
    assert.equal(packageJson.scripts.build.includes("--build-mode debug"), true);
    assert.equal(packageJson.scripts["build:dev"].includes("--build-mode debug"), true);
    assert.equal(packageJson.scripts.publish.includes("--build-mode release"), true);
    assert.equal(packageJson.scripts.build.includes("--devtools-dom-mirror"), false);
    assert.equal(packageJson.scripts.publish.includes("--devtools-dom-mirror"), false);
    assert.equal(typeof packageJson.scripts["publish:stage"], "string");
    assert.equal(typeof packageJson.scripts["build:dev"], "string");
    assert.equal(typeof packageJson.scripts["build:wasm:dev"], "string");
    assert.equal(typeof packageJson.scripts["build:wasm:dev:home"], "string");
    assert.equal(typeof packageJson.scripts["build:wasm:dev:settings"], "string");
    assert.equal(typeof packageJson.scripts["generate:host"], "string");
    assert.equal(packageJson.scripts["publish:stage"], "tsx scripts/stage-publish.ts");
    assert.equal(packageJson.devDependencies.esbuild, "0.28.1");
    assert.equal(packageJson.allowScripts["esbuild@0.28.1"], true);
    assert.equal(
      readFileSync(join(target, "src", "routes", "home", "HomeController.ts"), "utf8").includes(
        "HomeController",
      ),
      true,
    );
    const homeAppSource = readFileSync(join(target, "src", "routes", "HomeApp.ts"), "utf8");
    const settingsAppSource = readFileSync(join(target, "src", "routes", "SettingsApp.ts"), "utf8");
    assert.equal(homeAppSource.includes("createManagedApplication"), true);
    assert.equal(homeAppSource.includes('Application.caption("my-mvc-app • Home")'), true);
    assert.equal(settingsAppSource.includes('Application.caption("my-mvc-app • Settings")'), true);
    assert.equal(readFileSync(join(target, "README.md"), "utf8").includes("FUI-AS MVC App"), true);
    assert.equal(readFileSync(join(target, "README.md"), "utf8").includes("new Worker("), true);
    assert.equal(readFileSync(join(target, "README.md"), "utf8").includes("Worker.start("), false);
    assert.equal(existsSync(join(target, "worker-manifest.json")), false);
    assert.equal(existsSync(join(target, ".npmrc")), false);
    assert.equal(existsSync(join(target, ".gitignore")), true);
    assert.equal(readFileSync(join(target, "scripts", "prepare-runtime.ts"), "utf8").includes("devToolsDomMirror"), false);
    assert.deepEqual(
      (readJson(join(target, "tsconfig.json")) as { compilerOptions: { paths: Record<string, string[]> } }).compilerOptions.paths["@effindomv2/fui-as/src/*"],
      ["./node_modules/@effindomv2/fui-as/src/*"],
    );
    assert.deepEqual(
      (readJson(join(target, "src", "host", "tsconfig.json")) as { compilerOptions: { lib: string[] } }).compilerOptions.lib,
      ["ES2022", "DOM"],
    );
    assert.equal(readFileSync(join(target, "src", "host", "host-events.ts"), "utf8").includes("appHostEvents"), true);
    assert.equal(readFileSync(join(target, "src", "host", "host-services.ts"), "utf8").includes("appHostServices"), true);
    assert.equal(readFileSync(join(target, "src", "fui", "Fui.ts"), "utf8").includes("@effindomv2/fui-as/src/Fui"), true);
    assert.equal(readFileSync(join(target, "src", "host", "generated", "HostEvents.ts"), "utf8").includes("onAppClockTick"), true);
    assert.equal(
      readFileSync(join(target, "src", "host", "generated", "HostEvents.ts"), "utf8").includes("Callback0"),
      false,
    );
    assert.equal(
      readFileSync(join(target, "src", "workers", "advanced_workers.ts"), "utf8").includes("input.length;"),
      false,
    );
    assert.equal(
      readFileSync(join(target, "src", "host", "generated", "HostServices.ts"), "utf8").includes("appClockNowUnixSeconds"),
      true,
    );
    const routeShell = readFileSync(join(target, "route-shell.html"), "utf8");
    assert.equal(routeShell.includes('class="app-shell"'), true);
    assert.equal(routeShell.includes('data-effindom-canvas-size-source'), true);
    const loadingOverlayBody = readFileSync(join(target, "loading-overlay-body.html"), "utf8");
    const loadingOverlayStyles = readFileSync(join(target, "loading-overlay-styles.html"), "utf8");
    assert.equal(routeShell.includes("{{LOADING_OVERLAY_BODY}}"), true);
    assert.equal(routeShell.includes("{{LOADING_OVERLAY_STYLES}}"), true);
    assert.equal(loadingOverlayBody.includes('data-effindom-loading-visual'), true);
    assert.equal(loadingOverlayBody.includes('__effindomLoadingBootstrap'), true);
    assert.equal(loadingOverlayBody.includes('Runtime assets'), true);
    assert.equal(loadingOverlayBody.includes('effindom-loading-progress'), true);
    assert.equal(loadingOverlayStyles.includes('@keyframes effindom-loading-frame'), true);
    assert.equal(loadingOverlayStyles.includes('user-select: none'), true);
    assert.deepEqual(
      readFileSync(join(target, "favicon.ico")),
      readFileSync(join(process.cwd(), "templates", "mvc", "favicon.ico")),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

void test("createProject fails on non-empty target directory", () => {
  const root = mkdtempSync(join(tmpdir(), "create-fui-as-app-"));
  const target = join(root, "existing-app");
  try {
    createProject({
      targetDirectory: target,
      projectName: "existing-app",
    });
    writeFileSync(join(target, "README.txt"), "occupied", "utf8");

    assert.throws(() =>
      { createProject({
        targetDirectory: target,
        projectName: "existing-app",
      }); },
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
