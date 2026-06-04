# Hello World scaffold guide

This template is the smallest FUI-AS app shape:

- `src/App.ts` is the app entrypoint (`__runApp`) and where you compose your root retained UI tree.
- `src/HelloWorld.ts` is a simple feature module you can replace with your own screens/components.
- `harness.ts` boots the browser runtime and mounts the wasm app.
- `src/host/host-services.ts` and `src/host/host-events.ts` define app-owned JS bridge contracts.
- `src/host/generated/*` is generated from those host definition files.

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

## Typical workflow

1. Build UI from `src/App.ts` with controls/nodes from `./fui/Fui`.
2. Split real features into more files under `src/` and compose them in `App.ts`.
3. If browser-owned capabilities are needed (for example shell APIs), add definitions in `src/host/*.ts` and run `npm run generate:host`.
4. Run `npm run dev` while iterating (uses debug AssemblyScript builds for faster rebuilds).
5. Run `npm run publish` for an optimized release build staged under `published/`.

## Architecture intent

Use this template as a single-app baseline: one wasm, one harness, one mounted root tree. Keep UI composition in AssemblyScript and keep browser glue inside `harness.ts` + host bridge definitions.
