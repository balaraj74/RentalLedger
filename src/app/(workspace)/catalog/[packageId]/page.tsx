"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { Suspense, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Package,
  ShieldCheck,
  Warehouse,
  X,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import type { EventType } from "@/lib/types";

function PackageDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();


  const packageId = Number(params.packageId);
  const initialStart = searchParams.get("startDate") || "2026-11-10";
  const initialEnd = searchParams.get("endDate") || "2026-11-12";

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [packageQty, setPackageQty] = useState(1);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ bookingId: number; amount: number } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const pkg = useMemo(() => mockStore.getPackageById(packageId), [packageId]);
  const activeUser = useMemo(() => mockStore.getActiveUser(), []);

  // Compute live availability across all components
  const availability = useMemo(() => {
    if (!pkg) return null;
    return mockStore.checkPackageAvailability(packageId, startDate, endDate, packageQty);
  }, [pkg, packageId, startDate, endDate, packageQty]);

  // Compute inclusive rental duration in days
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

  if (!pkg) {
    return (
      <main className="page-content">
        <div className="module-placeholder" style={{ padding: 40, textAlign: "center" }}>
          <h2>Package not found</h2>
          <p>The requested decoration package could not be located in our catalog.</p>
          <div style={{ marginTop: 20 }}>
            <Link href="/catalog" className="button button-primary">
              <ArrowLeft size={14} /> Back to Catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Pricing calculations
  const dailyPrice = pkg.combo_price;
  const subtotal = dailyPrice * rentalDays * packageQty;
  const securityDeposit = 8000 * packageQty;

  // Coupon evaluation
  let discountAmount = 0;
  if (couponCode.trim().toUpperCase() === "WEDDING2026") {
    discountAmount = Math.round(subtotal * 0.10);
  } else if (couponCode.trim().toUpperCase() === "FESTIVE5000") {
    discountAmount = Math.min(subtotal, 5000);
  } else if (couponCode.trim().toUpperCase() === "EARLYBIRD") {
    discountAmount = Math.round(subtotal * 0.15);
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);
  const advanceRequired = Math.round(finalTotal * 0.5);

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (code === "WEDDING2026") {
      setCouponMessage({ text: "10% wedding discount applied successfully!", success: true });
    } else if (code === "FESTIVE5000") {
      setCouponMessage({ text: "₹5,000 flat festive discount applied!", success: true });
    } else if (code === "EARLYBIRD") {
      setCouponMessage({ text: "15% early bird discount applied!", success: true });
    } else {
      setCouponMessage({ text: "Invalid or expired coupon code", success: false });
    }
  }

  function handleConfirmBooking() {
    if (!pkg) return;
    setIsSubmitting(true);
    setBookingError(null);

    try {
      // Execute transaction in mock store
      const result = mockStore.createBooking({
        customerId: 1, // Aarav Sharma
        deliveryAddressId: selectedAddressId,
        eventType,
        startDate,
        endDate,
        couponCode: couponMessage?.success ? couponCode : undefined,
        lines: [
          {
            packageId: pkg.package_id,
            quantity: packageQty,
            fulfillmentType: "vendor_setup",
          },
        ],
      });


      setBookingSuccess({
        bookingId: result.booking.booking_id,
        amount: result.booking.total_amount,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to confirm reservation";
      setBookingError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-content">
      {/* Top breadcrumb & back link */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/catalog" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 1fr)", gap: 24, alignItems: "start" }}>
        {/* Left Column: Visuals & Package Components */}
        <div>
          {/* Main Visual Banner */}
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--ps-border)", background: "#ffffff", marginBottom: 22 }}>
            <div style={{ height: 340, width: "100%", background: "#eceae4", position: "relative" }}>
              {pkg.primary_image ? (
                <img
                  src={pkg.primary_image}
                  alt={pkg.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ display: "grid", placeItems: "center", height: "100%", color: "#9aa3a8" }}>
                  <Package size={54} />
                </div>
              )}
              <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {pkg.theme_tags.split(",").map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(24, 36, 50, 0.85)",
                      color: "#ffffff",
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 650,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: "24px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", color: "var(--ps-ink)" }}>
                    {pkg.name}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "var(--ps-muted)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Warehouse size={14} color="var(--ps-navy)" /> {pkg.vendor_name}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={14} color="#8a949a" /> {pkg.vendor_city}
                    </span>
                    <span className="badge badge-sage">
                      <ShieldCheck size={12} /> KYC Verified
                    </span>
                  </div>
                </div>
              </div>

              <p style={{ margin: "16px 0 0", color: "#47545e", fontSize: 13, lineHeight: 1.7 }}>
                {pkg.description}
              </p>
            </div>
          </div>

          {/* Included Components Breakdown with Stock Status */}
          <section className="panel">
            <div className="panel-header">
              <div>
                <h2 className="panel-title">Included Inventory Components ({pkg.components?.length || 0})</h2>
                <div className="panel-description">
                  Every package requirement consumes underlying physical stock from shared inventory pools.
                </div>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Component item</th>
                    <th>Qty per set</th>
                    <th>Total needed</th>
                    <th>Available in pool</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {availability?.components.map((c) => (
                    <tr key={c.item_id}>
                      <td>
                        <strong>{c.item_name}</strong>
                      </td>
                      <td>{c.required_per_package} units</td>
                      <td>
                        <strong>{c.total_required} units</strong>
                      </td>
                      <td>{c.available_stock} units</td>
                      <td>
                        {c.is_blacked_out ? (
                          <span className="badge badge-danger">Maintenance Blackout</span>
                        ) : c.available_stock >= c.total_required ? (
                          <span className="badge badge-sage">
                            <Check size={11} /> Stock Ready
                          </span>
                        ) : (
                          <span className="badge badge-amber">
                            <AlertCircle size={11} /> Shortage
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "14px 20px", background: "#fcfbfa", borderTop: "1px solid #f0f0eb", fontSize: 11, color: "var(--ps-muted)", display: "flex", alignItems: "center", gap: 8 }}>
              <HelpCircle size={14} color="var(--ps-accent)" />
              <span>
                <strong>Shared Pool Protection:</strong> Direct equipment rentals and package bookings compete for the exact same physical items.
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: Date Selection, Pricing & Reservation Card */}
        <div>
          <div className="panel" style={{ padding: 22, position: "sticky", top: 90 }}>
            <div style={{ borderBottom: "1px solid var(--ps-border)", paddingBottom: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "var(--ps-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Package Rental Price
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "var(--ps-ink)" }}>
                  ₹{pkg.combo_price.toLocaleString("en-IN")}
                </span>
                <span style={{ fontSize: 12, color: "var(--ps-muted)" }}>/ day</span>
              </div>
            </div>

            {/* Date Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
              <div className="form-group">
                <label className="form-label">
                  <span>Start Date</span>
                  <span className="form-hint">Setup begins</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>End Date</span>
                  <span className="form-hint">Dismantling finishes</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="form-group">
                <label className="form-label">
                  <span>Number of Sets</span>
                  <span className="form-hint">Max {availability?.available_packages || 0} bookable</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setPackageQty(Math.max(1, packageQty - 1))}
                    disabled={packageQty <= 1}
                    className="button button-secondary"
                    style={{ width: 36, height: 36, padding: 0 }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: 14, fontWeight: 750, minWidth: 32, textAlign: "center" }}>
                    {packageQty}
                  </span>
                  <button
                    onClick={() => setPackageQty(packageQty + 1)}
                    disabled={!availability?.is_fully_available || packageQty >= (availability?.available_packages || 1)}
                    className="button button-secondary"
                    style={{ width: 36, height: 36, padding: 0 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Availability Status Banner */}
            <div style={{ marginBottom: 20 }}>
              {availability?.is_fully_available ? (
                <div style={{ padding: "12px 14px", background: "#edf5ee", borderRadius: 8, border: "1px solid #d5e6d8", color: "#366344", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Available for requested dates:</strong> All {pkg.components?.length} physical items have sufficient stock from {startDate} to {endDate} ({rentalDays} {rentalDays === 1 ? "day" : "days"}).
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 14px", background: "#fdf3e2", borderRadius: 8, border: "1px solid #f3deb2", color: "#8a5e18", fontSize: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Stock Contested:</strong> Cannot reserve {packageQty} set(s). Constraint caused by: {availability?.bottleneck_item_name || "insufficient stock"}.
                  </div>
                </div>
              )}
            </div>


            {/* Estimated Total Breakdown */}
            <div style={{ background: "#fbfaf7", padding: "14px 16px", borderRadius: 10, border: "1px solid #f0eee8", marginBottom: 20, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--ps-muted)" }}>Daily rate × {rentalDays} days × {packageQty}</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--ps-muted)" }}>Refundable Security Deposit</span>
                <span>₹{securityDeposit.toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #e8e6de", fontWeight: 750, fontSize: 14 }}>
                <span>Estimated Total</span>
                <span>₹{(subtotal + securityDeposit).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => setShowBookingModal(true)}
              disabled={!availability?.is_fully_available}
              className="button button-primary"
              style={{ width: "100%", height: 44, fontSize: 13 }}
            >
              {availability?.is_fully_available ? "Proceed to Reservation →" : "Select Alternate Dates"}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {showBookingModal ? (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowBookingModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Confirm Rental Reservation</h3>
                <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                  {pkg.name} ({packageQty} set · {rentalDays} days)
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
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ display: "inline-grid", placeItems: "center", width: 52, height: 52, borderRadius: "50%", background: "#edf5ee", color: "#366344", marginBottom: 16 }}>
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 750 }}>
                    Booking Successfully Confirmed!
                  </h4>
                  <p style={{ color: "var(--ps-muted)", fontSize: 13, margin: "0 0 16px" }}>
                    Booking reference <strong>#PS-{bookingSuccess.bookingId}</strong> has been allocated across all component items.
                  </p>

                  <div style={{ background: "#fbfaf7", padding: "14px 18px", borderRadius: 10, border: "1px solid #eceae4", textAlign: "left", fontSize: 12, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--ps-muted)" }}>Event Dates:</span>
                      <strong>{startDate} to {endDate}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "var(--ps-muted)" }}>Total Rental Amount:</span>
                      <strong>₹{bookingSuccess.amount.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--ps-muted)" }}>Advance Recorded (50%):</span>
                      <strong style={{ color: "var(--ps-sage)" }}>₹{advanceRequired.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

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
                      Back to Catalog
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {bookingError ? (
                    <div style={{ padding: "12px 14px", background: "#fdf2f2", border: "1px solid #f5cfcf", borderRadius: 8, color: "#9c3b3b", fontSize: 12 }}>
                      <strong>Reservation Conflict:</strong> {bookingError}
                    </div>
                  ) : null}

                  {/* Customer Info */}
                  <div style={{ padding: "12px 16px", background: "#f6f8fa", borderRadius: 8, fontSize: 12 }}>
                    <div style={{ color: "var(--ps-muted)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Booking Contact</div>
                    <div style={{ fontWeight: 750, color: "var(--ps-ink)", marginTop: 2 }}>{activeUser.name} ({activeUser.email})</div>
                    <div style={{ color: "var(--ps-muted)", marginTop: 2 }}>Phone: {activeUser.phone || "+91 98450 12345"}</div>
                  </div>

                  {/* Event Type */}
                  <div className="form-group">
                    <label className="form-label">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
                      className="form-select"
                    >
                      <option value="wedding">Wedding Ceremony</option>
                      <option value="reception">Wedding Reception</option>
                      <option value="engagement">Engagement Ceremony</option>
                      <option value="sangeet">Sangeet / Mehendi Celebration</option>
                      <option value="other">Other Auspicious Function</option>
                    </select>
                  </div>

                  {/* Delivery Address */}
                  <div className="form-group">
                    <label className="form-label">Venue / Delivery Address</label>
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

                  {/* Coupon Code Input */}
                  <div className="form-group">
                    <label className="form-label">
                      <span>Promo Coupon</span>
                      <span className="form-hint">Try: WEDDING2026, FESTIVE5000, EARLYBIRD</span>
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="form-input"
                        style={{ textTransform: "uppercase" }}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="button button-secondary"
                        style={{ flexShrink: 0 }}
                      >
                        Apply
                      </button>
                    </div>
                    {couponMessage ? (
                      <div style={{ fontSize: 11, color: couponMessage.success ? "var(--ps-sage)" : "var(--ps-danger)", fontWeight: 650 }}>
                        {couponMessage.text}
                      </div>
                    ) : null}
                  </div>

                  {/* Payment Breakdown */}
                  <div style={{ background: "#fbfaf7", padding: "14px 16px", borderRadius: 10, border: "1px solid #f0eee8", fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "var(--ps-muted)" }}>Rental Subtotal ({rentalDays} days)</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    {discountAmount > 0 ? (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, color: "var(--ps-sage)" }}>
                        <span>Coupon Discount</span>
                        <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    ) : null}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ color: "var(--ps-muted)" }}>Security Deposit (Refundable)</span>
                      <span>₹{securityDeposit.toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #e8e6de", fontWeight: 750, fontSize: 14 }}>
                      <span>Total Booking Amount</span>
                      <span>₹{(finalTotal + securityDeposit).toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, color: "var(--ps-navy)", fontSize: 11 }}>
                      <span>50% Advance Simulated Payment:</span>
                      <strong>₹{advanceRequired.toLocaleString("en-IN")}</strong>
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
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Allocating Stock…" : "Confirm & Pay Advance"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function PackageDetailPage() {
  return (
    <Suspense fallback={<div className="page-content">Loading package details…</div>}>
      <PackageDetailContent />
    </Suspense>
  );
}
