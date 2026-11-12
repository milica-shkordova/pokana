import { eventUrl, type EventSummary } from "@pokanito/shared";
import { colors } from "@pokanito/ui";
import { WEB_URL } from "@/lib/api";
import { QR_SIZE } from "./constants";

/** QR code PNG for an invitation link, downloaded right away. */
export async function downloadQr(e: EventSummary) {
  const QRCode = (await import("qrcode")).default;
  const url = await QRCode.toDataURL(eventUrl(WEB_URL, e.slug), {
    width: QR_SIZE,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: colors.ink, light: colors.white },
  });
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.slug}-qr.png`;
  a.click();
}

/** Guest list as CSV (the API sends it as a download). */
export function exportGuests(e: EventSummary) {
  const a = document.createElement("a");
  a.href = `/api/admin/events/${e.id}/rsvps.csv`;
  a.download = `${e.slug}-guests.csv`;
  a.click();
}
