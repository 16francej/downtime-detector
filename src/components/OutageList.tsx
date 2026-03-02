"use client";

import { useState, useMemo } from "react";
import { Outage } from "@/data/outages";

type SortColumn = "service" | "title" | "date" | "severity" | "upvotes" | "comments";
type SortState = { column: SortColumn | null; direction: "asc" | "desc" };

const SEVERITY_ORDER: Record<string, number> = { high: 3, medium: 2, low: 1 };

const SEVERITY_DISPLAY: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

interface OutageListProps {
  outages: Outage[];
  isFiltered?: boolean;
}

export default function OutageList({ outages, isFiltered = false }: OutageListProps) {
  const [sort, setSort] = useState<SortState>({ column: null, direction: "desc" });

  const handleSort = (column: SortColumn) => {
    setSort((prev) => {
      if (prev.column !== column) return { column, direction: "asc" };
      if (prev.direction === "asc") return { column, direction: "desc" };
      return { column: null, direction: "desc" };
    });
  };

  const sortedOutages = useMemo(() => {
    const items = [...outages];
    if (sort.column === null) {
      return items.sort((a, b) => b.timestamp - a.timestamp);
    }
    const dir = sort.direction === "asc" ? 1 : -1;
    return items.sort((a, b) => {
      switch (sort.column) {
        case "service":
          return dir * a.service.localeCompare(b.service);
        case "title":
          return dir * a.title.localeCompare(b.title);
        case "date":
          return dir * (a.timestamp - b.timestamp);
        case "severity":
          return dir * ((SEVERITY_ORDER[a.severity] ?? 0) - (SEVERITY_ORDER[b.severity] ?? 0));
        case "upvotes":
          return dir * (a.upvotes - b.upvotes);
        case "comments":
          return dir * (a.comments - b.comments);
        default:
          return 0;
      }
    });
  }, [outages, sort]);

  if (sortedOutages.length === 0) {
    const emptyMessage = isFiltered
      ? "No outages found matching your filters"
      : "No outage data available";
    return (
      <section
        className="w-full"
        role="region"
        aria-labelledby="outage-list-heading"
      >
        <h2
          id="outage-list-heading"
          className="text-base font-semibold mb-4"
        >
          Famous Outage Incidents
        </h2>
        <p className="text-[var(--text-secondary)] text-sm text-center py-8 border border-[var(--border)] rounded">
          {emptyMessage}
        </p>
      </section>
    );
  }

  const chevron = (col: SortColumn) => {
    if (sort.column !== col) return null;
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        className="inline-block ml-1"
        aria-hidden="true"
      >
        <path
          d={sort.direction === "asc" ? "M3 8L6 4L9 8" : "M3 4L6 8L9 4"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const ariaSort = (col: SortColumn): "ascending" | "descending" | "none" => {
    if (sort.column !== col) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  const renderSortableHeader = (column: SortColumn, label: string, align: "left" | "right" = "left") => (
    <th
      scope="col"
      aria-sort={ariaSort(column)}
      className={`text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] ${align === "right" ? "text-right" : "text-left"} pb-2 ${column === "comments" ? "" : "pr-4"} whitespace-nowrap`}
    >
      <button
        type="button"
        onClick={() => handleSort(column)}
        className="hover:text-[var(--foreground)] focus-visible:ring-1 focus-visible:ring-[var(--foreground)] rounded px-0.5 -mx-0.5 transition-colors cursor-pointer"
      >
        {label}
        {chevron(column)}
      </button>
    </th>
  );

  return (
    <section
      className="w-full"
      role="region"
      aria-labelledby="outage-list-heading"
    >
      <h2
        id="outage-list-heading"
        className="text-base font-semibold mb-4"
      >
        Famous Outage Incidents
      </h2>
      <div className="overflow-x-auto">
        <table role="table" className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {renderSortableHeader("service", "Service")}
              {renderSortableHeader("title", "Title")}
              {renderSortableHeader("date", "Date")}
              {renderSortableHeader("severity", "Engagement")}
              {renderSortableHeader("upvotes", "Points", "right")}
              {renderSortableHeader("comments", "Comments", "right")}
            </tr>
          </thead>
          <tbody>
            {sortedOutages.map((outage) => (
              <tr
                key={outage.id}
                className="border-b border-[var(--border)] transition-colors"
                style={{}}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.03)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '';
                }}
              >
                <td className="font-medium py-2.5 pr-4 whitespace-nowrap">
                  {outage.service}
                </td>
                <td className="text-[var(--text-secondary)] py-2.5 pr-4 max-w-sm">
                  <div className="flex items-start gap-2">
                    <span className="flex-1 line-clamp-1">{outage.title}</span>
                    <a
                      href={outage.hn_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-secondary)] hover:text-[var(--foreground)] text-[11px] whitespace-nowrap flex-shrink-0 underline decoration-dotted underline-offset-2"
                      aria-label={`View HN discussion for ${outage.service} outage`}
                      data-hn-link="true"
                    >
                      HN
                    </a>
                  </div>
                </td>
                <td className="text-[var(--text-secondary)] py-2.5 pr-4 whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                  {outage.date}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-[12px]"
                    data-severity={outage.severity}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: `var(--severity-${outage.severity})` }}
                    />
                    {SEVERITY_DISPLAY[outage.severity] ?? outage.severity}
                  </span>
                </td>
                <td
                  className="text-[var(--text-secondary)] py-2.5 pr-4 whitespace-nowrap text-right"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace', fontVariantNumeric: 'tabular-nums' }}
                >
                  {outage.upvotes.toLocaleString()}
                </td>
                <td
                  className="text-[var(--text-secondary)] py-2.5 whitespace-nowrap text-right"
                  style={{ fontFamily: 'var(--font-geist-mono), monospace', fontVariantNumeric: 'tabular-nums' }}
                >
                  {outage.comments.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
