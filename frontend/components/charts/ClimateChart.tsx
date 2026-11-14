import { Card } from "@/components/ui/Card";

export type MonthPoint = { value: number; usual: number; low: number; high: number };

type ClimateChartProps = {
  id: string;
  title: string;
  definition: string;
  mark: "line" | "bars";
  unit: string;
  digits: number;
  tickStep: number;
  fromZero?: boolean;
  points: MonthPoint[];
  year: string;
  usualYears: string;
  source: string;
  note?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WIDTH = 340;
const HEIGHT = 210;
const MARGIN = { top: 12, right: 6, bottom: 22, left: 46 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const SLOT = PLOT_W / 12;

const markStyles = {
  line: { stroke: "stroke-primary", fill: "fill-primary" },
  bars: { stroke: "stroke-water", fill: "fill-water" },
};

const formatNumber = (value: number, digits: number) =>
  `${value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`;

const range = (start: number, end: number, step: number) =>
  Array.from({ length: Math.round((end - start) / step) + 1 }, (_, index) => start + index * step);

const topRoundedBar = (x: number, y: number, width: number, height: number) => {
  const r = Math.min(3, width / 2, height);
  return `M${x},${y + height}V${y + r}Q${x},${y} ${x + r},${y}H${x + width - r}Q${x + width},${y} ${x + width},${y + r}V${y + height}Z`;
};

function Legend({ mark, year }: Pick<ClimateChartProps, "mark" | "year">) {
  const style = markStyles[mark];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-base text-ink">
      <li className="flex items-center gap-2">
        <svg aria-hidden="true" width="20" height="12" viewBox="0 0 20 12">
          {mark === "line" ? (
            <line x1="1" y1="6" x2="19" y2="6" strokeWidth="2.5" strokeLinecap="round" className={style.stroke} />
          ) : (
            <rect x="5" y="1" width="10" height="11" rx="2" className={style.fill} />
          )}
        </svg>
        {year}
      </li>
      <li className="flex items-center gap-2">
        <svg aria-hidden="true" width="20" height="12" viewBox="0 0 20 12">
          <line x1="1" y1="6" x2="19" y2="6" strokeWidth="1.5" strokeDasharray="4 3" className="stroke-caption" />
        </svg>
        Usual
      </li>
      <li className="flex items-center gap-2">
        <svg aria-hidden="true" width="20" height="12" viewBox="0 0 20 12">
          <rect x="1" y="1" width="18" height="10" rx="2" className="fill-sage/35" />
        </svg>
        Usual range
      </li>
    </ul>
  );
}

function DataTable({ title, points, unit, digits, year, usualYears }: ClimateChartProps) {
  return (
    <div className="sr-only">
    <table>
      <caption>{title}</caption>
      <thead>
        <tr>
          <th scope="col">Month</th>
          <th scope="col">
            {year} ({unit})
          </th>
          <th scope="col">
            Usual, {usualYears} average ({unit})
          </th>
          <th scope="col">
            {usualYears} lowest to highest ({unit})
          </th>
        </tr>
      </thead>
      <tbody>
        {points.map((point, index) => (
          <tr key={MONTHS[index]}>
            <th scope="row">{MONTHS[index]}</th>
            <td>{formatNumber(point.value, digits)}</td>
            <td>{formatNumber(point.usual, digits)}</td>
            <td>
              {formatNumber(point.low, digits)} to {formatNumber(point.high, digits)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

export function ClimateChart(props: ClimateChartProps) {
  const { id, title, definition, mark, unit, digits, tickStep, fromZero, points, year, usualYears, source, note } =
    props;
  const style = markStyles[mark];
  const titleId = `${id}-title`;

  const all = points.flatMap((p) => [p.value, p.low, p.high]);
  const low = fromZero ? 0 : Math.floor(Math.min(...all) / tickStep) * tickStep;
  const high = Math.ceil(Math.max(...all) / tickStep) * tickStep;
  const ticks = range(low, high, tickStep);

  const x = (index: number) => MARGIN.left + SLOT * (index + 0.5);
  const y = (value: number) => MARGIN.top + PLOT_H - ((value - low) / (high - low)) * PLOT_H;
  const path = (values: number[]) => values.map((value, index) => `${x(index)},${y(value)}`).join(" ");

  const band = `${path(points.map((p) => p.high))} ${points
    .map((p, index) => `${x(index)},${y(p.low)}`)
    .reverse()
    .join(" ")}`;
  const barWidth = SLOT * 0.56;
  const describe = (point: MonthPoint, index: number) =>
    `${MONTHS[index]} ${year}: ${formatNumber(point.value, digits)} ${unit}. Usual ${formatNumber(point.usual, digits)} ${unit} (${usualYears} range ${formatNumber(point.low, digits)} to ${formatNumber(point.high, digits)} ${unit}).`;

  return (
    <Card aria-labelledby={titleId} className="flex flex-col gap-3">
      <div className="space-y-1">
        <h3 id={titleId} className="font-display text-lg leading-snug font-bold text-forest">
          {title}
        </h3>
        <p className="text-base text-caption">{definition}</p>
      </div>
      <Legend mark={mark} year={year} />
      <svg
        role="img"
        aria-label={`${title}. The monthly values are listed in the table that follows.`}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full overflow-visible"
      >
        {ticks.map((tick, index) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
              strokeWidth={tick === 0 && fromZero ? 1 : 0.75}
              className={tick === 0 && fromZero ? "stroke-sage" : "stroke-line"}
            />
            <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-caption text-[13px]">
              {formatNumber(tick, 0)}
              {index === ticks.length - 1 && ` ${unit}`}
            </text>
          </g>
        ))}
        <polygon points={band} className="fill-sage/35" />
        {mark === "bars" &&
          points.map((point, index) => (
            <path
              key={MONTHS[index]}
              d={topRoundedBar(x(index) - barWidth / 2, y(point.value), barWidth, y(low) - y(point.value))}
              className={style.fill}
            />
          ))}
        <polyline
          points={path(points.map((p) => p.usual))}
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          className="stroke-caption"
        />
        {mark === "line" && (
          <g>
            <polyline
              points={path(points.map((p) => p.value))}
              fill="none"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              className={style.stroke}
            />
            {points.map((point, index) => (
              <circle
                key={MONTHS[index]}
                cx={x(index)}
                cy={y(point.value)}
                r={3.5}
                strokeWidth={1.5}
                className={`${style.fill} stroke-white`}
              />
            ))}
          </g>
        )}
        {MONTHS.map((month, index) => (
          <text
            key={month}
            x={x(index)}
            y={HEIGHT - 6}
            textAnchor="middle"
            aria-hidden="true"
            className="fill-caption text-[13px]"
          >
            {month[0]}
          </text>
        ))}
        {points.map((point, index) => (
          <rect
            key={MONTHS[index]}
            x={x(index) - SLOT / 2}
            y={MARGIN.top}
            width={SLOT}
            height={PLOT_H}
            fill="transparent"
          >
            <title>{describe(point, index)}</title>
          </rect>
        ))}
      </svg>
      <DataTable {...props} />
      <p className="text-sm text-caption">
        <strong className="font-semibold text-ink">Data source:</strong> NASA POWER monthly {source}.{" "}
        <strong className="font-semibold text-ink">Note:</strong> the shaded band is the lowest–highest value for that
        month in {usualYears}.{note && ` ${note}`}
      </p>
    </Card>
  );
}
