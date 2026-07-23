export * from "../fui/FuiExports";
export * from "../host/generated/HostEvents";

import { Application, createManagedApplication } from "../fui/Fui";
import { SettingsController } from "./settings/SettingsController";

const app = createManagedApplication<SettingsController>(() => new SettingsController());
app.useSystemTheme();

export function __runApp(): void {
  Application.caption("__PROJECT_NAME__ • Settings");
  app.run();
}

export function __disposeApp(): void {
  app.dispose();
}
