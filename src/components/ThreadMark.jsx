export default function ThreadMark({ className = "" }) {
  return (
    <svg
      className={`thread-mark ${className}`}
      viewBox="0 0 320 90"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 62C48 62 48 22 96 22S144 70 193 70s55-48 121-48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="6" cy="62" r="4" fill="currentColor" />
      <circle cx="160" cy="60" r="5" fill="var(--amber)" />
      <circle cx="314" cy="22" r="4" fill="currentColor" />
    </svg>
  );
}
