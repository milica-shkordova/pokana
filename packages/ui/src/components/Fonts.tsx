// Brand fonts. Render inside <Head> of each app's pages/_document.tsx so the
// landing page, admin panel and templates all load the same families.
// Fredoka + Manrope are the brand fonts; Cormorant Garamond is kept for the
// template thumbnails and previews that use it.
export const FONT_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Caveat:wght@600;700&family=M+PLUS+Rounded+1c:wght@700;800&family=Nunito:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700;800&display=swap";

export function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_STYLESHEET} rel="stylesheet" />
    </>
  );
}
