# FUI-AS MVC App

Your scaffolded multi-route FUI-AS app. Here's what's in it and how to work with it.

---

## Project structure

```
src/
  route-config.ts         — the single route manifest (start here)
  routes.ts               — route path helpers used by nav/UI code
  routes/
    HomeApp.ts            — home route entrypoint
    SettingsApp.ts        — settings route entrypoint
    home/                 — model, view, controller for home
    settings/             — model, view, controller for settings
    shared/               — shared nav components and helpers
  host/
    host-services.ts      — app-owned bridge contracts
    host-events.ts        — app-owned bridge events
harness.ts                — runtime boot wiring (you rarely touch this)
```

Auto-generated files (`src/host/generated/`) are hands-off — don't edit them directly, they get overwritten on rebuild.

---

## Typical workflow

**Adding behaviour to an existing page** — work inside the relevant route
folder. For home: `src/routes/home/`. Model, view, and controller are each
their own file.

**Adding a new route:**
1. Add an entry to `src/route-config.ts`
2. Create a matching folder under `src/routes/` with model, view, controller
3. Add a `*App.ts` entrypoint for the route
4. Add the route path helper to `src/routes.ts`

**Navigating between routes** in UI code:

```ts
import { navigate } from "@effindomv2/fui-as";

new Button("Settings").onClick(() => navigate(Routes.settings));
```

**Updating shared browser bridge capabilities** — edit `src/host/host-services.ts`
or `src/host/host-events.ts`, then regenerate:

```bash
npm run generate:host
```

---

## Build commands

```bash
npm run dev        # local dev server with fast debug builds
npm run publish    # optimised release build → published/
```

Each route builds to its own WASM module (`home.wasm`, `settings.wasm`).
Routes can be deployed and updated independently — they share the same cached
runtime but each route's app payload is just its own business logic.

Debug builds default the DevTools DOM Mirror to on-requested. Release builds
default it to disabled. Override `window.__effindomRuntime.devToolsDomMirror`
before the bridge loads if you want different behavior.

---

## Shipping assets (fonts, images)

Drop files into your project and declare them in `stage-assets.json`:

```json
{
  "stage": {
    "fonts/*.ttf": "fonts",
    "images/**":   "images"
  }
}
```

Files are copied into `public/runtime/` during `npm run build:assets` and
available at runtime as `/runtime/fonts/YourFont.ttf` etc. If
`stage-assets.json` is missing the build just skips this step silently.

---

## Advanced: Workers

Workers let you run long-running processing (parsing, computation, data
transforms) in the background without blocking the UI.

**Adding a worker:**
1. Create a worker module in `src/workers/` — use `advanced_workers.ts` as a
   reference
2. Register it in `src/worker-config.ts`
3. The existing `build:wasm:workers*` scripts will include the registered worker
4. Define any host services the worker needs in
   `src/host/worker-host-services.ts`, then regenerate:
   ```bash
   npm run generate:worker-host-services
   ```

Using a worker from any route:

```ts
const worker = new Worker("./advanced-workers.wasm", "largestPrimeCalculatorWorker")
  .onProgress(this, (view, event) => { ... })
  .onComplete(this, (view, event) => { ... })
  .onError(this, (view, event) => { ... });

worker.start("input-data");
```
