# FUI-AS Hello World App

Your scaffolded FUI-AS app. Two files, one WASM, no framework tax.

---

## Project structure

```
src/
  App.ts              — entry point, builds your root UI tree
  HelloWorld.ts       — your first screen, replace this with your own
  host/
    host-services.ts  — app-owned JS bridge contracts
    host-events.ts    — app-owned JS bridge events
harness.ts            — runtime boot wiring (you rarely touch this)
```

Auto-generated files (`src/host/generated/`) are hands-off — they get
overwritten on rebuild.

---

## Typical workflow

**Start here:** open `src/HelloWorld.ts` and replace it with your own UI.
Compose controls and layout nodes imported from `@effindomv2/fui-as`.

**As your app grows:** split screens and components into more files under
`src/` and compose them in `App.ts`. When things get complex enough to need
routing between pages, consider switching to the MVC template:

```bash
npx @effindomv2/create-fui-as-app my-app --template mvc
```

**If you need browser capabilities** (shell APIs, file access, etc.) — add
definitions in `src/host/host-services.ts` or `src/host/host-events.ts`,
then regenerate:

```bash
npm run generate:host
```

---

## Build commands

```bash
npm run dev        # dev server with watch + fast debug recompile
npm run publish    # optimised release build → published/
```

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
`stage-assets.json` is missing the build skips this step silently.
