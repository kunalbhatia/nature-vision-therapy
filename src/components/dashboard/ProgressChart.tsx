import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface ProgressChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

export default function ProgressChart({ data, title, color = '#3b82f6' }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
        No data available to display
      </div>
    );
  }

  const height = 200;
  const width = 600;
  const padding = 40;
  
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y = height - padding - (d.value / maxValue) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 w-full overflow-hidden">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">{title}</h3>
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[300px]" preserveAspectRatio="xMidYMid meet">
          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = height - padding - p * chartHeight;
            return (
              <React.Fragment key={i}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={padding - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{Math.round(p * maxValue)}</text>
              </React.Fragment>
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            return (
              <text 
                key={i} 
                x={x} 
                y={height - padding + 20} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#9ca3af"
                transform={`rotate(-45, ${x}, ${height - padding + 20})`}
              >
                {d.label}
              </text>
            );
          })}

          {/* Area under the line */}
          <polyline
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill={`${color}15`}
          />

          {/* The Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            const y = height - padding - (d.value / maxValue) * chartHeight;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
