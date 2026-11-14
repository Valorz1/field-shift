// A drawn patchwork of fields seen from above, used behind the start page heading.
// It is an illustration, not satellite imagery. The same pattern draws every time (fixed seed).

const COLS = 9;
const ROWS = 6;
const W = 900;
const H = 520;
const FIELD_COLOURS = ["#688a4e", "#7a8f52", "#b9a777", "#6f9460", "#93744f", "#8c9c5a", "#a8905f", "#c8b98a", "#5e7f4b", "#4f7a4c"];

const random = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Grid corners, nudged a little so the fields look hand-drawn rather than square.
const corner = (c: number, r: number): [number, number] => {
  const edge = c === 0 || c === COLS || r === 0 || r === ROWS;
  const jitter = (seed: number) => (edge ? 0 : (random(seed) - 0.5) * 34);
  return [(c / COLS) * W + jitter(c * 31 + r * 7), (r / ROWS) * H + jitter(c * 13 + r * 29)];
};

const fields = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  const points = [corner(c, r), corner(c + 1, r), corner(c + 1, r + 1), corner(c, r + 1)];
  const [x0, y0] = points[0];
  const [x2, y2] = points[2];
  const rows = random(i + 101) > 0.55; // some fields show crop rows
  return {
    key: i,
    points: points.map((p) => p.join(",")).join(" "),
    fill: FIELD_COLOURS[Math.floor(random(i + 7) * FIELD_COLOURS.length)],
    rows: rows ? [0.3, 0.55, 0.8].map((t) => ({ x1: x0 + 6, x2: x2 - 6, y: y0 + (y2 - y0) * t })) : [],
  };
});

export function FieldIllustration({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={className}>
      <rect width={W} height={H} fill="#2e3b2a" />
      {fields.map((field) => (
        <g key={field.key}>
          <polygon points={field.points} fill={field.fill} stroke="#2e3b2a" strokeWidth={4} />
          {field.rows.map((row) => (
            <line key={row.y} x1={row.x1} x2={row.x2} y1={row.y} y2={row.y} stroke="#2e3b2a" strokeOpacity={0.35} strokeWidth={2} />
          ))}
        </g>
      ))}
      <path d="M-10 150 C 140 180, 220 70, 360 130 S 560 300, 660 260 S 820 360, 910 330" fill="none" stroke="#2e3b2a" strokeWidth={18} />
      <path d="M-10 150 C 140 180, 220 70, 360 130 S 560 300, 660 260 S 820 360, 910 330" fill="none" stroke="#4e86a8" strokeWidth={10} />
      <path d="M290 -10 L 380 230 L 350 530" fill="none" stroke="#dcd2bb" strokeWidth={3} />
    </svg>
  );
}
