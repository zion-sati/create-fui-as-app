import { appWorkerHostServices } from "./src/host/worker-host-services";

declare global {
  // eslint-disable-next-line no-var
  var __fuiWorkerHostServicesModule: Record<string, unknown> | undefined;
}

globalThis.__fuiWorkerHostServicesModule = {
  ...(globalThis.__fuiWorkerHostServicesModule ?? {}),
  appWorkerHostServices,
};
