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
