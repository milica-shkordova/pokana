import { useInvitation } from "../../engine/runtime";
import { pick } from "../../engine/format";
import { COPY } from "../copy";
import st from "../Template.module.scss";

export default function Overlay({ onDismiss }: { onDismiss: () => void }) {
  const { locale } = useInvitation();
  const copy = pick(COPY, locale);
  return (
    <div className={st["inv__overlay"]} onClick={onDismiss}>
      <div className={st["inv__overlay-circle"]}>
        <h1 className={st["inv__overlay-h1"]}>{copy.title}</h1>
        <img
          className={st["inv__overlay-img"]}
          src="https://res.cloudinary.com/dox8yqpts/image/upload/v1755779145/Your_paragraph_text_2_mzkvc4.png"
          alt=""
        />
        <span className={st["inv__overlay-hint"]}>{copy.hint}</span>
        <button type="button" className={st["inv__overlay-btn"]} onClick={onDismiss} autoFocus>
          {copy.cta}
        </button>
      </div>
    </div>
  );
}
