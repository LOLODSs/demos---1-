const paths = {
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  urgent: (
    <>
      <path d="m12 3 9 17H3L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  print: (
    <>
      <path d="M7 8V3h10v5M7 17H4V9h16v8h-3" />
      <path d="M7 14h10v7H7zM16 11h1" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  northeast: (
    <>
      <path d="M6 18 18 6M6 6h12v12" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  down: <path d="m6 9 6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  phone: (
    <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z" />
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
  ),
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M5 3v5a5 5 0 0 0 10 0V3M3 3h4M13 3h4M10 13v3a5 5 0 0 0 10 0v-3" />
      <circle cx="20" cy="10" r="3" />
    </>
  ),
  scan: (
    <>
      <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M7 12h10M12 7v10" />
    </>
  ),
  cross: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" />,
  tooth: (
    <path d="M12 5c-3-3-8-2-8 3 0 3 2 4 2 8 0 6 3 6 4 0 .5-3 3.5-3 4 0 1 6 4 6 4 0 0-4 2-5 2-8 0-5-5-6-8-3Z" />
  ),
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      <path d="m20 2 .6 1.4L22 4l-1.4.6L20 6l-.6-1.4L18 4l1.4-.6L20 2Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 3C11 2 3 5 3 12a7 7 0 0 0 7 7c7 0 10-8 10-16Z" />
      <path d="M4 20 16 8M8 16v-5M12 12h5" />
    </>
  ),
  star: (
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  ),
  paw: (
    <>
      <ellipse cx="5" cy="9" rx="2" ry="3" transform="rotate(-20 5 9)" />
      <ellipse cx="10" cy="5" rx="2" ry="3" />
      <ellipse cx="16" cy="5" rx="2" ry="3" />
      <ellipse cx="21" cy="10" rx="2" ry="3" transform="rotate(20 21 10)" />
      <path d="M6 18c0-4 4-7 7-7s6 3 6 7-4 3-6 3-7 1-7-3Z" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4" r="2" />
      <path d="m7 21 3-7-1-5 4-2 3 5 4 1M10 14l5 3 1 4M9 9l-4 4" />
    </>
  ),
  car: (
    <>
      <path d="m5 7 2-4h10l2 4 2 3v8H3v-8l2-3ZM5 7h14M3 11h18M6 14h1M17 14h1M5 18v3M19 18v3" />
    </>
  ),
  zoom: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6M7 10h6M10 7v6" />
    </>
  ),
};
export default function Icon({ name, size = 22, className = "", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
export function Brand({ small = false }) {
  return (
    <span className={`brand ${small ? "brand--small" : ""}`}>
      <span className="brand__mark">
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <path
            d="M20 32V16M20 23C11 23 8 15 9 9c8 0 12 6 11 14ZM20 18C20 10 26 6 33 7c0 8-5 12-13 11Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="brand__text">
        ЛЕСНАЯ<small>ветеринарная клиника</small>
      </span>
    </span>
  );
}
