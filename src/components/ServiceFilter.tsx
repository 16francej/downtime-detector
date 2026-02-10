"use client";

import { useState, useRef, useEffect } from "react";

interface ServiceFilterProps {
  services: string[];
  selectedService: string | null;
  onSelectService: (service: string | null) => void;
}

export default function ServiceFilter({
  services,
  selectedService,
  onSelectService,
}: ServiceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string | null) => {
    onSelectService(value);
    setIsOpen(false);
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        Filter by Service
      </label>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          role="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between"
        >
          <span>Filter: {selectedService || "All Services"}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            <div
              role="option"
              aria-selected={selectedService === null}
              onClick={() => handleSelect(null)}
              className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-900 dark:text-zinc-50"
            >
              All Services
            </div>
            {services.map((service) => (
              <div
                key={service}
                role="option"
                aria-selected={selectedService === service}
                onClick={() => handleSelect(service)}
                className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-900 dark:text-zinc-50"
              >
                {service}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
