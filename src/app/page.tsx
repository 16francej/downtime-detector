"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import OutageTimeline from "@/components/OutageTimeline";
import OutageList from "@/components/OutageList";
import ServiceFilter from "@/components/ServiceFilter";
import { Outage } from "@/data/outages";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [outages, setOutages] = useState<Outage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  // Initialize state from URL params
  useEffect(() => {
    const servicesParam = searchParams.get("services");
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (servicesParam) {
      setSelectedServices(servicesParam.split(","));
    }
    if (startParam) {
      setStartDate(startParam);
    }
    if (endParam) {
      setEndDate(endParam);
    }
  }, []); // Only run once on mount

  // Load outages from JSON file
  useEffect(() => {
    const loadOutages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/outages.json`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to load outages: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: expected an array");
        }

        // Validate and set outages
        setOutages(data as Outage[]);
        setError(null);
      } catch (err) {
        console.error("Error loading outages:", err);
        if (err instanceof Error && err.name === "AbortError") {
          setError(
            "Network timeout: Failed to load outage data. Please check your connection and try again."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load outage data. Please try again later."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadOutages();
  }, []);

  // Get unique services
  const services = useMemo(
    () => Array.from(new Set(outages.map((o) => o.service))).sort(),
    [outages]
  );

  const handleSelectService = (service: string | null) => {
    let newServices: string[];
    if (service === null) {
      // Clear all selected services
      newServices = [];
    } else {
      // Toggle service in selected list
      newServices = selectedServices.includes(service)
        ? selectedServices.filter((s) => s !== service)
        : [...selectedServices, service];
    }
    setSelectedServices(newServices);
    updateURL(newServices, startDate, endDate);
  };

  const updateURL = (services: string[], start: string, end: string) => {
    const params = new URLSearchParams();
    if (services.length > 0) {
      params.set("services", services.join(","));
    }
    if (start) {
      params.set("start", start);
    }
    if (end) {
      params.set("end", end);
    }
    const newURL = params.toString() ? `?${params.toString()}` : "/";
    router.replace(newURL, { scroll: false });
  };

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    updateURL(selectedServices, date, endDate);
    if (date && endDate && date > endDate) {
      setDateError(
        "Invalid date range: start date must be before end date. End date cannot be before start date."
      );
    } else {
      setDateError(null);
    }
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    updateURL(selectedServices, startDate, date);
    if (startDate && date && startDate > date) {
      setDateError(
        "Invalid date range: end date must be after start date. Cannot be before start date."
      );
    } else {
      setDateError(null);
    }
  };

  // Filter outages
  const filteredOutages = useMemo(() => {
    let result = outages;

    // Filter by service
    if (selectedServices.length > 0) {
      result = result.filter((o) => selectedServices.includes(o.service));
    }

    // Filter by date range (only if valid)
    if (!dateError) {
      if (startDate) {
        result = result.filter((o) => o.date >= startDate);
      }
      if (endDate) {
        result = result.filter((o) => o.date <= endDate);
      }
    }

    return result;
  }, [selectedServices, startDate, endDate, dateError, outages]);

  // Stats
  const earliestYear = useMemo(() => {
    if (outages.length === 0) return "";
    const sorted = [...outages].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[0].date.slice(0, 4);
  }, [outages]);

  const latestDate = useMemo(() => {
    if (outages.length === 0) return "";
    const sorted = [...outages].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0].date;
  }, [outages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--border)] border-t-[var(--foreground)] mb-4"
          ></div>
          <p className="text-[var(--text-secondary)] text-sm">
            Loading outage data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-xl font-semibold mb-2">
            Error loading data
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm border border-[var(--border)] rounded hover:bg-[var(--border)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main role="main" className="w-full max-w-[1000px] mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-baseline justify-between">
            <h1
              id="main-heading"
              data-testid="main-heading"
              className="text-2xl font-bold tracking-tight"
            >
              Downtime Detector
            </h1>
            <nav className="flex items-center gap-4 text-sm">
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/outages.json`}
                download="outages.json"
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] underline decoration-dotted underline-offset-2 transition-colors"
              >
                Download dataset
              </a>
              <Link
                href="/about"
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] underline decoration-dotted underline-offset-2 transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
          <p
            id="main-description"
            data-testid="main-description"
            className="text-sm text-[var(--text-secondary)] mt-1"
          >
            {outages.length} incidents &middot; {services.length} services &middot; since {earliestYear}
          </p>
          {latestDate && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Last updated: {latestDate}
            </p>
          )}
        </header>

        {/* Filter */}
        <ServiceFilter
          services={services}
          selectedServices={selectedServices}
          onSelectService={handleSelectService}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          dateError={dateError}
        />

        {/* Timeline scatter plot */}
        <OutageTimeline outages={filteredOutages} />

        {/* Outage List */}
        <OutageList
          outages={filteredOutages}
          isFiltered={selectedServices.length > 0 || !!startDate || !!endDate}
        />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[var(--border)] border-t-[var(--foreground)] mb-4"></div>
            <p className="text-[var(--text-secondary)] text-sm">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
