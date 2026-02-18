"use client";

import { Outage } from "@/data/outages";

interface OutageListProps {
  outages: Outage[];
}

const severityConfig = {
  major: { label: "major", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  moderate: { label: "moderate", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  minor: { label: "minor", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

export default function OutageList({ outages }: OutageListProps) {
  // Sort outages by timestamp (most recent first)
  const sortedOutages = [...outages].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <section className="w-full bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm" role="region" aria-labelledby="outage-list-heading">
      <h2 id="outage-list-heading" className="text-xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
        Famous Outage Incidents
      </h2>
      <div className="overflow-x-auto">
        <table role="table" className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Service</th>
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Date</th>
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Description</th>
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Duration</th>
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Severity</th>
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Points</th>
              <th className="font-semibold text-zinc-900 dark:text-zinc-50 text-left pb-3">Comments</th>
            </tr>
          </thead>
          <tbody>
            {sortedOutages.map((outage) => {
              const severity = severityConfig[outage.severity];
              return (
                <tr
                  key={outage.id}
                  className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="font-medium text-zinc-900 dark:text-zinc-50 py-3">
                    {outage.service}
                  </td>
                  <td className="text-zinc-600 dark:text-zinc-400 py-3">
                    {outage.date}
                  </td>
                  <td className="text-zinc-600 dark:text-zinc-400 py-3">
                    {outage.description}
                    {outage.hnUrl && (
                      <a
                        href={outage.hnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-orange-500 hover:text-orange-600 text-xs font-medium"
                        aria-label="View HN discussion"
                      >
                        [HN]
                      </a>
                    )}
                  </td>
                  <td className="text-zinc-600 dark:text-zinc-400 py-3">
                    {outage.duration}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${severity.className}`}>
                      {severity.label}
                    </span>
                  </td>
                  <td className="text-zinc-600 dark:text-zinc-400 py-3">
                    {outage.points != null ? outage.points : "—"}
                  </td>
                  <td className="text-zinc-600 dark:text-zinc-400 py-3">
                    {outage.comments != null ? outage.comments : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
