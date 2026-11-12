export default function CardFoot({ title, text }: { title: string; text: string }) {
  return (
    <div className="ic-card__foot">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
