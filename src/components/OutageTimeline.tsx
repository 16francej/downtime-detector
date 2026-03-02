"use client";

import { useState, useRef, useEffect } from "react";
import { Outage } from "@/data/outages";

interface OutageTimelineProps {
  outages: Outage[];
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "var(--severity-high)",
  medium: "var(--severity-medium)",
  low: "var(--severity-low)",
};

const SEVERITY_LABELS: { key: string; label: string }[] = [
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

function getSeverityColor(severity: string): string {
  return SEVERITY_COLORS[severity] ?? "#6b7280";
}

// Scale dot radius by upvotes (min 4, max 14)
function getDotRadius(upvotes: number, maxUpvotes: number): number {
  const minR = 4;
  const maxR = 14;
  const ratio = Math.sqrt(upvotes / Math.max(maxUpvotes, 1));
  return minR + ratio * (maxR - minR);
}

export default function OutageTimeline({ outages }: OutageTimelineProps) {
  const [tooltip, setTooltip] = useState<{
    outage: Outage;
    x: number;
    y: number;
    pinned: boolean;
    side: "left" | "right";
  } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(SVGCircleElement | null)[]>([]);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dismiss pinned tooltip on click outside the tooltip itself
  // (dot clicks use stopPropagation so they won't reach this handler)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setTooltip((prev) => {
        if (!prev?.pinned) return prev;
        if (tooltipRef.current?.contains(e.target as Node)) return prev;
        return null;
      });
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (outages.length === 0) return;

      const activeElement = document.activeElement;
      const currentFocusedCircle = circleRefs.current.findIndex(
        (circle) => circle === activeElement
      );

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const current = currentFocusedCircle >= 0 ? currentFocusedCircle : prev;
          const next = current >= outages.length - 1 ? 0 : current + 1;
          circleRefs.current[next]?.focus();
          return next;
        });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const current = currentFocusedCircle >= 0 ? currentFocusedCircle : prev;
          const next = current <= 0 ? outages.length - 1 : current - 1;
          circleRefs.current[next]?.focus();
          return next;
        });
      } else if (
        (e.key === "Enter" || e.key === " ") &&
        currentFocusedCircle >= 0
      ) {
        e.preventDefault();
        const outage = outages[currentFocusedCircle];
        const circle = circleRefs.current[currentFocusedCircle];
        if (circle) {
          showTooltip(circle, outage);
          setTooltip((prev) => prev ? { ...prev, pinned: true } : null);
        }
      } else if (e.key === "Escape") {
        setTooltip(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [outages]);

  if (outages.length === 0) {
    return (
      <section
        ref={containerRef}
        className="w-full mb-8 relative"
        aria-labelledby="timeline-heading"
      >
        <h2
          id="timeline-heading"
          className="text-base font-semibold mb-4"
        >
          Outage Timeline
        </h2>
        <div className="text-center py-12 border border-[var(--border)] rounded">
          <p className="text-[var(--text-secondary)] text-sm">
            No matching outages
          </p>
        </div>
      </section>
    );
  }

  // SVG layout
  const margin = { top: 20, right: 40, bottom: 50, left: 60 };
  const svgWidth = 1000;
  const svgHeight = 360;
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // X axis: dynamic range from data with padding
  const minTimestamp = Math.min(...outages.map((o) => o.timestamp));
  const maxTimestamp = Math.max(...outages.map((o) => o.timestamp));
  const minYear = new Date(minTimestamp).getFullYear();
  const maxYear = new Date(maxTimestamp).getFullYear() + 1;
  const xStart = new Date(`${minYear}-01-01`).getTime();
  const xEnd = new Date(`${maxYear + 1}-01-01`).getTime();
  const xRange = xEnd - xStart;

  // Y axis: 0 to max upvotes (+ 10% padding)
  const maxUpvotes = Math.max(...outages.map((o) => o.upvotes), 100);
  const yEnd = Math.ceil(maxUpvotes * 1.1);

  const scaleX = (ts: number) =>
    Math.max(0, Math.min(plotWidth, ((ts - xStart) / xRange) * plotWidth));
  const scaleY = (upvotes: number) =>
    Math.max(0, Math.min(plotHeight, plotHeight - (upvotes / yEnd) * plotHeight));

  // Year labels for X axis (dynamic based on data range)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Y axis ticks (5 evenly spaced)
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    Math.round((yEnd / yTickCount) * i)
  );

  const computeTooltipPos = (circle: SVGCircleElement) => {
    if (!containerRef.current) return null;
    const circleRect = circle.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Center of the dot, relative to the container
    const dotCenterX = circleRect.left + circleRect.width / 2 - containerRect.left;
    const dotCenterY = circleRect.top + circleRect.height / 2 - containerRect.top;
    const dotRadius = circleRect.width / 2;

    const tooltipWidth = 260;
    const tooltipHeight = 130;
    const gap = 8;

    // Flip to left side if tooltip would overflow the right edge
    const side: "left" | "right" =
      dotCenterX + dotRadius + gap + tooltipWidth > containerRect.width ? "left" : "right";

    let y = dotCenterY;
    if (y + tooltipHeight > containerRect.height) {
      y = y - tooltipHeight - 20;
    }
    if (y < 0) y = 8;

    const x = side === "right"
      ? dotCenterX + dotRadius + gap
      : dotCenterX - dotRadius - gap - tooltipWidth;

    return { x: Math.max(0, x), y, side };
  };

  const showTooltip = (circle: SVGCircleElement, outage: Outage) => {
    const pos = computeTooltipPos(circle);
    if (!pos) return;
    setTooltip({ outage, ...pos, pinned: false });
  };

  const handleMouseEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    outage: Outage
  ) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (tooltip?.pinned) return;
    showTooltip(e.currentTarget, outage);
  };

  const handleMouseLeave = () => {
    if (tooltip?.pinned) return;
    hideTimeout.current = setTimeout(() => setTooltip(null), 100);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
  };

  const handleTooltipMouseLeave = () => {
    if (tooltip?.pinned) return;
    setTooltip(null);
  };

  const handleClick = (
    e: React.MouseEvent<SVGCircleElement>,
    outage: Outage
  ) => {
    e.stopPropagation();
    const pos = computeTooltipPos(e.currentTarget);
    if (!pos) return;
    setTooltip({ outage, ...pos, pinned: true });
  };

  return (
    <section
      ref={containerRef}
      className="w-full mb-8 relative"
      aria-labelledby="timeline-heading"
    >
      <div className="flex items-baseline justify-between mb-4">
        <h2
          id="timeline-heading"
          className="text-base font-semibold"
        >
          Outage Timeline
        </h2>
        {/* Severity legend */}
        <div className="flex items-center gap-4">
          {SEVERITY_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: SEVERITY_COLORS[key] }}
              />
              <span className="text-xs text-[var(--text-secondary)]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <svg
          role="img"
          aria-labelledby="timeline-heading"
          aria-label="Outage Timeline"
          className="w-full"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid lines — subtle */}
            {yTicks.map((tick) => (
              <line
                key={`grid-${tick}`}
                x1={0}
                y1={scaleY(tick)}
                x2={plotWidth}
                y2={scaleY(tick)}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            ))}

            {/* X axis line */}
            <line
              x1={0}
              y1={plotHeight}
              x2={plotWidth}
              y2={plotHeight}
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* Y axis line */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={plotHeight}
              stroke="var(--border)"
              strokeWidth="1"
            />

            {/* X axis year labels */}
            {years.map((year) => {
              const x = scaleX(new Date(`${year}-07-01`).getTime());
              return (
                <g key={year} transform={`translate(${x},0)`}>
                  <line
                    y1={plotHeight}
                    y2={plotHeight + 5}
                    stroke="var(--border)"
                    strokeWidth="1"
                  />
                  <text
                    y={plotHeight + 18}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--text-secondary)"
                    fontFamily="var(--font-geist-sans), system-ui, sans-serif"
                  >
                    {year}
                  </text>
                </g>
              );
            })}

            {/* Y axis ticks and labels */}
            {yTicks.map((tick) => (
              <g key={`ytick-${tick}`} transform={`translate(0,${scaleY(tick)})`}>
                <line x1={-4} x2={0} stroke="var(--border)" strokeWidth="1" />
                <text
                  x={-8}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-secondary)"
                  dominantBaseline="middle"
                  fontFamily="var(--font-geist-mono), monospace"
                >
                  {tick >= 1000 ? `${Math.round(tick / 100) / 10}k` : tick}
                </text>
              </g>
            ))}

            {/* Data points — sorted so smaller dots render on top */}
            {[...outages]
              .sort((a, b) => b.upvotes - a.upvotes)
              .map((outage) => {
                const originalIndex = outages.indexOf(outage);
                const cx = scaleX(outage.timestamp);
                const cy = scaleY(outage.upvotes);
                const r = getDotRadius(outage.upvotes, maxUpvotes);
                return (
                  <circle
                    key={outage.id}
                    ref={(el) => {
                      circleRefs.current[originalIndex] = el;
                    }}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={getSeverityColor(outage.severity)}
                    opacity={0.75}
                    className="cursor-pointer transition-all duration-150 hover:opacity-100 focus-visible:opacity-100 outline-none"
                    style={{
                      stroke: focusedIndex === originalIndex ? "var(--foreground)" : "transparent",
                      strokeWidth: 2,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(e, outage)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleClick(e, outage)}
                    onFocus={() => setFocusedIndex(originalIndex)}
                    onBlur={() => setFocusedIndex(-1)}
                    tabIndex={0}
                    aria-label={`${outage.service}: ${outage.title} — ${outage.date}, ${outage.severity}, ${outage.upvotes} upvotes, ${outage.comments} comments`}
                  />
                );
              })}
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y - 10,
            width: 260,
            zIndex: 50,
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          className="border border-[var(--border)] rounded p-3 pointer-events-auto"
          // Use inline style for background to match page bg
          // This avoids needing white cards on cream
        >
          <div
            style={{ background: "var(--background)" }}
            className="absolute inset-0 rounded opacity-95"
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{tooltip.outage.service}</span>
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  color: getSeverityColor(tooltip.outage.severity),
                  border: `1px solid ${getSeverityColor(tooltip.outage.severity)}`,
                }}
              >
                {tooltip.outage.severity.charAt(0).toUpperCase() + tooltip.outage.severity.slice(1)}
              </span>
              <a
                href={tooltip.outage.hn_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] text-[11px] underline decoration-dotted underline-offset-2"
              >
                HN
              </a>
            </div>
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
              {tooltip.outage.title}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
              <span>{tooltip.outage.date}</span>
              <span>{tooltip.outage.upvotes.toLocaleString()} pts</span>
              <span>{tooltip.outage.comments.toLocaleString()} comments</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
