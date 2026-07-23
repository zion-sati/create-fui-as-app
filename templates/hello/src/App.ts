import { Application, createManagedApplication } from "./fui/Fui";
import { HelloWorld } from "./HelloWorld";

export * from "./fui/FuiExports";
export * from "./host/generated/HostEvents";

const app = createManagedApplication<HelloWorld>(() => {
  Application.caption("__PROJECT_NAME__");
  return new HelloWorld();
});
app.useSystemTheme();
