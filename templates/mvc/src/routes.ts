import { currentRoute } from "./fui/Fui";
import { routeManifest } from "./route-config";
import { resolveRoutePath } from "@effindomv2/fui-as/browser/routed-app-conventions";

export function homeRoute(): string {
  return resolveRoutePath(routeManifest, "home", currentRoute.value);
}

export function settingsRoute(): string {
  return resolveRoutePath(routeManifest, "settings", currentRoute.value);
}
