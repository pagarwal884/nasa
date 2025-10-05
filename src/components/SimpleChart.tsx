interface SimpleChartProps {
  data: {
    data: number[];
    labels: string[];
    title?: string;
  };
}

export const SimpleChart = ({ data }: SimpleChartProps) => {
  const chartData = [
    { x: 0, y: 10, label: "Year" },
    { x: 1, y: 38, label: "Year" },
    { x: 2, y: 40, label: "Year" },
    { x: 3, y: 55, label: "100M" },
    { x: 4, y: 62, label: "100M" },
    { x: 5, y: 65, label: "100M" },
    { x: 6, y: 50, label: "500" },
  ];

  const maxY = 70;
  const width = 600;
  const height = 350;
  const padding = 60;

  const xScale = (i: number) => (i / (chartData.length - 1)) * (width - 2 * padding) + padding;
  const yScale = (val: number) => height - padding - (val / maxY) * (height - 2 * padding);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Background */}
        <rect width={width} height={height} fill="rgba(255,255,255,0.05)" rx="12" />

        {/* Grid lines */}
        {[0, 10, 20, 30, 40, 50, 60].map((val) => (
          <g key={val}>
            <line
              x1={padding}
              y1={yScale(val)}
              x2={width - padding}
              y2={yScale(val)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            <text x={padding - 25} y={yScale(val) + 4} fontSize="11" fill="rgba(255,255,255,0.6)" textAnchor="end">
              {val}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

        {/* Y-axis title */}
        <text x={20} y={30} fontSize="13" fill="rgba(255,255,255,0.8)" fontWeight="500" textAnchor="start">
          Detection Confidence
        </text>

        {/* X-axis labels */}
        <text x={padding - 10} y={height - 35} fontSize="12" fill="rgba(255,255,255,0.6)" textAnchor="middle">Year</text>
        <text x={width / 2} y={height - 35} fontSize="12" fill="rgba(255,255,255,0.6)" textAnchor="middle">100M Observations</text>
        <text x={width - padding - 10} y={height - 35} fontSize="12" fill="rgba(255,255,255,0.6)" textAnchor="middle">500 Samples</text>

        {/* X-axis title */}
        <text x={width / 2} y={height - 10} fontSize="13" fill="rgba(255,255,255,0.8)" fontWeight="500" textAnchor="middle">
          Research Timeline & Scale
        </text>

        {/* Line path with gradient */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        
        <path
          d={chartData
            .map((point, i) => {
              const x = xScale(i);
              const y = yScale(point.y);
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Area under curve */}
        <path
          d={`
            M ${xScale(0)} ${yScale(chartData[0].y)}
            ${chartData.slice(1).map((point, i) => `L ${xScale(i + 1)} ${yScale(point.y)}`).join(' ')}
            L ${xScale(chartData.length - 1)} ${height - padding}
            L ${xScale(0)} ${height - padding}
            Z
          `}
          fill="url(#lineGradient)"
          fillOpacity="0.1"
        />

        {/* Data points with glow */}
        {chartData.map((point, i) => {
          const x = xScale(i);
          const y = yScale(point.y);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="8" fill="url(#lineGradient)" stroke="#fff" strokeWidth="2">
                <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
};