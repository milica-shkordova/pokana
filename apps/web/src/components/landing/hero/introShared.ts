import { CONFETTI_VARS, MEDIA } from "@pokanito/ui";
import { rnd } from "@/lib/random";

/**
 * Play the intro only once per browser tab? Off: it plays on every visit
 * (owner decision). Set to true to show the finished hero on repeat visits.
 */
export const REMEMBER_INTRO = false;

/** sessionStorage flag: the envelope intro was already played this session. */
export const INTRO_SEEN_KEY = "pokanito:hero-intro-seen";

/** Class on <html> while the intro is pending (set before hydration). */
export const INTRO_ARMED_CLASS = "lp-intro-armed";

/**
 * Inline script rendered with the hero. It runs while the HTML is parsed, so
 * the hero paints in its "sealed envelope" state instead of flashing the
 * finished hero before React hydrates. The class sits on <html> (outside
 * React's tree) to avoid a hydration mismatch. If the JS never takes over,
 * the class is removed after 5s and the static hero shows.
 */
export const INTRO_ARM_SCRIPT = `(function(){try{var d=document.documentElement;if(matchMedia(${JSON.stringify(MEDIA.reducedMotion)}).matches)return;if(${REMEMBER_INTRO}&&sessionStorage.getItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)}))return;d.classList.add(${JSON.stringify(INTRO_ARMED_CLASS)});setTimeout(function(){d.classList.remove(${JSON.stringify(
  INTRO_ARMED_CLASS,
)})},5000)}catch(e){}})();`;

export function readIntroSeen(): boolean {
  if (!REMEMBER_INTRO) return false;
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Private mode / blocked storage: the intro simply plays again next time.
  }
}

export interface BurstPiece {
  /** Direction (radians) and speed (px at 1440px wide) of the radial spread. */
  angle: number;
  speed: number;
  spin0: number;
  width: number;
  height: number;
  strip: boolean;
  color: string;
}

/** ~34 confetti pieces (dots + rounded strips), values from AnimHero.dc.html. */
export const BURST: BurstPiece[] = Array.from({ length: 34 }, (_, i) => {
  const strip = rnd(i, 3) > 0.55;
  const sz = 8 + rnd(i, 4) * 14;
  return {
    angle: rnd(i, 1) * Math.PI * 2,
    speed: 260 + rnd(i, 2) * 420,
    spin0: rnd(i, 6) * 360,
    width: Math.round((strip ? sz * 2.2 : sz) * 10) / 10,
    height: Math.round((strip ? sz * 0.7 : sz) * 10) / 10,
    strip,
    color: CONFETTI_VARS[i % 5],
  };
});
