export function Ornament({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" aria-hidden>
      <g stroke="#8B1D1D" strokeWidth="6" strokeLinecap="square">
        <path d="M80 12 L80 148 M12 80 L148 80" />
        <path d="M32 32 L128 128 M128 32 L32 128" />
        <rect x="52" y="52" width="56" height="56" />
        <path d="M80 28 L96 48 L80 40 L64 48 Z" fill="#8B1D1D" stroke="none" />
        <path d="M80 132 L96 112 L80 120 L64 112 Z" fill="#8B1D1D" stroke="none" />
        <path d="M28 80 L48 64 L40 80 L48 96 Z" fill="#8B1D1D" stroke="none" />
        <path d="M132 80 L112 64 L120 80 L112 96 Z" fill="#8B1D1D" stroke="none" />
      </g>
    </svg>
  );
}

export type IconName =
  | "home"
  | "id"
  | "vote"
  | "people"
  | "chest"
  | "coin"
  | "gear"
  | "out"
  | "shield"
  | "wallet"
  | "law"
  | "apps";

/** Stroke icons — readable at 18–24px in bottom nav. */
export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {name === "home" ? (
        <>
          <path d="M4 11.5 12 4l8 7.5" />
          <path d="M7 10.5V20h10v-9.5" />
        </>
      ) : null}
      {name === "id" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="12" r="2" />
          <path d="M14 10h5M14 14h4" />
        </>
      ) : null}
      {name === "vote" ? (
        <>
          <path d="M12 3v12" />
          <path d="m8 7 4-4 4 4" />
          <path d="M5 21h14" />
          <path d="M8 21V15h8v6" />
        </>
      ) : null}
      {name === "people" ? (
        <>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
          <path d="M14.5 19c.3-2 2-3.5 4.5-3.5 1.2 0 2.3.4 3 1" />
        </>
      ) : null}
      {name === "chest" ? (
        <>
          <path d="M4 9h16v10H4z" />
          <path d="M4 9 12 14l8-5" />
          <path d="M12 14v5" />
        </>
      ) : null}
      {name === "coin" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M9.5 9.5c.8-1 2-1.5 2.5-1.5s1.7.5 2.5 1.5M9.5 14.5c.8 1 2 1.5 2.5 1.5s1.7-.5 2.5-1.5" />
        </>
      ) : null}
      {name === "gear" ? (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v2.5M12 18.5V21M4.9 6.5l1.8 1.8M17.3 15.7l1.8 1.8M3 12h2.5M18.5 12H21M4.9 17.5l1.8-1.8M17.3 8.3l1.8-1.8" />
        </>
      ) : null}
      {name === "out" ? (
        <>
          <path d="M10 5H5v14h5" />
          <path d="M14 12H5" />
          <path d="m16 8 4 4-4 4" />
        </>
      ) : null}
      {name === "shield" ? (
        <>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3z" />
          <path d="m9 12 2 2 4-4" />
        </>
      ) : null}
      {name === "wallet" ? (
        <>
          <path d="M3 7h15a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2V7z" />
          <path d="M3 7V5a2 2 0 0 1 2-2h11" />
          <circle cx="17" cy="13.5" r="1" fill="currentColor" stroke="none" />
        </>
      ) : null}
      {name === "law" ? (
        <>
          <path d="M12 3v18" />
          <path d="M5 7h14" />
          <path d="m7 7 2 8h6l2-8" />
          <path d="M8 21h8" />
        </>
      ) : null}
      {name === "apps" ? (
        <>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </>
      ) : null}
    </svg>
  );
}
