"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BellRing,
  Boxes,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Warehouse,
  X,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import type { EventType } from "@/lib/types";

function ItemDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();


  const itemId = Number(params.itemId);
  const initialStart = searchParams.get("startDate") || "2026-11-10";
  const initialEnd = searchParams.get("endDate") || "2026-11-12";

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [requestedQty, setRequestedQty] = useState(1);

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ bookingId: number; amount: number } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [waitlistDone, setWaitlistDone] = useState(false);

  const item = useMemo(() => mockStore.getItemById(itemId), [itemId]);
  const activeUser = useMemo(() => mockStore.getActiveUser(), []);

  // Check date-range availability
  const availability = useMemo(() => {
    if (!item) return null;
    return mockStore.checkItemAvailability(itemId, startDate, endDate);
  }, [item, itemId, startDate, endDate]);

  const rentalDays = useMemo(() => {
    try {
      const s = new Date(startDate);
      const e = new Date(endDate);
      const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [startDate, endDate]);

  if (!item) {
    return (
      <main className="page-content">
        <div className="module-placeholder" style={{ padding: 40, textAlign: "center" }}>
          <h2>Equipment Item Not Found</h2>
          <p>The requested rental item could not be found in our inventory.</p>
          <div style={{ marginTop: 20 }}>
            <Link href="/catalog?view=items" className="button button-primary">
              <ArrowLeft size={14} /> Back to Catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = item.price_per_day * rentalDays * requestedQty;
  const securityDeposit = item.security_deposit * requestedQty;
  const totalAmount = subtotal + securityDeposit;
  const advanceRequired = Math.round(totalAmount * 0.5);

  function handleDirectBooking() {
    setIsSubmitting(true);
    setBookingError(null);

    try {
      const result = mockStore.createBooking({
        customerId: 1, // Aarav Sharma
        deliveryAddressId: selectedAddressId,
        eventType,
        startDate,
        endDate,
        lines: [
          {
            itemId: item!.item_id,
            quantity: requestedQty,
            fulfillmentType: "delivery",
          },
        ],
      });

      setBookingSuccess({
        bookingId: result.booking.booking_id,
        amount: result.booking.total_amount,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to allocate item stock";
      setBookingError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleJoinWaitlist() {
    mockStore.addToWaitlist({
      customer_id: 1, // Aarav Sharma
      item_id: item!.item_id,
      requested_start_date: startDate,
      requested_end_date: endDate,
      customer_name: activeUser.name,
      customer_phone: activeUser.phone,
      item_name: item!.name,
    });
    setWaitlistDone(true);
  }


  const isAvailable = availability ? availability.available_stock >= requestedQty && !availability.is_blacked_out : false;

  return (
    <main className="page-content">
      <div style={{ marginBottom: 20 }}>
        <Link href="/catalog?view=items" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> Back to Equipment Inventory
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Left Column: Visuals & Item Specifications */}
        <div>
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--ps-border)", background: "#ffffff", marginBottom: 22 }}>
            <div style={{ height: 320, width: "100%", background: "#eceae4", position: "relative" }}>
              {item.primary_image ? (
                <img
                  src={item.primary_image}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#9aa3a8" }}>
                  <Boxes size={54} />
                </div>
              )}
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <span className="badge badge-gray">{item.category_name}</span>
              </div>
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(255,255,255,0.92)", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "var(--ps-navy)" }}>
                Condition: <span style={{ textTransform: "capitalize" }}>{item.condition}</span>
              </div>
            </div>

            <div style={{ padding: "24px 26px" }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 8px", color: "var(--ps-ink)" }}>
                {item.name}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--ps-muted)", marginBottom: 16 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Warehouse size={14} color="var(--ps-navy)" /> {item.vendor_name}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={14} color="#8a949a" /> {item.vendor_city}
                </span>
                <span className="badge badge-sage">
                  <ShieldCheck size={12} /> Verified Vendor
                </span>
              </div>

              <p style={{ margin: 0, color: "#47545e", fontSize: 13, lineHeight: 1.7 }}>
                {item.description}
              </p>
            </div>
          </div>

          {/* Specifications Table */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Equipment Specifications</h2>
                <div className="panel-description">Technical details and rental parameters</div>
              </div>
            </div>

            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 12 }}>
                <div>
                  <span style={{ color: "var(--ps-muted)", display: "block", fontSize: 11 }}>Category:</span>
                  <strong>{item.category_name}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ps-muted)", display: "block", fontSize: 11 }}>Minimum Rental Period:</span>
                  <strong>{item.min_rental_days} {item.min_rental_days === 1 ? "day" : "days"}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ps-muted)", display: "block", fontSize: 11 }}>Total Stock Pool:</span>
                  <strong>{item.total_stock} interchangeable units</strong>
                </div>
                <div>
                  <span style={{ color: "var(--ps-muted)", display: "block", fontSize: 11 }}>Security Deposit:</span>
                  <strong>₹{item.security_deposit.toLocaleString("en-IN")} / unit</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Date Selection, Live Stock Check & Booking */}
        <div>
          <div className="panel" style={{ padding: 22, position: "sticky", top: 90 }}>
            <div style={{ borderBottom: "1px solid var(--ps-border)", paddingBottom: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--ps-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Rental Rate
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: "var(--ps-ink)" }}>
                  ₹{item.price_per_day.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 12, color: "var(--ps-muted)" }}>/ unit / day</span>
              </div>
            </div>

            {/* Date Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <div className="form-group">
                <label className="form-label">Rental Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rental End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">
                  <span>Quantity Needed</span>
                  <span className="form-hint">{availability?.available_stock || 0} units available</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setRequestedQty(Math.max(1, requestedQty - 1))}
                    disabled={requestedQty <= 1}
                    className="button button-secondary"
                    style={{ width: 36, height: 36, padding: 0 }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={availability?.available_stock || 1}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(Math.max(1, Number(e.target.value)))}
                    className="form-input"
                    style={{ width: 70, textAlign: "center", height: 36 }}
                  />
                  <button
                    onClick={() => setRequestedQty(requestedQty + 1)}
                    disabled={requestedQty >= (availability?.available_stock || 1)}
                    className="button button-secondary"
                    style={{ width: 36, height: 36, padding: 0 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Availability Banner */}
            <div style={{ marginBottom: 18 }}>
              {availability?.is_blacked_out ? (
                <div style={{ padding: "12px 14px", background: "#fdf2f2", borderRadius: 8, border: "1px solid #f5cfcf", color: "#9c3b3b", fontSize: 12 }}>
                  <div style={{ fontWeight: 750, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <AlertCircle size={15} /> Scheduled Maintenance Blackout
                  </div>
                  <div>This item is unavailable due to: {availability.blackout_reason}.</div>
                </div>
              ) : availability && availability.available_stock >= requestedQty ? (
                <div style={{ padding: "12px 14px", background: "#edf5ee", borderRadius: 8, border: "1px solid #d5e6d8", color: "#366344", fontSize: 12 }}>
                  <div style={{ fontWeight: 750, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <CheckCircle2 size={15} /> Stock Available
                  </div>
                  <div>
                    {availability.available_stock} units free in pool for {startDate} to {endDate} ({rentalDays} days).
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 14px", background: "#fdf3e2", borderRadius: 8, border: "1px solid #f3deb2", color: "#8a5e18", fontSize: 12 }}>
                  <div style={{ fontWeight: 750, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <AlertCircle size={15} /> Limited / Fully Booked Stock
                  </div>
                  <div>
                    Only {availability?.available_stock || 0} units remain free for these dates.
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Summary */}
            <div style={{ background: "#fbfaf7", padding: "12px 14px", borderRadius: 8, border: "1px solid #f0eee8", marginBottom: 18, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--ps-muted)" }}>Rental: ₹{item.price_per_day} × {rentalDays}d × {requestedQty}u</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--ps-muted)" }}>Refundable Deposit</span>
                <span>₹{securityDeposit.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid #e8e6de", fontWeight: 750 }}>
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* CTAs */}
            {isAvailable ? (
              <button
                onClick={() => setShowBookingModal(true)}
                className="button button-primary"
                style={{ width: "100%", height: 42 }}
              >
                Book Direct Rental ({requestedQty} units) →
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  disabled
                  className="button button-secondary"
                  style={{ width: "100%", height: 42, opacity: 0.6 }}
                >
                  Unavailable on Selected Dates
                </button>
                <button
                  onClick={() => setShowWaitlistModal(true)}
                  className="button button-primary"
                  style={{ width: "100%", height: 40, background: "var(--ps-accent)" }}
                >
                  <BellRing size={14} /> Join Item Waitlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {showBookingModal ? (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowBookingModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Confirm Direct Rental</h3>
                <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                  {item.name} ({requestedQty} units · {rentalDays} days)
                </div>
              </div>
              <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setShowBookingModal(false)}
                disabled={isSubmitting}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {bookingSuccess ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ display: "inline-grid", placeItems: "center", width: 50, height: 50, borderRadius: "50%", background: "#edf5ee", color: "#366344", marginBottom: 14 }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 750 }}>
                    Rental Booking Confirmed!
                  </h4>
                  <p style={{ color: "var(--ps-muted)", fontSize: 12, margin: "0 0 16px" }}>
                    Booking reference <strong>#PS-{bookingSuccess.bookingId}</strong> has allocated {requestedQty} units from stock pool.
                  </p>

                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <Link href="/customer/bookings" className="button button-primary">
                      View in My Bookings
                    </Link>
                    <button
                      onClick={() => {
                        setShowBookingModal(false);
                        setBookingSuccess(null);
                      }}
                      className="button button-secondary"
                    >
                      Back to Item
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {bookingError ? (
                    <div style={{ padding: "10px 12px", background: "#fdf2f2", border: "1px solid #f5cfcf", borderRadius: 8, color: "#9c3b3b", fontSize: 12 }}>
                      {bookingError}
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="form-select"
                    >
                      <option value="wedding">Wedding Ceremony</option>
                      <option value="reception">Wedding Reception</option>
                      <option value="engagement">Engagement</option>
                      <option value="sangeet">Sangeet / Mehendi</option>
                      <option value="other">Other Auspicious Function</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Destination</label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(Number(e.target.value))}
                      className="form-select"
                    >
                      <option value={1}>Home: Flat 402, Green Glen Towers, Bellandur, Bengaluru</option>
                      <option value={2}>Venue: Palace Grounds, Main Gate 4, Bellary Road, Bengaluru</option>
                      <option value={3}>Venue: The Leela Convention Hall, Old Airport Road, Bengaluru</option>
                    </select>
                  </div>

                  <div style={{ background: "#fbfaf7", padding: "12px 14px", borderRadius: 8, border: "1px solid #f0eee8", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--ps-muted)" }}>Rental ({rentalDays} days × {requestedQty}u):</span>
                      <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--ps-muted)" }}>Deposit:</span>
                      <strong>₹{securityDeposit.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid #e8e6de", fontWeight: 750 }}>
                      <span>Advance Simulated Payment (50%):</span>
                      <strong style={{ color: "var(--ps-navy)" }}>₹{advanceRequired.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>

            {!bookingSuccess ? (
              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setShowBookingModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={handleDirectBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Allocating…" : "Confirm Booking"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Waitlist Modal */}
      {showWaitlistModal ? (
        <div className="modal-overlay" onClick={() => setShowWaitlistModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Join Inventory Waitlist</h3>
                <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                  {item.name} ({startDate} to {endDate})
                </div>
              </div>
              <button className="icon-button" aria-label="Close dialog" onClick={() => setShowWaitlistModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              {waitlistDone ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ display: "inline-grid", placeItems: "center", width: 44, height: 44, borderRadius: "50%", background: "#edf5ee", color: "#366344", marginBottom: 12 }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 750 }}>Added to Waitlist</h4>
                  <p style={{ color: "var(--ps-muted)", fontSize: 12, margin: "0 0 16px" }}>
                    You will receive priority notification if an existing booking is cancelled or vendor inventory is replenished.
                  </p>
                  <button onClick={() => setShowWaitlistModal(false)} className="button button-primary">
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--ps-muted)" }}>
                    This item currently has high booking contention for your requested dates. Join the waitlist to receive instant priority notification if stock opens up:
                  </p>
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input type="text" readOnly value={activeUser.name} className="form-input" style={{ background: "#f6f8fa" }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input type="text" readOnly value={activeUser.phone || "+91 98450 12345"} className="form-input" style={{ background: "#f6f8fa" }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Requested Rental Interval</label>
                    <input type="text" readOnly value={`${startDate} to ${endDate} (${rentalDays} days)`} className="form-input" style={{ background: "#f6f8fa" }} />
                  </div>
                </>
              )}
            </div>

            {!waitlistDone ? (
              <div className="modal-footer">
                <button className="button button-secondary" onClick={() => setShowWaitlistModal(false)}>
                  Cancel
                </button>
                <button className="button button-primary" onClick={handleJoinWaitlist}>
                  Confirm Waitlist Entry
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function ItemDetailPage() {
  return (
    <Suspense fallback={<div className="page-content">Loading item details…</div>}>
      <ItemDetailContent />
    </Suspense>
  );
}
