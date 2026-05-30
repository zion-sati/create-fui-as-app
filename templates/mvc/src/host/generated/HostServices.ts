// Generated from the scaffold host-services definition.

@external("fui_host_service", "appClockNowUnixSeconds")
declare function __host_appClockNowUnixSeconds(): i32;

export function appClockNowUnixSeconds(): i32 {
  return __host_appClockNowUnixSeconds();
}
