export * from "../fui/FuiExports";
export * from "../host/generated/HostEvents";

import { Application, createManagedApplication } from "../fui/Fui";
import { HomeController } from "./home/HomeController";

const app = createManagedApplication<HomeController>(() => new HomeController());
app.useSystemTheme();

export function __runApp(): void {
  Application.caption("__PROJECT_NAME__ • Home");
  app.run();
}

export function __disposeApp(): void {
  app.dispose();
}
