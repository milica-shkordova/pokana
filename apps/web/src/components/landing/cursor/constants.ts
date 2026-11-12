// Only elements that ask for a label (data-cursor="…") turn the ring into a
// pill; plain links and buttons keep the ring (no generic "Open" tooltip).
export const INTERACTIVE = "[data-cursor]:not([data-cursor=''])";
