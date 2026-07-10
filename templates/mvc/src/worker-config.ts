export interface WorkerEntry {
  readonly key: string;
  readonly entrypoint: string;
  readonly wasmFile: string;
}

export const workerEntries: readonly WorkerEntry[] = [
  {
    key: "advanced-workers",
    entrypoint: "src/workers/advanced_workers.ts",
    wasmFile: "advanced-workers.wasm",
  },
];
