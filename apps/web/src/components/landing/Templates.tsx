import { useState } from "react";
import type { TemplateSummary } from "@pokanito/shared";
import { SectionHeading, Tabs } from "@pokanito/ui";
import NotifyDialog from "./NotifyDialog";
import GalleryItem from "./gallery/GalleryItem";
import CardGrid from "./gallery/CardGrid";
import ComingSoon from "./gallery/ComingSoon";
import EmptyText from "./gallery/EmptyText";
import { useTemplateFilter } from "./gallery/useTemplateFilter";
import { useIframeMountQueue } from "./gallery/useIframeMountQueue";
import { useTemplateGallery } from "./gallery/useTemplateGallery";

/**
 * Templates — sideways gallery (HANDOFF-ANIMATIONS B4, AnimTemplates.dc.html).
 *
 * Every LIVE template is a phone showing its real demo page. Three modes via
 * gsap.matchMedia():
 * - desktop + motion: the section pins for 250% and the row of phones slides
 *   left with the scroll; the phone nearest the centre is focused (scaled,
 *   straight, its invitation scrolling inside it);
 * - < 1024px + motion: no pin; a native scroll-snap carousel, the centred phone
 *   focused via IntersectionObserver;
 * - reduced motion: the static card grid (CSS shows `.lp-gallery__grid` and
 *   hides the gallery; no JS animation at all).
 * Tab changes re-flow the phones with Flip. Filtered-out phones stay in the
 * DOM (display: none) so Flip can animate them out and back in.
 * The motion lives in gallery/useTemplateGallery.ts (desktopMode / mobileMode).
 */
export default function Templates({ templates }: { templates: TemplateSummary[] }) {
  const { filter, setFilter, tt, TABS, live, soon, match, visibleLive, visibleSoon, liveKey } =
    useTemplateFilter(templates);
  const [notifyFor, setNotifyFor] = useState<string | null>(null);
  const { mounted, requestMount } = useIframeMountQueue();
  const { root, viewportRef, stageRef, trackRef, barRef, onTab, onFrameLoad } = useTemplateGallery({
    liveKey,
    filter,
    setFilter,
    requestMount,
  });

  const emptyText = <EmptyText filter={filter} hasSoon={visibleSoon.length > 0} />;

  return (
    <section id="templates" ref={root} className="ui-section lp-gallery">
      <div className="lp-gallery__head">
        <SectionHeading
          data-reveal
          eyebrow={tt.eyebrow}
          title={tt.title}
          size="xl"
          lede={tt.lede}
        />
        <Tabs items={TABS} value={filter} onChange={onTab} variant="outline" align="center" aria-label={tt.tabsLabel} />
      </div>

      {/* Motion modes: the phone gallery. */}
      <div className="lp-gallery__viewport" ref={viewportRef}>
        <div className="lp-gallery__stage" ref={stageRef}>
          <div className="lp-gallery__track" ref={trackRef}>
            {live.map((t) => (
              <GalleryItem key={t.id} t={t} hidden={!match(t)} live={!!mounted[t.id]} onFrameLoad={onFrameLoad} />
            ))}
          </div>
        </div>
        {visibleLive.length === 0 && <div className="lp-gallery__empty">{emptyText}</div>}
      </div>

      {/* Phones / tablets: "swipe for more" hint under the carousel, always shown. */}
      <div className="lp-gallery__swipe" aria-hidden>
        <span>{tt.swipe}</span>
        <svg viewBox="0 0 60 20" fill="none">
          <path className="lp-gallery__swipe-line" pathLength={100} d="M2 12 C 14 4, 26 18, 38 10 C 44 6, 50 9, 56 10" />
          <path className="lp-gallery__swipe-head" pathLength={100} d="M49 4 L 57 10 L 49 16" />
        </svg>
      </div>

      {/* Reduced motion: the static card grid (Landing.dc.html). */}
      <div className="lp-gallery__grid">{visibleLive.length > 0 ? <CardGrid templates={visibleLive} /> : emptyText}</div>

      {visibleSoon.length > 0 && <ComingSoon templates={visibleSoon} onNotify={setNotifyFor} />}

      <div className="lp-gallery__progress" aria-hidden>
        <span ref={barRef} />
      </div>

      <NotifyDialog
        open={notifyFor !== null}
        onClose={() => setNotifyFor(null)}
        templates={soon}
        initialTemplateId={notifyFor ?? ""}
      />
    </section>
  );
}
