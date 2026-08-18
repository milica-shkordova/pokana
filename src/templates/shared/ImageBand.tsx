interface Props {
  src: string;
  gsapId?: string;
}

export default function ImageBand({ src, gsapId }: Props) {
  return (
    <div className="tpl-image-band" data-reveal data-gsap={gsapId}>
      <img className="tpl-image-band-img" src={src} alt="" />
      <div className="tpl-image-band-overlay" />
    </div>
  );
}
