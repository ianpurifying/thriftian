// src/components/seller/analytics/ConversionGaugeChart.tsx
"use client";

interface ConversionGaugeChartProps {
  conversionRate: number;
}

export default function ConversionGaugeChart({
  conversionRate,
}: ConversionGaugeChartProps) {
  const clampedRate = Math.min(Math.max(conversionRate, 0), 100);
  const rotation = (clampedRate / 100) * 180 - 90;

  const getColor = (rate: number) => {
    if (rate < 1) return "#ef4444";
    if (rate < 3) return "#f59e0b";
    if (rate < 5) return "#10b981";
    return "#6366f1";
  };

  const getLabel = (rate: number) => {
    if (rate < 1) return "Needs Work";
    if (rate < 3) return "Fair";
    if (rate < 5) return "Good";
    return "Excellent";
  };

  const color = getColor(clampedRate);
  const label = getLabel(clampedRate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-[fadeIn_0.9s_ease-out]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Conversion Performance
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Overall conversion health gauge
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        {/* Gauge SVG */}
        <div className="relative w-64 h-32">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
              strokeLinecap="round"
            />

            {/* Colored segments */}
            <defs>
              <linearGradient
                id="gaugeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="33%" stopColor="#f59e0b" />
                <stop offset="66%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${(clampedRate / 100) * 251} 251`}
              className="transition-all duration-1000 ease-out"
            />

            {/* Needle */}
            <g
              transform={`rotate(${rotation} 100 90)`}
              className="transition-transform duration-1000 ease-out"
            >
              <line
                x1="100"
                y1="90"
                x2="100"
                y2="30"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="90" r="6" fill={color} />
            </g>

            {/* Tick marks */}
            {[0, 1, 3, 5, 10].map((tick) => {
              const angle = (tick / 10) * 180 - 90;
              const x1 = 100 + 70 * Math.cos((angle * Math.PI) / 180);
              const y1 = 90 + 70 * Math.sin((angle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos((angle * Math.PI) / 180);
              const y2 = 90 + 80 * Math.sin((angle * Math.PI) / 180);

              return (
                <g key={tick}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                  <text
                    x={100 + 90 * Math.cos((angle * Math.PI) / 180)}
                    y={90 + 90 * Math.sin((angle * Math.PI) / 180) + 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Value display */}
        <div className="text-center mt-6">
          <p className="text-5xl font-bold" style={{ color }}>
            {clampedRate.toFixed(2)}%
          </p>
          <p className="text-lg font-medium text-gray-600 mt-2">{label}</p>
        </div>

        {/* Status bars */}
        <div className="w-full mt-8 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Poor</span>
            <span className="text-gray-600">Fair</span>
            <span className="text-gray-600">Good</span>
            <span className="text-gray-600">Excellent</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-500 via-green-500 to-indigo-500" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0-1%</span>
            <span>1-3%</span>
            <span>3-5%</span>
            <span>5%+</span>
          </div>
        </div>

        {/* Insights */}
        <div className="w-full mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            {clampedRate < 1 && (
              <>
                <span className="font-semibold">💡 Tip:</span> Focus on
                improving product images and descriptions to increase
                conversions.
              </>
            )}
            {clampedRate >= 1 && clampedRate < 3 && (
              <>
                <span className="font-semibold">💡 Tip:</span> Consider adding
                customer reviews and better call-to-action buttons.
              </>
            )}
            {clampedRate >= 3 && clampedRate < 5 && (
              <>
                <span className="font-semibold">✓ Good work!</span> Your
                conversion rate is above average. Keep optimizing!
              </>
            )}
            {clampedRate >= 5 && (
              <>
                <span className="font-semibold">🎉 Excellent!</span> Your
                conversion rate is outstanding. Maintain this momentum!
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
