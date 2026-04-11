interface Props {
  onDismiss: () => void;
}

export default function Overlay({ onDismiss }: Props) {
  return (
    <div className="inv__overlay" onClick={onDismiss}>
      <div className="inv__overlay-circle">
        <h1 className="inv__overlay-h1">Ве покануваме</h1>
        <img
          className="inv__overlay-img"
          src="https://res.cloudinary.com/dox8yqpts/image/upload/v1755779145/Your_paragraph_text_2_mzkvc4.png"
          alt="Покана"
        />
        <span className="inv__overlay-hint">на нашиот посебен ден</span>
        <div className="inv__overlay-btn">Откриј ги деталите</div>
      </div>
    </div>
  );
}
