import { useEffect, useLayoutEffect } from "react";

/** useLayoutEffect in the browser, useEffect on the server (where layout effects warn and never run). */
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
