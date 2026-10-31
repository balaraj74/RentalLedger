"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  IndianRupee,
  Package,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import type { SemanticSearchResult } from "@/lib/types";


const THEME_PROMPTS = [
  "Royal gold Rajasthani mandap with royal seating for 200 guests",
  "Minimalist pastel open-air engagement canopy with fairy lights",
  "Vibrant marigold and jasmine sangeet backdrop with rustic seating",
  "Palace crystal chandelier and VIP diwan seating",
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialView = searchParams.get("view") === "items" ? "items" : "packages";

  const [viewMode, setViewMode] = useState<"packages" | "items">(initialView);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [startDate, setStartDate] = useState("2026-11-10");
  const [endDate, setEndDate] = useState("2026-11-12");
  const [maxBudget, setMaxBudget] = useState<number>(100000);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const categories = useMemo(() => mockStore.getCategories(), []);
  const allItems = useMemo(() => mockStore.getItems(), []);

  // Compute package search results (using semantic search engine)
  const packageResults = useMemo(() => {
    const rawResults = mockStore.searchPackagesSemantically(searchQuery, {
      startDate,
      endDate,
      maxPrice: maxBudget,
    });

    let filtered = rawResults;
    if (onlyAvailable) {
      filtered = filtered.filter((r) => r.availability.is_fully_available);
    }
    return filtered;
  }, [searchQuery, startDate, endDate, maxBudget, onlyAvailable]);

  // Compute item results
  const itemResults = useMemo(() => {
    let items = allItems;
    if (selectedCategory !== "all") {
      items = items.filter((i) => i.category_id === selectedCategory);
    }
    if (maxBudget < 100000) {
      items = items.filter((i) => i.price_per_day <= maxBudget);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return items.map((item) => {
      const avail = mockStore.checkItemAvailability(item.item_id, startDate, endDate);
      return { item, avail };
    }).filter(({ avail }) => (!onlyAvailable ? true : avail.available_stock > 0));
  }, [allItems, selectedCategory, maxBudget, searchQuery, startDate, endDate, onlyAvailable]);

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setMaxBudget(100000);
    setOnlyAvailable(false);
    setStartDate("2026-11-10");
    setEndDate("2026-11-12");
  }

  // Calculate inclusive rental days
  const rentalDays = useMemo(() => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  return (
    <main className="page-content">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Public & Customer Discovery</p>
          <h1 className="page-title">Catalog & Decoration Packages</h1>
          <p className="page-subtitle">
            Find reusable event inventory and bundled mandap decoration packages with real-time stock availability.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="tab-list">
            <button
              onClick={() => setViewMode("packages")}
              className={`tab-button${viewMode === "packages" ? " active" : ""}`}
            >
              <Package size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />
              Decoration Packages ({packageResults.length})
            </button>
            <button
              onClick={() => setViewMode("items")}
              className={`tab-button${viewMode === "items" ? " active" : ""}`}
            >
              <Boxes size={14} style={{ display: "inline", verticalAlign: "-2px", marginRight: 5 }} />
              Equipment Inventory ({itemResults.length})
            </button>
          </div>
        </div>
      </div>

      {/* Semantic Search Box & Quick Theme Pills */}
      <section className="panel" style={{ padding: "20px 24px", marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={17}
              style={{ position: "absolute", left: 14, top: 12, color: "#7a858c" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe your event theme (e.g. 'Royal Rajasthani mandap with crystal chandeliers and ivory chairs'…)"
              className="form-input"
              style={{ paddingLeft: 42, height: 42, fontSize: 13 }}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 11,
                  background: "none",
                  border: "none",
                  color: "#8a949a",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ✕
              </button>
            ) : null}
          </div>

          <button
            onClick={() => {}}
            className="button button-primary"
            style={{ height: 42, flexShrink: 0 }}
          >
            <Sparkles size={15} /> Semantic Search
          </button>
        </div>

        {/* Quick theme prompt chips */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--ps-muted)", fontWeight: 700 }}>Theme ideas:</span>
          {THEME_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setSearchQuery(prompt)}
              style={{
                border: "1px solid var(--ps-border)",
                background: searchQuery === prompt ? "#edf1f4" : "#ffffff",
                color: searchQuery === prompt ? "var(--ps-navy)" : "#505e68",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 99,
                cursor: "pointer",
                transition: "all 0.12s",
                fontWeight: searchQuery === prompt ? 700 : 500,
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Semantic Search Explanation Banner */}
        {searchQuery.trim() ? (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "#edf4ee",
              borderRadius: 8,
              border: "1px solid #d5e6d8",
              fontSize: 12,
              color: "#2a5237",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <strong>Vector Search Active:</strong> Packages ranked by semantic similarity to &quot;{searchQuery}&quot;. Relational availability has been verified against component stock for {startDate} to {endDate} ({rentalDays} inclusive days).
            </div>
            <button
              onClick={resetFilters}
              style={{ border: "none", background: "none", color: "#2a5237", cursor: "pointer", fontWeight: 750, textDecoration: "underline" }}
            >
              Clear search
            </button>
          </div>
        ) : null}
      </section>

      {/* Filter Toolbar */}
      <section className="toolbar">
        <div className="filter-group">
          {/* Date Range Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#ffffff", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--ps-border)" }}>
            <Calendar size={14} color="#7a858c" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#54606a" }}>Rental Dates:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 11, color: "var(--ps-ink)", background: "transparent" }}
            />
            <span style={{ color: "#a0a8ac", fontSize: 11 }}>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 11, color: "var(--ps-ink)", background: "transparent" }}
            />
            <span className="badge badge-gray" style={{ marginLeft: 4 }}>
              {rentalDays} {rentalDays === 1 ? "day" : "days"}
            </span>
          </div>

          {/* Category Dropdown (if viewing items) */}
          {viewMode === "items" ? (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="form-select"
              style={{ width: "auto", minWidth: 160, height: 36, fontSize: 11 }}
            >
              <option value="all">All Categories ({allItems.length})</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name} ({c.item_count})
                </option>
              ))}
            </select>
          ) : null}

          {/* Budget Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#ffffff", padding: "6px 12px", borderRadius: 8, border: "1px solid var(--ps-border)" }}>
            <IndianRupee size={14} color="#7a858c" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#54606a" }}>Max:</span>
            <span style={{ fontSize: 11, fontWeight: 750, color: "var(--ps-navy)", minWidth: 60 }}>
              ₹{maxBudget.toLocaleString("en-IN")}
            </span>
            <input
              type="range"
              min={5000}
              max={100000}
              step={5000}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              style={{ width: 100, accentColor: "var(--ps-navy)", cursor: "pointer" }}
            />
          </div>

          {/* Only Available Toggle */}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#42505c", cursor: "pointer", background: "#ffffff", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--ps-border)" }}>
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              style={{ accentColor: "var(--ps-navy)" }}
            />
            Available on selected dates only
          </label>
        </div>

        <button
          onClick={resetFilters}
          className="button button-secondary"
          style={{ height: 36, fontSize: 11 }}
        >
          <RotateCcw size={13} /> Reset Filters
        </button>
      </section>

      {/* Package View Mode */}
      {viewMode === "packages" ? (
        <div>
          {packageResults.length === 0 ? (
            <div className="module-placeholder" style={{ textAlign: "center", padding: 48 }}>
              <h2>No decoration packages matched your criteria</h2>
              <p>Try widening your search terms, increasing your budget limit, or adjusting the event rental dates.</p>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                <button onClick={resetFilters} className="button button-primary">
                  <RotateCcw size={14} /> Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
              {packageResults.map(({ package: pkg, similarity_score, availability }: SemanticSearchResult) => {
                const isAvail = availability.is_fully_available;
                return (
                  <article
                    key={pkg.package_id}
                    className="panel"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                  >
                    {/* Package Card Image Banner */}
                    <div style={{ position: "relative", height: 210, width: "100%", background: "#eceae4", overflow: "hidden" }}>
                      {pkg.primary_image ? (
                        <img
                          src={pkg.primary_image}
                          alt={pkg.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#9aa3a8" }}>
                          <Package size={42} />
                        </div>
                      )}

                      {/* Match Score Badge */}
                      {searchQuery.trim() ? (
                        <div
                          style={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            background: "rgba(24, 36, 50, 0.88)",
                            color: "#ffffff",
                            padding: "4px 9px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 750,
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Sparkles size={11} color="#f4b266" />
                          <span>{Math.round(similarity_score * 100)}% Theme Match</span>
                        </div>
                      ) : null}

                      {/* Stock Availability Badge */}
                      <div style={{ position: "absolute", top: 12, right: 12 }}>
                        {isAvail ? (
                          <span className="badge badge-sage" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
                            <CheckCircle2 size={11} /> {availability.available_packages} Sets Available
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
                            <AlertCircle size={11} /> Stock Contested
                          </span>
                        )}
                      </div>

                      {/* Vendor Location Pill */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: 12,
                          left: 12,
                          background: "rgba(255, 255, 255, 0.92)",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#20364d",
                        }}
                      >
                        {pkg.vendor_name} · {pkg.vendor_city}
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 750, margin: 0, color: "var(--ps-ink)", lineHeight: 1.3 }}>
                          {pkg.name}
                        </h2>
                      </div>

                      <p style={{ fontSize: 12, color: "var(--ps-muted)", margin: "8px 0 14px", lineHeight: 1.5, flex: 1 }}>
                        {pkg.description.slice(0, 140)}…
                      </p>

                      {/* Components Preview */}
                      <div style={{ padding: "10px 12px", background: "#fbfaf7", borderRadius: 8, border: "1px solid #f0eee8", marginBottom: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 750, textTransform: "uppercase", color: "#8a949a", marginBottom: 6 }}>
                          Included Component Items ({pkg.components?.length || 0}):
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {pkg.components?.slice(0, 4).map((c) => (
                            <span key={c.item_id} style={{ fontSize: 10, background: "#ffffff", border: "1px solid #e3e4de", padding: "2px 6px", borderRadius: 4, color: "#4f5b64" }}>
                              {c.quantity}x {c.item?.name.split(" ")[0]} {c.item?.name.split(" ")[1]}
                            </span>
                          ))}
                          {(pkg.components?.length || 0) > 4 ? (
                            <span style={{ fontSize: 10, color: "var(--ps-muted)", alignSelf: "center" }}>
                              +{pkg.components!.length - 4} more
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0eb" }}>
                        <div>
                          <div style={{ fontSize: 9, color: "var(--ps-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                            Daily Rental
                          </div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ps-ink)" }}>
                            ₹{pkg.combo_price.toLocaleString("en-IN")}
                            <span style={{ fontSize: 10, fontWeight: 500, color: "#7a858c" }}> / day</span>
                          </div>
                        </div>

                        <Link
                          href={`/catalog/${pkg.package_id}?startDate=${startDate}&endDate=${endDate}`}
                          className="button button-primary"
                          style={{ height: 36, padding: "0 14px" }}
                        >
                          View Details <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Individual Item Inventory View Mode */
        <div>
          {itemResults.length === 0 ? (
            <div className="module-placeholder" style={{ textAlign: "center", padding: 48 }}>
              <h2>No individual equipment items matched your filters</h2>
              <p>Try switching categories or resetting your filters to browse available chairs, lighting, stages, and tables.</p>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
                <button onClick={resetFilters} className="button button-primary">
                  <RotateCcw size={14} /> Clear filters
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
              {itemResults.map(({ item, avail }) => (
                <article key={item.item_id} className="panel" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", height: 170, width: "100%", background: "#edeae4", overflow: "hidden" }}>
                    {item.primary_image ? (
                      <img
                        src={item.primary_image}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#9aa3a8" }}>
                        <Boxes size={36} />
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 10, left: 10 }}>
                      <span className="badge badge-gray">{item.category_name}</span>
                    </div>
                    <div style={{ position: "absolute", top: 10, right: 10 }}>
                      {avail.is_blacked_out ? (
                        <span className="badge badge-danger">Maintenance</span>
                      ) : avail.available_stock > 0 ? (
                        <span className="badge badge-sage">{avail.available_stock} Free</span>
                      ) : (
                        <span className="badge badge-amber">Fully Booked</span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 750, margin: 0, color: "var(--ps-ink)", lineHeight: 1.3 }}>
                      {item.name}
                    </h3>
                    <div style={{ fontSize: 10, color: "var(--ps-muted)", marginTop: 4 }}>
                      Condition: <strong style={{ color: "#4f5b64", textTransform: "capitalize" }}>{item.condition}</strong> · Total Pool: {item.total_stock} units
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16, paddingTop: 10, borderTop: "1px solid #f0f0eb" }}>
                      <div>
                        <div style={{ fontSize: 9, color: "var(--ps-muted)", textTransform: "uppercase", fontWeight: 700 }}>Price</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ps-ink)" }}>
                          ₹{item.price_per_day.toLocaleString("en-IN")}
                          <span style={{ fontSize: 10, fontWeight: 500, color: "#7a858c" }}> / day</span>
                        </div>
                      </div>

                      <Link
                        href={`/items/${item.item_id}?startDate=${startDate}&endDate=${endDate}`}
                        className="button button-secondary"
                        style={{ height: 32, padding: "0 10px", fontSize: 11 }}
                      >
                        Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="page-content">Loading catalog…</div>}>
      <CatalogContent />
    </Suspense>
  );
}
