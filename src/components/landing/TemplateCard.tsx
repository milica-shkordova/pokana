import { TemplateMeta, eventTypeIcons } from "@/templates/registry";

interface Props {
  template: TemplateMeta;
  hidden?: boolean;
}

export default function TemplateCard({ template, hidden }: Props) {
  const isAvailable = template.status === "available";

  return (
    <div
      className={`landing__card${hidden ? " landing__card--hidden" : ""}`}
      data-reveal
    >
      <div className="landing__card-media">
        {template.previewImage ? (
          <img src={template.previewImage} alt={template.name} />
        ) : (
          <div className="landing__card-placeholder">
            {eventTypeIcons[template.eventType] ?? "✦"}
          </div>
        )}
        <span
          className={`landing__card-badge landing__card-badge--${isAvailable ? "available" : "soon"}`}
        >
          {isAvailable ? "Available" : "Coming soon"}
        </span>
      </div>
      <div className="landing__card-body">
        <span className="landing__card-eventtype">{template.eventType}</span>
        <h3 className="landing__card-title">{template.name}</h3>
        <p className="landing__card-desc">{template.description}</p>
        {isAvailable && template.demoSlug ? (
          <a className="landing__card-link" href={`/${template.demoSlug}`}>
            View live demo ↗
          </a>
        ) : (
          <span className="landing__card-soon-label">Notify me when ready</span>
        )}
      </div>
    </div>
  );
}
