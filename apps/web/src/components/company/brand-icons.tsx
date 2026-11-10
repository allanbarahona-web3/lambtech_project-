import type { SVGProps } from "react";

type BrandIconProps = SVGProps<SVGSVGElement>;

export function FacebookIcon(props: BrandIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M13.7 21v-8h2.68l.4-3.12H13.7V7.89c0-.9.25-1.52 1.55-1.52h1.66V3.58A22.27 22.27 0 0 0 14.49 3c-2.4 0-4.04 1.46-4.04 4.15v2.73H7.75V13h2.7v8h3.25Z" fill="currentColor" />
    </svg>
  );
}

export function InstagramIcon(props: BrandIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <rect height="15" rx="4" stroke="currentColor" strokeWidth="1.8" width="15" x="4.5" y="4.5" />
      <circle cx="12" cy="12" r="3.35" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.65" cy="7.35" fill="currentColor" r="1" />
    </svg>
  );
}

export function LinkedInIcon(props: BrandIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M6.3 8.45H3.25V20.5H6.3V8.45ZM4.78 3.5a1.78 1.78 0 1 0 0 3.55 1.78 1.78 0 0 0 0-3.55ZM20.75 13.6c0-3.64-1.94-5.33-4.53-5.33-2.08 0-3.01 1.14-3.53 1.95V8.45H9.65V20.5h3.04v-5.97c0-1.58.3-3.1 2.25-3.1 1.92 0 1.95 1.8 1.95 3.2v5.87h3.05V13.6h.81Z" fill="currentColor" />
    </svg>
  );
}

export function TikTokIcon(props: BrandIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M14.55 4.1c.53 1.42 1.66 2.54 3.1 3.05.5.18 1.02.27 1.55.27v3.07a8.47 8.47 0 0 1-4.65-1.38v5.8A5.1 5.1 0 1 1 9.45 9.8c.32 0 .63.03.93.09v3.1a2.12 2.12 0 1 0 1.2 1.92V4.1h2.97Z" fill="currentColor" />
    </svg>
  );
}

export function WhatsAppIcon(props: BrandIconProps) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <path d="M12 3.2a8.79 8.79 0 0 0-7.49 13.4L3.5 20.8l4.34-1.1A8.8 8.8 0 1 0 12 3.2Z" fill="currentColor" />
      <path d="M8.9 7.45c.16-.36.32-.37.48-.37h.4c.12 0 .3.04.38.3l.68 1.63c.08.2.05.34-.04.48l-.32.45c-.1.12-.2.26-.08.48.12.22.54.9 1.16 1.45.8.72 1.48.94 1.7 1.05.22.1.34.08.47-.05l.62-.72c.14-.16.3-.13.5-.06l1.58.75c.22.1.36.16.4.25.04.1.04.57-.14 1.1-.18.54-1.04 1.03-1.43 1.08-.36.05-.82.07-1.32-.1-.3-.1-.67-.22-1.15-.43-.5-.22-2.1-.78-3.58-2.48-1.16-1.32-1.84-2.88-2.05-3.37-.22-.5-.02-.77.16-1.02l.46-.55Z" fill="#007e80" />
    </svg>
  );
}
