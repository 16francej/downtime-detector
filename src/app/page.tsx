"use client";

import { useState } from "react";
import OutageTimeline from "@/components/OutageTimeline";
import OutageList from "@/components/OutageList";
import ServiceFilter from "@/components/ServiceFilter";
import { outages } from "@/data/outages";

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Get unique services from outages
  const services = Array.from(new Set(outages.map((o) => o.service))).sort();

  // Filter outages based on selected service
  const filteredOutages = selectedService
    ? outages.filter((outage) => outage.service === selectedService)
    : outages;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="w-full max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4" data-testid="main-heading">
            Downtime Detector
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400" data-testid="main-description">
            Track and explore famous service outages and incidents across major tech platforms
          </p>
        </header>

        {/* Filter */}
        <div className="mb-8">
          <ServiceFilter
            services={services}
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />
        </div>

        {/* Timeline */}
        <div className="mb-8">
          <OutageTimeline outages={filteredOutages} />
        </div>

        {/* Outage List */}
        <div>
          <OutageList outages={filteredOutages} />
        </div>
      </main>
    </div>
  );
}
