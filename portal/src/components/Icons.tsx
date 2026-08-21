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

const paths: Record<string, string> = {
  home: "M4 12 L12 4 L20 12 V20 H15 V14 H9 V20 H4 Z",
  id: "M4 6 H20 V18 H4 Z M7 10 H13 M7 13 H11",
  vote: "M5 17 H19 M8 17 V9 L12 6 L16 9 V17",
  people: "M8 10 A3 3 0 1 0 8 9.9 M16 10 A3 3 0 1 0 16 9.9 M4 18 C4 14 20 14 20 18",
  chest: "M4 8 H20 V18 H4 Z M4 8 L12 13 L20 8",
  coin: "M12 5 A7 7 0 1 0 12 19 A7 7 0 1 0 12 5 M9 12 H15",
  gear: "M10 4 H14 L15 7 L18 8 L19 12 L16 14 L15 17 H9 L8 14 L5 12 L6 8 L9 7 Z",
  out: "M10 5 H5 V19 H10 M10 12 H19 M15 8 L19 12 L15 16",
};

export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
}
