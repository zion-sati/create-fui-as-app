import { createManagedApplication } from "./fui/Fui";
import { HelloWorld } from "./HelloWorld";

export * from "./fui/FuiExports";
export * from "./host/generated/HostEvents";

const app = createManagedApplication<HelloWorld>(() => new HelloWorld());
app.useSystemTheme();
