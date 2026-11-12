import type { SVGProps } from "react";

// Line icons from the designs (24×24, stroke = currentColor). Admin set, one
// component per icon. The landing uses <Icon name="…"> (Icon.tsx).

const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
});

export const IconCalendar = () => (
  <svg {...base()}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M8 2v4M16 2v4M3 10h18" />
  </svg>
);
export const IconTemplates = () => (
  <svg {...base()}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);
export const IconChat = () => (
  <svg {...base()}>
    <path d="M4 4h16v12H8l-4 4z" />
  </svg>
);
export const IconImage = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);
export const IconSettings = () => (
  <svg {...base()}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </svg>
);
export const IconSearch = () => (
  <svg {...base(16)} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);
export const IconPlus = ({ size = 16 }: { size?: number }) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconUpload = ({ size = 16 }: { size?: number }) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
  </svg>
);
export const IconBack = () => (
  <svg {...base()} strokeWidth={2}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const IconPhone = () => (
  <svg {...base(16)} strokeWidth={2}>
    <rect x="7" y="2" width="10" height="20" rx="2" />
  </svg>
);
export const IconDesktop = () => (
  <svg {...base(16)} strokeWidth={2}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8" />
  </svg>
);
export const IconCheck = () => (
  <svg {...base(16)} strokeWidth={2.4}>
    <path d="M5 12l5 5L20 7" />
  </svg>
);
export const IconAlert = () => (
  <svg {...base(16)} strokeWidth={2.4}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16v.5" />
  </svg>
);
export const IconMail = () => (
  <svg {...base(16)} strokeWidth={2}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const IconMusic = ({ size = 28 }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
export const IconUp = () => (
  <svg {...base(16)} strokeWidth={2}>
    <path d="M6 15l6-6 6 6" />
  </svg>
);
export const IconDown = () => (
  <svg {...base(16)} strokeWidth={2}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

// Row menu / confirm dialog icons.
export const IconEdit = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </svg>
);
export const IconExternal = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);
export const IconEye = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconLink = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4L12 5.6" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
  </svg>
);
export const IconQr = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
  </svg>
);
export const IconDownload = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
  </svg>
);
export const IconCopy = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
  </svg>
);
export const IconPause = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M9 5v14M15 5v14" />
  </svg>
);
export const IconArchive = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <rect x="3" y="4" width="18" height="5" rx="1" />
    <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
  </svg>
);
export const IconRestore = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
export const IconTrash = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const IconInstagram = ({ size }: { size?: number }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);
