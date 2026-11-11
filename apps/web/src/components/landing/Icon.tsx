// Small inline icon set from Landing.dc.html (all decorative).

export type IconName = "spark" | "grid" | "pen" | "link" | "clock" | "check" | "pin" | "lines" | "mail" | "chevron";

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "spark":
      return (
        <svg {...common} stroke="none" fill="currentColor">
          <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common} strokeWidth={2}>
          <rect x="3" y="3" width="7" height="9" rx="2" />
          <rect x="14" y="3" width="7" height="5" rx="2" />
          <rect x="14" y="12" width="7" height="9" rx="2" />
          <rect x="3" y="16" width="7" height="5" rx="2" />
        </svg>
      );
    case "pen":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M4 20l4-1 11-11-3-3L5 16z" />
        </svg>
      );
    case "link":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2 2M9 2h6" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "lines":
      return (
        <svg {...common}>
          <path d="M4 5h16M4 12h10M4 19h7" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common} strokeWidth={2}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
  }
}
