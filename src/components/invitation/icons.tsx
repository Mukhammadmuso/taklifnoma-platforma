/** Bir xil chiziq qalinligidagi (1.6) kichik ikonkalar. Rang: currentColor */
type P = { className?: string };
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconCopy = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </svg>
);

export const IconCheck = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </svg>
);

export const IconPin = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.8" r="2.3" />
  </svg>
);

export const IconCalendar = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </svg>
);

export const IconTelegram = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M20.5 4.5L3.8 11.1c-.8.3-.8 1.4.1 1.6l4.1 1.2 1.6 5c.2.7 1.1.9 1.6.3l2.3-2.4 4.2 3.1c.6.4 1.4.1 1.6-.6l2.6-12.6c.2-.9-.7-1.6-1.4-1.2z" />
    <path d="M8 13.9l9-6.4-6.9 7.7" />
  </svg>
);

export const IconPhone = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6.6 3.8l2.3-.3 1.6 4-1.9 1.4a11 11 0 0 0 6.5 6.5l1.4-1.9 4 1.6-.3 2.3a2.4 2.4 0 0 1-2.6 2.1C10.7 19 5 13.3 4.5 6.4a2.4 2.4 0 0 1 2.1-2.6z" />
  </svg>
);

export const IconSoundOn = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const IconSoundOff = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </svg>
);

export const IconChevronDown = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6.5 9.5l5.5 5.5 5.5-5.5" />
  </svg>
);

export const IconMinus = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M6 12h12" />
  </svg>
);

export const IconPlus = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M12 6v12M6 12h12" />
  </svg>
);
