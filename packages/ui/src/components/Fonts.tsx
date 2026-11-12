import { FONT_STYLESHEET } from "../tokens";

// Brand fonts. Render inside <Head> of each app's pages/_document.tsx so the
// landing page, admin panel and templates all load the same families
// (FONT_STYLESHEET in tokens.ts).
export function FontLinks() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_STYLESHEET} rel="stylesheet" />
    </>
  );
}
