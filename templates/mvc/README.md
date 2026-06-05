# MVC scaffold guide

This template scaffolds a multi-route FUI-AS app with explicit page-level MVC.

- `src/route-config.ts` is the single route manifest used by wasm builds, runtime prep, smoke checks, and routed harness.
- Route `title` now drives the browser tab/window title for each shell, and `routeHead("name", "content", ...)` from `@effindomv2/fui-as/browser/routed-app-conventions` can optionally add generic page metadata.
- `src/routes.ts` holds the route path helpers used by nav/UI code.
- `src/routes/HomeApp.ts` and `src/routes/SettingsApp.ts` are route app entrypoints.
- `src/routes/home/*` and `src/routes/settings/*` hold each route's model, view, and controller.
- `src/routes/shared/*` holds shared route UI primitives (for example nav pills/nav bar) and shared route helpers.
- `harness.ts` wires routed host boot, route table, and host-services/events registration from the route manifest.
- `route-shell.html` is the per-route host shell copied for each route path.
- `src/host/host-services.ts` and `src/host/host-events.ts` are app-owned bridge contracts; `src/host/generated/*` is generated output.

## Staging project assets

`stage-assets.json` is a convention-over-configuration manifest for copying project-owned files into `public/runtime/` during `npm run build:assets`. You should never need to edit `scripts/prepare-runtime.ts` — just drop files into your project and declare them here.

```json
{
  "stage": {
    "fonts/*.ttf": "fonts",
    "images/**":   "images"
  }
}
```

- **Keys** are **glob patterns** relative to the project root. Supported patterns:
  - `"*.ext"` — all files with a given extension in the project root.
  - `"dir/*.ext"` — all files matching the extension inside `dir/` (non-recursive).
  - `"dir/**"` — copy the entire `dir/` tree recursively.
- **Values** are the **destination subdirectory** under `public/runtime/`. The value can be a nested path like `"fonts/custom"` and directories are created automatically.
- The config is optional — if `stage-assets.json` is missing, the build script skips staging with no error.

For example, to ship custom fonts alongside the bundled Noto set:

1. Place your `.ttf` files in a `fonts/` directory at the project root.
2. Add `"fonts/*.ttf": "fonts"` to `stage-assets.json`.
3. Reference them in app code as `/runtime/fonts/YourFont.ttf`.

## Workers

Workers are compiled as separate WASM modules and loaded on demand via `Worker.start(...)`. The worker manifest lives at `src/worker-config.ts`; add entries there for each worker entrypoint.

### Adding a worker

1. Create a worker module in `src/workers/` (use `advanced_workers.ts` as a reference).
2. Register it in `src/worker-config.ts`.
3. Add build scripts in `package.json` (copy the `build:wasm:workers:advanced` pattern).
4. Define any host services the worker needs in `src/host/worker-host-services.ts`, then regenerate with `npm run generate:worker-host-services`.
5. Ensure `worker-host-services.ts` at the project root registers the services under `globalThis.__fuiWorkerHostServicesModule`.

The harness (`harness.ts`) already wires `workerHostServices` to `startRoutedHarness`. Workers are available from any route via:

```ts
const worker = Worker.start("advanced-workers")
  .onProgress(this, (view, message) => { ... })
  .onComplete(this, (view, result) => { ... })
  .onError(this, (view, message) => { ... });
worker.sendString("input-data");
```

## Routing + deployment model

Each route builds to its own wasm (`home.wasm`, `settings.wasm`) and is mounted by routed harness config. This is designed for true MFE slices: each route app can evolve and deploy independently while still sharing the same browser host/runtime contract.

The routed harness is optimized for fast navigation:

- route shells stay stable while route wasm swaps,
- warm route transitions can avoid full loading overlays,
- host bridge wiring is reused consistently across route apps.

## Typical workflow

1. Add/modify page behavior inside `home/` or `settings/` controllers/models/views.
2. Add new routes by updating `src/route-config.ts`, then add the matching route folder and `*App.ts` entrypoint.
3. Keep shared browser bridge capabilities in `src/host/*.ts`, then regenerate with `npm run generate:host`.
4. Use `npm run dev` for local routed iteration (uses debug AssemblyScript builds for faster rebuilds).
5. Use `npm run publish` for an optimized release build staged under `published/`.
