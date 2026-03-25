// Pure SVG icon library — no emojis
import React from 'react';

type P = { size?: number; className?: string; strokeWidth?: number };
const I = ({ size = 20, className = '', sw = 1.8, children }: { size?: number; className?: string; sw?: number; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);

export const IconBrush = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M9.06 11.9l8.07-8.07a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
    <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.99 2.02 5 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-4-2.85" />
  </I>
);

export const IconFill = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M19 11V9l-7-7L5 9v11a2 2 0 0 0 2 2h6" />
    <path d="M11 11V5" />
    <path d="M20.2 18a3 3 0 1 1-5.9-.9l2.7-5.1 2.7 5.1c.2.3.5 1.4.5 1z" />
  </I>
);

export const IconEraser = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
    <path d="M22 21H7" />
    <path d="m5 11 9 9" />
  </I>
);

export const IconUndo = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M3 7v6h6" />
    <path d="M3 13C5.1 8.2 10.1 5 15.5 5 20.3 5 24 8.7 24 13.5S20.3 22 15.5 22c-3.5 0-6.5-1.7-8.4-4.3" />
  </I>
);

export const IconRedo = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M21 7v6h-6" />
    <path d="M21 13C18.9 8.2 13.9 5 8.5 5 3.7 5 0 8.7 0 13.5S3.7 22 8.5 22c3.5 0 6.5-1.7 8.4-4.3" />
  </I>
);

export const IconTrash = ({ size, className }: P) => (
  <I size={size} className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </I>
);

export const IconSend = ({ size, className }: P) => (
  <I size={size} className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </I>
);

export const IconCheck = ({ size, className }: P) => (
  <I size={size} className={className}>
    <polyline points="20 6 9 17 4 12" />
  </I>
);

export const IconCopy = ({ size, className }: P) => (
  <I size={size} className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </I>
);

export const IconCrown = ({ size, className }: P) => (
  <I size={size} className={className} sw={1.5}>
    <path d="M2 20h20" />
    <path d="m4 20 2-10 6 5 6-5 2 10" />
    <circle cx="12" cy="6" r="2" />
    <circle cx="4" cy="10" r="1.5" />
    <circle cx="20" cy="10" r="1.5" />
  </I>
);

export const IconUsers = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </I>
);

export const IconUser = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </I>
);

export const IconSettings = ({ size, className }: P) => (
  <I size={size} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </I>
);

export const IconChat = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </I>
);

export const IconTimer = ({ size, className }: P) => (
  <I size={size} className={className}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6 12 12 16 14" />
  </I>
);

export const IconArrowLeft = ({ size, className }: P) => (
  <I size={size} className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </I>
);

export const IconArrowRight = ({ size, className }: P) => (
  <I size={size} className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </I>
);

export const IconPlay = ({ size, className }: P) => (
  <I size={size} className={className} sw={1.5}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </I>
);

export const IconRefresh = ({ size, className }: P) => (
  <I size={size} className={className}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </I>
);

export const IconLogout = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </I>
);

export const IconTrophy = ({ size, className }: P) => (
  <I size={size} className={className} sw={1.5}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </I>
);

export const IconSave = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </I>
);

export const IconPalette = ({ size, className }: P) => (
  <I size={size} className={className}>
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </I>
);

export const IconWifi = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 16 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </I>
);

export const IconWifiOff = ({ size, className }: P) => (
  <I size={size} className={className}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a11 11 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </I>
);

export const IconEye = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </I>
);

export const IconLink = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </I>
);

export const IconPen = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </I>
);

export const IconStar = ({ size, className }: P) => (
  <I size={size} className={className} sw={1.5}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </I>
);

export const IconZap = ({ size, className }: P) => (
  <I size={size} className={className} sw={1.5}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </I>
);

export const IconHome = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </I>
);

export const IconX = ({ size, className }: P) => (
  <I size={size} className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </I>
);

export const IconChevronRight = ({ size, className }: P) => (
  <I size={size} className={className}>
    <polyline points="9 18 15 12 9 6" />
  </I>
);

export const IconGamepad = ({ size, className }: P) => (
  <I size={size} className={className}>
    <line x1="6" y1="12" x2="10" y2="12" />
    <line x1="8" y1="10" x2="8" y2="14" />
    <line x1="15" y1="13" x2="15.01" y2="13" />
    <line x1="18" y1="11" x2="18.01" y2="11" />
    <rect x="2" y="6" width="20" height="12" rx="2" />
  </I>
);

export const IconBook = ({ size, className }: P) => (
  <I size={size} className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </I>
);
