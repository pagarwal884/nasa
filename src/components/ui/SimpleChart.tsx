export const SimpleChart = () => {
  const data = [
    { x: 0, y: 10, label: "Year" },
    { x: 1, y: 38, label: "Year" },
    { x: 2, y: 40, label: "Year" },
    { x: 3, y: 55, label: "100M" },
    { x: 4, y: 62, label: "100M" },
    { x: 5, y: 65, label: "100M" },
    { x: 6, y: 50, label: "500" },
  ];

  const maxY = 70;
  const width = 550;
  const height = 300;
  const padding = 50;

  const xScale = (i: number) => (i / (data.length - 1)) * (width - 2 * padding) + padding;
  const yScale = (val: number) => height - padding - (val / maxY) * (height - 2 * padding);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {/* Background */}
      <rect width={width} height={height} fill="#EFF6FF" rx="16" />

      {/* Grid lines */}
      {[0, 10, 20, 30, 40, 50, 60].map((val) => (
        <line
          key={val}
          x1={padding}
          y1={yScale(val)}
          x2={width - padding}
          y2={yScale(val)}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

      {/* Y-axis labels */}
      <text x={10} y={yScale(50) + 5} fontSize="12" fill="#6B7280">50</text>
      <text x={10} y={yScale(60) + 5} fontSize="12" fill="#6B7280">60</text>
      <text x={10} y={yScale(40) + 5} fontSize="12" fill="#6B7280">40</text>
      <text x={10} y={yScale(10) + 5} fontSize="12" fill="#6B7280">10</text>
      <text x={15} y={yScale(0) + 5} fontSize="12" fill="#6B7280">0</text>

      {/* Y-axis title */}
      <text x={15} y={30} fontSize="12" fill="#374151" fontWeight="600">APachin Delis</text>

      {/* X-axis labels */}
      <text x={padding - 10} y={height - 25} fontSize="12" fill="#6B7280">Year</text>
      <text x={width / 2 - 20} y={height - 25} fontSize="12" fill="#6B7280">100M</text>
      <text x={width - padding - 10} y={height - 25} fontSize="12" fill="#6B7280">500</text>

      {/* X-axis title */}
      <text x={width / 2 - 60} y={height - 5} fontSize="12" fill="#374151" fontWeight="600">Observation Count</text>

      {/* Line path */}
      <path
        d={data
          .map((point, i) => {
            const x = xScale(i);
            const y = yScale(point.y);
            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
          })
          .join(" ")}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="3"
      />

      {/* Data points */}
      {data.map((point, i) => {
        const x = xScale(i);
        const y = yScale(point.y);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="#3B82F6" stroke="#fff" strokeWidth="2" />
          </g>
        );
      })}
    </svg>
  );
};
