"use client";

import { Outage } from "@/data/outages";

interface OutageListProps {
  outages: Outage[];
}

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
            </tr>
          </thead>
          <tbody>
            {sortedOutages.map((outage) => (
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
                </td>
                <td className="text-zinc-600 dark:text-zinc-400 py-3">
                  {outage.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
