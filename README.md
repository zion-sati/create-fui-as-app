# EffinDom create-fui-as-app

> **`npx` scaffolder for FUI-AS apps. One command to a running EffinDom
> application.**

This is the standalone CLI package for bootstrapping new EffinDom FUI-AS
projects. It generates a complete project with build tooling, dev server, and
scaffolded application code.

For the full SDK, documentation, and feature matrix, see the main repo:
**[→ fui-as](https://github.com/zion-sati/fui-as)**

---

## Quickstart

```bash
npx @effindomv2/create-fui-as-app my-app
cd my-app
npm install
npm run dev
```

For the MVC starter with routing:

```bash
npx @effindomv2/fui-as-app my-mvc-app -- --template mvc
```

---

## What you get

- **`hello` template** (default) — single-page minimal app with a `HelloWorld`
  component, harness, and dev server.
- **`mvc` template** — two-page routed app with `HomeApp` and `SettingsApp`,
  shared route UI helpers, and a `ManagedApplicationController` base.
- TypeScript-style AssemblyScript compilation to WebAssembly.
- `generate:host*`, `dev`, `build`, and `test` scripts with watch rebuilds.
- `tsconfig.json` extending `assemblyscript/std/assembly.json` for IDE support.

---

## Repos

| Repo | Purpose |
|---|---|
| **[create-fui-as-app](https://github.com/zion-sati/create-fui-as-app)** | This repo — CLI scaffolder |
| **[fui-as](https://github.com/zion-sati/fui-as)** | AssemblyScript SDK + controls |
| **[EffinDOM](https://github.com/zion-sati/EffinDOM)** | Monorepo — runtime, engine, docs |

---

## License

MIT. See `LICENSE.md`.
