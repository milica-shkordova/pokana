import { Fragment, type ReactNode } from "react";
import type { SectionKind } from "@pokanito/shared";
import { useInvitation } from "./runtime";
import { LanguageToggle, MusicButton, PreviewNotice } from "./components";

/**
 * Renders one section. `next()` returns the next number of a running count
 * (fresh on every render), for designs that number their sections.
 */
export type SectionRenderer = (next: () => number) => ReactNode;
export type SectionRenderers = Partial<Record<SectionKind, SectionRenderer>>;

interface TemplateShellProps {
  /** Rendered above the sections (it isn't a toggleable section). */
  hero: ReactNode;
  /** Section id → renderer; sections render in the event's order and only when enabled. */
  sections: SectionRenderers;
  /**
   * `phone` is the <main> column; `page` an optional full-width backdrop
   * around it. The theme's CSS variables go on the outermost element.
   */
  classes: { page?: string; phone: string };
  /** Rendered right after the preview notice (e.g. a tap-to-open splash). */
  splash?: ReactNode;
  /** Hides the floating music button (e.g. while the splash is up). */
  hideMusic?: boolean;
}

/** The common frame of every template: runtime controls, hero, then the enabled sections in order. */
export function TemplateShell({ hero, sections: render, classes, splash, hideMusic }: TemplateShellProps) {
  const { sections, themeStyle } = useInvitation();
  let n = 0;
  const next = () => ++n;
  const body = (
    <>
      <PreviewNotice />
      {splash}
      <LanguageToggle />
      {!hideMusic && <MusicButton />}
      {hero}
      {sections.map((id) => (
        <Fragment key={id}>{render[id]?.(next)}</Fragment>
      ))}
    </>
  );
  if (!classes.page) {
    return (
      <main className={classes.phone} style={themeStyle}>
        {body}
      </main>
    );
  }
  return (
    <div className={classes.page} style={themeStyle}>
      <main className={classes.phone}>{body}</main>
    </div>
  );
}
