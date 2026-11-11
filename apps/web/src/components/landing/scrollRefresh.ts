import { ScrollTrigger } from "gsap/ScrollTrigger";

let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Asks for one ScrollTrigger.refresh() soon. Calls within ~120ms collapse into
 * a single refresh: each one unpins every pinned section and re-measures the
 * whole page, so several back to back (fonts ready, language set, …) cost
 * long frames while the page is starting up.
 */
export function requestScrollRefresh() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    ScrollTrigger.refresh();
  }, 120);
}
