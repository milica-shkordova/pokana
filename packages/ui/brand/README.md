# Pokanito brand assets

Rebuilt as vectors from the final logo. Replaces every Pokanito asset.

## Files

| File | Use |
|---|---|
| `pokanito-logo.svg` | Main logo (P + wordmark), on light backgrounds. Header, emails, admin sidebar. |
| `pokanito-logo-on-dark.svg` | Main logo with a cream wordmark, on plum/dark backgrounds. Footer, dark sections. |
| `pokanito-logo-mono-plum.svg` / `-mono-white.svg` | One-colour logo for print, stamps, watermarks, places where gradients can't be used. |
| `pokanito-mark.svg` | The P on its own. Logo flight in the hero, loaders, social avatar, footer mark. |
| `pokanito-mark-mono-plum.svg` / `-mono-white.svg` | One-colour P. |
| `pokanito-wordmark.svg` / `-on-dark.svg` | Wordmark only, when the P is already shown nearby. |
| `wax-seal.svg` | The envelope seal with the P pressed in (120 × 120). Replaces `wax-seal-pressed.svg` / `brand/wax-seal.svg`. Use it for both halves of the break animation (same clip-paths as before). |
| `seal-crack.svg` | Crack overlay for the seal break, colours matched to the new wax. |
| `app-icon.svg` / `app-icon-dark.svg` | Square app icon (1024 artboard, rounded corners) on blush or plum. |
| `favicon.svg`, `favicon.ico` | Browser tab icon (P on transparent). |
| `png/` | PNG exports: logo 600 / 1200 / 2400, logo on dark, mark 512 / 1024, wax seal 512, app icons 1024 / 512 / 192, `apple-touch-icon.png` (180), favicons 16 / 32 / 48, `og-image-1200x630.png` for link previews (Viber, WhatsApp, Facebook). |

## Colours

| Name | Hex | Use |
|---|---|---|
| Plum ink | `#350F1F` | Wordmark, headings, body text on light |
| Tangerine | `#FF5606` | The dot, primary buttons, links |
| Flame | `#E8460C` | Top-left of the P, hover on tangerine |
| Ember | `#B92E10` | Deep shading, pressed states |
| Coral pink | `#FF8486` | Bowl of the P, soft accents |
| Peach | `#FFD9B8` | Fold highlight, tints |
| Sunshine | `#FFBA34` | Lower stem of the P, highlights |
| Blush cream | `#FDF0EB` | Page backgrounds, app icon background |

The P gradients (in `pokanito-mark.svg`):
- Top flap: `#FF5A06 → #E8460C → #B92E10`
- Pink band: `#FFD9B8 → #FFB8A0 → #FF8486`
- Orange band: `#FFBA34 → #FF8A1C → #F05C12 → #D2400E`, darker rim on the right
- Bottom fold: `#B52E16 → #E8601A → #FF8A22`

## Wordmark font
The wordmark is outlined (paths), so no font is needed to show the logo. For UI text in the same spirit, use a rounded geometric sans. Pick one that supports Cyrillic for the MK version (for example Nunito or Comfortaa).

## Rules
- Clear space around the logo: at least the height of the "o".
- Minimum size: logo 96 px wide on screen; P alone 16 px (favicon).
- Don't recolour the P gradients, stretch, rotate, or add shadows. Use the mono versions when colour isn't possible.
- On photos, place the logo on a blush or plum panel, not directly on the image.

## Swapping from Pokanito
| Old | New |
|---|---|
| `pokanito-logo.svg` | `pokanito-logo.svg` |
| `pokanito-mark.svg` (M) | `pokanito-mark.svg` (P) |
| `wax-seal.svg` / `wax-seal-pressed.svg` | `wax-seal.svg` (new) |
| `postmark.svg` | Change the ring text from "POKANITO" to "POKANITO" |
| Text "Pokanito" | "Pokanito" (keep it capitalised in sentences, lowercase only in the logo) |
