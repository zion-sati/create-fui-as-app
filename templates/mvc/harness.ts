import { startRoutedHarness, type HarnessExports, type RoutedHarnessRoute } from './src/fui/FuiBrowser';
import { appHostEvents } from './src/host/host-events';
import { appHostServices } from './src/host/host-services';
import { routeManifest } from './src/route-config';
import { buildRoutedHarnessRoutes } from '@effindomv2/fui-as/browser/routed-app-conventions';

type RouteExports = HarnessExports & {
  __runApp(): void;
  __disposeApp?(): void;
};

const routedRoutes: readonly RoutedHarnessRoute[] = buildRoutedHarnessRoutes(routeManifest, window.location.pathname);

startRoutedHarness<RouteExports>({
  shellId: 'fui-routes',
  routeBase: routedRoutes[0].routePath,
  routes: routedRoutes,
  recreateRuntimeOnWarmRouteSwap: true,
  run(exports): void {
    exports.__runApp();
  },
  onDispose(exports): void {
    exports.__disposeApp?.();
  },
  hostEvents: appHostEvents,
  hostServices: appHostServices,
});
