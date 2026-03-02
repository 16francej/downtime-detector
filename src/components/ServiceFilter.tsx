"use client";

import { useState, useRef, useEffect } from "react";

interface ServiceFilterProps {
  services: string[];
  selectedServices: string[];
  onSelectService: (service: string | null) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  dateError: string | null;
}

export default function ServiceFilter({
  services,
  selectedServices,
  onSelectService,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  dateError,
}: ServiceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string | null) => {
    onSelectService(value);
    if (value === null) {
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  const filteredServices = services.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLabel =
    selectedServices.length === 0
      ? "All Services"
      : selectedServices.length === 1
      ? selectedServices[0]
      : `${selectedServices.length} services`;

  return (
    <div className="w-full mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Service dropdown */}
        <div className="flex-1 min-w-[200px]">
          <label
            className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Service
          </label>
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              name={selectedLabel}
              aria-label={selectedLabel}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              onClick={() => setIsOpen(!isOpen)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsOpen(!isOpen);
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                }
              }}
              className="w-full px-3 py-1.5 border border-[var(--border)] rounded bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-1 text-left flex items-center justify-between"
            >
              <span>{selectedLabel}</span>
              <svg
                className={`w-4 h-4 transition-transform flex-shrink-0 text-[var(--text-secondary)] ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div
                role="listbox"
                aria-label="Select a service"
                className="absolute z-20 w-full mt-1 border border-[var(--border)] rounded max-h-72 overflow-auto"
                style={{ background: "var(--background)" }}
              >
                {/* Search typeahead */}
                <div className="sticky top-0 p-2 border-b border-[var(--border)]" style={{ background: "var(--background)" }}>
                  <input
                    type="text"
                    role="textbox"
                    aria-label="Filter by Service"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-[var(--border)] rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--foreground)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div
                  role="option"
                  aria-selected={selectedServices.length === 0}
                  tabIndex={0}
                  onClick={() => {
                    onSelectService(null);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectService(null);
                      setIsOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  className="px-3 py-1.5 cursor-pointer text-sm focus:outline-none"
                  style={{}}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.05)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                >
                  All Services
                </div>
                {filteredServices.map((service) => (
                  <div
                    key={service}
                    role="option"
                    aria-selected={selectedServices.includes(service)}
                    tabIndex={0}
                    onClick={() => handleSelect(service)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(service);
                      }
                    }}
                    className={`px-3 py-1.5 cursor-pointer text-sm flex items-center gap-2 focus:outline-none ${
                      selectedServices.includes(service) ? "font-medium" : ""
                    }`}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.05)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
                  >
                    {selectedServices.includes(service) && (
                      <span aria-hidden="true">&#10003;</span>
                    )}
                    {service}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {selectedServices.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedServices.map((s) => (
                <button
                  key={s}
                  type="button"
                  name={`Filter: ${s}`}
                  aria-label={`Remove ${s} filter`}
                  onClick={() => onSelectService(s)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--border)] text-xs hover:bg-[var(--border)] transition-colors"
                >
                  {s}
                  <span aria-hidden="true" className="text-[var(--text-secondary)]">&times;</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range inputs */}
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label
              htmlFor="start-date"
              className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
            >
              From
            </label>
            <input
              id="start-date"
              name="startDate"
              aria-label="Start Year"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-2 py-1.5 border border-[var(--border)] rounded bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-1"
            />
          </div>
          <div>
            <label
              htmlFor="end-date"
              className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5"
            >
              To
            </label>
            <input
              id="end-date"
              name="endDate"
              aria-label="End Year"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-2 py-1.5 border border-[var(--border)] rounded bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-1"
            />
          </div>
        </div>
      </div>

      {/* Date validation error */}
      {dateError && (
        <p
          role="alert"
          className="mt-2 text-sm"
          style={{ color: "var(--severity-major)" }}
          aria-live="polite"
        >
          {dateError}
        </p>
      )}
    </div>
  );
}
