import { SEAL_CONFETTI, SPECKS } from "./constants";
import { BURST } from "./introShared";

/** Confetti decorations behind the hero (Landing.dc.html). */
export function HeroDots() {
  return (
    <div className="lp-hero__dots" data-intro="dots" data-par="-10" aria-hidden>
      <span className="lp-hero__confetti lp-hero__confetti--1" />
      <span className="lp-hero__confetti lp-hero__confetti--2" />
      <span className="lp-hero__confetti lp-hero__confetti--3" />
      <span className="lp-hero__confetti lp-hero__confetti--4" />
      <span className="lp-hero__confetti lp-hero__confetti--5" />
      {SPECKS.map((p, i) => (
        <span
          key={i}
          className="lp-hero__speck"
          style={{
            left: `${p.left.toFixed(1)}%`,
            top: `${p.top.toFixed(1)}%`,
            width: p.w,
            height: p.h,
            borderRadius: p.strip ? 6 : "50%",
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Confetti around the envelope on the sealed screen. */
export function SealConfetti() {
  return (
    <div className="lp-seal-screen__confetti" data-intro-ui aria-hidden>
      {SEAL_CONFETTI.map((c, i) => (
        <span
          key={i}
          style={{
            left: c.left,
            top: c.top,
            width: c.w,
            height: c.h,
            borderRadius: c.h === c.w ? "50%" : 6,
            background: c.color,
            rotate: `${c.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

/** The intro's confetti burst (driven by hero/runIntro.ts). */
export function HeroBurst() {
  return (
    <div className="lp-hero__burst" data-intro="burst" data-par="-10" aria-hidden>
      {BURST.map((p, i) => (
        <span
          key={i}
          className="lp-hero__burst-piece"
          style={{
            width: p.width,
            height: p.height,
            marginLeft: -p.width / 2,
            marginTop: -p.height / 2,
            borderRadius: p.strip ? 6 : "50%",
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}
