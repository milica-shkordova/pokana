import { useMemo, useState } from "react";
import { templateRegistry } from "@/templates/registry";
import TemplateCard from "./TemplateCard";

export default function TemplateGallery() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(templateRegistry.map((t) => t.eventType)))],
    [],
  );
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <section className="landing__section landing__section--soft" id="gallery">
      <div className="landing__container">
        <div className="landing__section-head" data-reveal>
          <p className="landing__eyebrow">Templates</p>
          <h2 className="landing__heading">Pick your vibe</h2>
          <p className="landing__lede">
            More event types are on the way — reach out if you don&apos;t see
            yours yet, we&apos;d love to hear about it.
          </p>
        </div>

        <div className="landing__gallery-tabs" data-reveal>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`landing__gallery-tab${category === activeCategory ? " landing__gallery-tab--active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="landing__gallery">
          {templateRegistry.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              hidden={activeCategory !== "All" && template.eventType !== activeCategory}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
