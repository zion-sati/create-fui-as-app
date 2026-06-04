import { defineRoutedAppManifest, routeDef, routeHead } from "@effindomv2/fui-as/browser/routed-app-conventions";

export const sourceRouteBase = "";

export const routeManifest = defineRoutedAppManifest(sourceRouteBase, [
  routeDef("home", "Home", routeHead(
    "description", "Home page for the routed MVC starter.",
  )),
  routeDef("settings", "Settings", routeHead(
    "description", "Settings page for the routed MVC starter.",
  )),
]);

const routes = routeManifest.routes;
export const homeRouteConfig = routes[0];
export const settingsRouteConfig = routes[1];
