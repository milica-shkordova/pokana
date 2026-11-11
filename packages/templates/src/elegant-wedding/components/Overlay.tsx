import { useInvitation } from "../../engine/runtime";

const COPY = {
  mk: { title: "Ве покануваме", hint: "на нашиот посебен ден", cta: "Откриј ги деталите" },
  en: { title: "You're invited", hint: "to our special day", cta: "See the details" },
};

export default function Overlay({ onDismiss }: { onDismiss: () => void }) {
  const { locale } = useInvitation();
  const copy = COPY[locale];
  return (
    <div className="inv__overlay" onClick={onDismiss}>
      <div className="inv__overlay-circle">
        <h1 className="inv__overlay-h1">{copy.title}</h1>
        <img
          className="inv__overlay-img"
          src="https://res.cloudinary.com/dox8yqpts/image/upload/v1755779145/Your_paragraph_text_2_mzkvc4.png"
          alt=""
        />
        <span className="inv__overlay-hint">{copy.hint}</span>
        <button type="button" className="inv__overlay-btn" onClick={onDismiss} autoFocus>
          {copy.cta}
        </button>
      </div>
    </div>
  );
}
