"use client";

import { Outage } from "@/data/outages";

interface OutageTimelineProps {
  outages: Outage[];
}

export default function OutageTimeline({ outages }: OutageTimelineProps) {
  if (outages.length === 0) {
    return null;
  }

  // Sort outages by timestamp
  const sortedOutages = [...outages].sort((a, b) => a.timestamp - b.timestamp);

  // Get min and max timestamps for scaling
  const minTime = sortedOutages[0].timestamp;
  const maxTime = sortedOutages[sortedOutages.length - 1].timestamp;
  const timeRange = maxTime - minTime || 1;

  // SVG dimensions
  const svgWidth = 1000;
  const svgHeight = 100;
  const centerY = svgHeight / 2;

  // Calculate position for each outage (0-1000 in SVG coordinates)
  const getPosition = (timestamp: number) => {
    return ((timestamp - minTime) / timeRange) * svgWidth;
  };

  // Color mapping for different services
  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      AWS: "#f97316",
      Cloudflare: "#ea580c",
      Facebook: "#2563eb",
      GitHub: "#1f2937",
      Google: "#16a34a",
      Fastly: "#dc2626",
    };
    return colors[service] || "#6b7280";
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
      <h2 id="timeline-heading" className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
        Outage Timeline
      </h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Visualization showing {sortedOutages.length} outage events over time
      </p>
      <svg className="w-full h-32 timeline chart" viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-labelledby="timeline-heading" aria-label="Timeline chart visualization showing outage events over time">
        {/* Timeline bar */}
        <line x1="0" y1={centerY} x2={svgWidth} y2={centerY} stroke="#d4d4d8" strokeWidth="2" />

        {/* Outage markers */}
        {sortedOutages.map((outage) => {
          const position = getPosition(outage.timestamp);
          return (
            <g key={outage.id}>
              <title>{`${outage.service} - ${outage.date}`}</title>
              <circle
                cx={position}
                cy={centerY}
                r="8"
                fill={getServiceColor(outage.service)}
                className="outage data-point cursor-pointer hover:scale-125 transition-transform"
                aria-label={`Outage data point: ${outage.service} on ${outage.date}`}
              />
            </g>
          );
        })}

        {/* Year labels */}
        <text x="0" y={svgHeight - 10} className="text-xs fill-zinc-500" fontSize="12">
          {new Date(minTime).getFullYear()}
        </text>
        <text x={svgWidth} y={svgHeight - 10} textAnchor="end" className="text-xs fill-zinc-500" fontSize="12">
          {new Date(maxTime).getFullYear()}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4">
        {Array.from(new Set(sortedOutages.map((o) => o.service))).map((service) => (
          <div key={service} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getServiceColor(service) }} />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{service}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
