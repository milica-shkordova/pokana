interface Props {
  src: string;
  gsapId?: string;
}

export default function ImageBand({ src, gsapId }: Props) {
  return (
    <div className="inv__hero-image-wrap" data-gsap={gsapId}>
      <img className="inv__hero-img" src={src} alt="" />
      <div className="inv__hero-img-overlay" />
      <div className="inv__hero-img-fade" />
    </div>
  );
}
