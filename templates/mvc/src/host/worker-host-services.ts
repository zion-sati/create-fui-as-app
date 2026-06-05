import { defineHostServices, hostService } from "@effindomv2/fui-as/browser/host-services";

export const appWorkerHostServices = defineHostServices({
  appWorkerClock: {
    wallClockSinceEpochMs: hostService({
      args: [] as const,
      returns: "f64",
      implementation() {
        return Date.now();
      },
    }),
  },
});
