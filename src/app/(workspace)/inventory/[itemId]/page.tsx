"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import type { BlackoutReason } from "@/lib/types";

function ItemInventoryDetailContent() {
  const params = useParams();
  const itemId = Number(params.itemId);

  const [showAddBlackoutModal, setShowAddBlackoutModal] = useState(false);
  const [blackoutStart, setBlackoutStart] = useState("2026-11-20");
  const [blackoutEnd, setBlackoutEnd] = useState("2026-11-22");
  const [blackoutReason, setBlackoutReason] = useState<BlackoutReason>("maintenance");
  const [blackoutNotes, setBlackoutNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const item = useMemo(() => mockStore.getItemById(itemId), [itemId]);
  const blackouts = useMemo(() => mockStore.getItemBlackouts(itemId), [itemId]);

  // Compute all allocations across bookings for this item
  const itemAllocations = useMemo(() => {
    const allBookings = mockStore.getBookings();
    const records: Array<{
      bookingId: number;
      customerName: string;
      startDate: string;
      endDate: string;
      quantity: number;
      status: string;
    }> = [];

    for (const b of allBookings) {
      for (const a of b.allocations || []) {
        if (a.item_id === itemId && a.allocation_status !== "released") {
          records.push({
            bookingId: b.booking_id,
            customerName: b.customer_name || "Customer",
            startDate: a.rental_start_date,
            endDate: a.rental_end_date,
            quantity: a.quantity_allocated,
            status: a.allocation_status,
          });
        }
      }
    }
    return records;
  }, [itemId]);

  function showToast(msg: string) {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  }

  if (!item) {
    return (
      <main className="page-content">
        <div className="module-placeholder" style={{ padding: 40, textAlign: "center" }}>
          <h2>Equipment Item Not Found</h2>
          <p>The inventory item ID could not be resolved.</p>
          <div style={{ marginTop: 20 }}>
            <Link href="/inventory" className="button button-primary">
              <ArrowLeft size={14} /> Back to Inventory
            </Link>
          </div>
        </div>
      </main>
    );
  }

  function handleAddBlackout(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (blackoutEnd < blackoutStart) {
      setFormError("End date must be on or after start date.");
      return;
    }

    try {
      mockStore.addBlackoutDate({
        item_id: item!.item_id,
        start_date: blackoutStart,
        end_date: blackoutEnd,
        reason: blackoutReason,
        notes: blackoutNotes.trim() || undefined,
      });

      setShowAddBlackoutModal(false);
      setBlackoutNotes("");
      showToast("Scheduled maintenance blackout interval.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add blackout";
      setFormError(msg);
    }
  }

  function handleRemoveBlackout(blackoutId: number) {
    mockStore.removeBlackoutDate(blackoutId);
    showToast("Removed blackout schedule.");
  }

  return (
    <main className="page-content">
      {toastMessage ? <div className="app-toast">{toastMessage}</div> : null}

      <div style={{ marginBottom: 20 }}>
        <Link href="/inventory" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> Back to Inventory
        </Link>
      </div>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Equipment Maintenance & Timeline</p>
          <h1 className="page-title">{item.name}</h1>
          <p className="page-subtitle">
            IT-{String(item.item_id).padStart(3, "0")} · {item.category_name} · Total Pool: {item.total_stock} units
          </p>
        </div>

        <button
          onClick={() => setShowAddBlackoutModal(true)}
          className="button button-primary"
          style={{ height: 38 }}
        >
          <Plus size={15} /> Schedule Blackout Interval
        </button>
      </div>

      {/* Item Overview Metrics */}
      <section className="metrics-grid" style={{ marginBottom: 22 }}>
        <article className="metric-card">
          <div className="metric-top">
            <span>Total Physical Stock</span>
            <span className="metric-icon"><Warehouse size={15} /></span>
          </div>
          <div className="metric-value">{item.total_stock}</div>
          <div className="metric-foot">
            <span className="delta-up">Total units</span>
            <span>in warehouse pool</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Active Blackout Intervals</span>
            <span className="metric-icon"><Wrench size={15} color="#b8754b" /></span>
          </div>
          <div className="metric-value">{blackouts.length}</div>
          <div className="metric-foot">
            <span className="delta-flat">Scheduled holds</span>
            <span>preventing booking</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Committed Allocations</span>
            <span className="metric-icon"><Clock size={15} /></span>
          </div>
          <div className="metric-value">{itemAllocations.length}</div>
          <div className="metric-foot">
            <span className="delta-up">Active reservations</span>
            <span>consuming stock</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Rental Unit Price</span>
            <span className="metric-icon"><Calendar size={15} /></span>
          </div>
          <div className="metric-value">₹{item.price_per_day.toLocaleString("en-IN")}</div>
          <div className="metric-foot">
            <span>Security deposit:</span>
            <strong>₹{item.security_deposit.toLocaleString("en-IN")}</strong>
          </div>
        </article>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Scheduled Blackout Dates Manager */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Maintenance & Blackout Dates ({blackouts.length})</h2>
              <div className="panel-description">
                Stock is strictly blocked from both individual bookings and packages during blackout dates.
              </div>
            </div>
            <button
              onClick={() => setShowAddBlackoutModal(true)}
              className="button button-secondary"
              style={{ height: 32, fontSize: 11 }}
            >
              <Plus size={13} /> Add Blackout
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Interval</th>
                  <th>Reason</th>
                  <th>Notes</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {blackouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "var(--ps-muted)" }}>
                      No blackout periods scheduled for this item.
                    </td>
                  </tr>
                ) : (
                  blackouts.map((b) => (
                    <tr key={b.blackout_id}>
                      <td>
                        <strong>{b.start_date} to {b.end_date}</strong>
                      </td>
                      <td>
                        <span className={`badge ${b.reason === "maintenance" ? "badge-blue" : b.reason === "repair" ? "badge-danger" : "badge-amber"}`}>
                          {b.reason}
                        </span>
                      </td>
                      <td style={{ color: "var(--ps-muted)", maxWidth: 180, whiteSpace: "normal" }}>
                        {b.notes || "Routine service"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleRemoveBlackout(b.blackout_id)}
                          className="icon-button"
                          style={{ width: 28, height: 28, color: "var(--ps-danger)", display: "inline-grid" }}
                          title="Delete blackout"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Active Allocations Timeline */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Active Stock Allocations ({itemAllocations.length})</h2>
              <div className="panel-description">
                Committed units from direct rentals and bundled packages.
              </div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Dates</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {itemAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "var(--ps-muted)" }}>
                      No active allocations currently holding this stock pool.
                    </td>
                  </tr>
                ) : (
                  itemAllocations.map((a, idx) => (
                    <tr key={idx}>
                      <td>
                        <Link href={`/bookings/${a.bookingId}`} className="text-link">
                          #PS-{a.bookingId}
                        </Link>
                      </td>
                      <td>{a.customerName}</td>
                      <td>{a.startDate} – {a.endDate}</td>
                      <td>
                        <strong>{a.quantity} units</strong>
                      </td>
                      <td>
                        <span className={`badge ${a.status === "reserved" ? "badge-sage" : a.status === "held" ? "badge-amber" : "badge-gray"}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Add Blackout Modal */}
      {showAddBlackoutModal ? (
        <div className="modal-overlay" onClick={() => setShowAddBlackoutModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Blackout Date Interval</h3>
              <button className="icon-button" aria-label="Close dialog" onClick={() => setShowAddBlackoutModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddBlackout}>
              <div className="modal-body">
                {formError ? (
                  <div style={{ padding: "10px 12px", background: "#fdf2f2", border: "1px solid #f5cfcf", borderRadius: 8, color: "#9c3b3b", fontSize: 12 }}>
                    {formError}
                  </div>
                ) : null}

                <div className="form-group">
                  <label className="form-label">Blackout Start Date</label>
                  <input
                    type="date"
                    required
                    value={blackoutStart}
                    onChange={(e) => setBlackoutStart(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blackout End Date</label>
                  <input
                    type="date"
                    required
                    value={blackoutEnd}
                    onChange={(e) => setBlackoutEnd(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <select
                    value={blackoutReason}
                    onChange={(e) => setBlackoutReason(e.target.value as BlackoutReason)}
                    className="form-select"
                  >
                    <option value="maintenance">Routine Maintenance & Polishing</option>
                    <option value="repair">Damage Repair & Safety Overhaul</option>
                    <option value="vendor_holiday">Vendor Holiday / Warehouse Closure</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Details</label>
                  <textarea
                    value={blackoutNotes}
                    onChange={(e) => setBlackoutNotes(e.target.value)}
                    placeholder="Specific repair or service notes…"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowAddBlackoutModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Confirm Blackout Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function ItemInventoryDetailPage() {
  return (
    <Suspense fallback={<div className="page-content">Loading item inventory details…</div>}>
      <ItemInventoryDetailContent />
    </Suspense>
  );
}
