"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  AlertTriangle,
  Layers,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShieldCheck,
  DollarSign,
  User,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import { BookingStatus } from "@/lib/types";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = Number(params.bookingId);

  const [currentUser] = useState(() => mockStore.getActiveUser());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Load Booking
  const [booking, setBooking] = useState(() => mockStore.getBookingById(bookingId));

  const refreshBooking = () => {
    const b = mockStore.getBookingById(bookingId);
    setBooking(b);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!booking) {
    return (
      <div className="space-y-4">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h2 className="text-base font-bold text-stone-900">Booking #{bookingId} Not Found</h2>
          <p className="text-xs text-stone-500 mt-1">
            This reservation record does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Handlers
  const handleAccept = () => {
    try {
      mockStore.acceptBooking(bookingId);
      refreshBooking();
      showToast("Booking confirmed! Inventory moved to reserved status.");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmReject = () => {
    try {
      mockStore.rejectBooking(bookingId, rejectReason || "Declined by vendor");
      refreshBooking();
      setShowRejectModal(false);
      showToast("Booking rejected. Inventory holds released.");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmReturn = () => {
    try {
      mockStore.markBookingReturned(bookingId);
      refreshBooking();
      setShowReturnModal(false);
      showToast("Order marked as returned! Vendor settlement generated.");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmCancel = () => {
    try {
      const res = mockStore.cancelBooking(
        bookingId,
        currentUser.role === "vendor" ? "vendor" : "customer",
        cancelReason || "Cancelled by user"
      );
      refreshBooking();
      setShowCancelModal(false);
      showToast(
        `Booking cancelled. Refund of ₹${res.refundAmount.toLocaleString("en-IN")} credited. Stock released.`
      );
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed Reservation
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Approval (Inventory Held)
          </span>
        );
      case "partially_confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Partially Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 border border-stone-200">
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            Completed & Returned
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Cancelled & Stock Released
          </span>
        );
    }
  };

  // Allocation status styling
  const allocBadge = (status: string) => {
    switch (status) {
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            Reserved
          </span>
        );
      case "held":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
            Held (Temp)
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700">
            Returned
          </span>
        );
      case "released":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700">
            Released to Pool
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const totalPaid = (booking.payments || [])
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-stone-900 text-white px-4 py-3 shadow-xl flex items-center gap-2.5 text-sm animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Bookings
        </Link>
        <span className="text-xs text-stone-400 font-mono">
          Booking ID: #PS-{booking.booking_id}
        </span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Booking #PS-{booking.booking_id}
            </h1>
            {statusBadge(booking.status)}
          </div>
          <p className="text-xs text-stone-500 mt-1.5 flex items-center gap-2">
            <span>Created on {new Date(booking.created_at).toLocaleString("en-IN")}</span>
            <span>·</span>
            <span className="capitalize font-medium text-stone-700">
              {booking.event_type} Function
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {booking.status === "pending" && (
            <>
              <button
                onClick={handleAccept}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-2xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept & Confirm Reservation
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-red-600 bg-white border border-stone-200 hover:bg-red-50 px-3.5 py-2 rounded-lg transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Reject Request
              </button>
            </>
          )}

          {booking.status === "confirmed" && (
            <>
              <button
                onClick={() => setShowReturnModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 bg-amber-300 hover:bg-amber-400 px-4 py-2 rounded-lg shadow-2xs transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Mark Goods Returned
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-2 rounded-lg transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Cancel Booking
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid: Details, Customer, Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer Information Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-2">
            <User className="w-4 h-4 text-amber-600" />
            Customer Information
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Primary Contact</span>
              <span className="font-semibold text-stone-800 text-sm">
                {booking.customer_name}
              </span>
            </div>
            {booking.customer_phone && (
              <div className="flex items-center gap-2 text-stone-600">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{booking.customer_phone}</span>
              </div>
            )}
            {booking.customer_email && (
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{booking.customer_email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Schedule & Delivery */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            Event Dates & Logistics
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-stone-400 block text-[11px]">Rental Duration (Inclusive)</span>
              <span className="font-semibold text-stone-800 text-sm">
                {booking.event_start_date} → {booking.event_end_date}
              </span>
            </div>
            <div className="flex items-start gap-2 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0 mt-0.5" />
              <span>
                {booking.delivery_address ? (
                  <>
                    <strong className="text-stone-800 block">
                      {booking.delivery_address.city} Venue Delivery
                    </strong>
                    {booking.delivery_address.address_line}, {booking.delivery_address.city} -{" "}
                    {booking.delivery_address.pincode}
                  </>
                ) : (
                  "Main Kalyana Mantapa / On-site Vendor Setup"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm border-b border-stone-100 pb-2">
            <CreditCard className="w-4 h-4 text-amber-600" />
            Financial Summary
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Total Booking Amount:</span>
              <span className="font-bold text-stone-900 text-sm">
                ₹{booking.total_amount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Advance Paid:</span>
              <span className="font-semibold text-emerald-700">
                ₹{totalPaid.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Balance Remaining:</span>
              <span className="font-semibold text-stone-800">
                ₹{Math.max(0, booking.total_amount - totalPaid).toLocaleString("en-IN")}
              </span>
            </div>
            {booking.applied_coupon && (
              <div className="pt-1 text-[11px] text-emerald-700 font-medium">
                Coupon Applied: {booking.applied_coupon.code} (
                {booking.applied_coupon.discount_type === "percentage"
                  ? `${booking.applied_coupon.discount_value}% off`
                  : `₹${booking.applied_coupon.discount_value} off`}
                )
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booked Items and Direct Line Items */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-800" />
            <h3 className="font-bold text-sm text-stone-900">
              Ordered Package & Equipment Lines
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-500">
            {(booking.items || []).length} Lines
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {(booking.items || []).map((item) => (
            <div key={item.booking_item_id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {item.primary_image ? (
                  <img
                    src={item.primary_image}
                    alt={item.package_name || item.item_name}
                    className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-stone-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-stone-400" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-sm">
                      {item.package_name || item.item_name}
                    </h4>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {item.package_id ? "Combo Package" : "Direct Equipment"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Vendor: {item.vendor_name || "Platform Vendor"} · Fulfillment:{" "}
                    <span className="capitalize">{item.fulfillment_type}</span>
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <div>
                  <span className="text-[11px] text-stone-400 block">Quantity</span>
                  <span className="text-sm font-bold text-stone-800">× {item.quantity}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Unit Price / Day</span>
                  <span className="text-sm font-bold text-stone-900">
                    ₹{item.price_at_booking.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authoritative Stock Allocations Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-stone-900">
              Physical Stock Allocations (Database Constraints Enforced)
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            {(booking.allocations || []).length} Allocated Unit Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/60 text-stone-600 border-b border-stone-200">
                <th className="py-2.5 px-4 font-semibold">Allocation ID</th>
                <th className="py-2.5 px-4 font-semibold">Inventory Item</th>
                <th className="py-2.5 px-4 font-semibold">Units Allocated</th>
                <th className="py-2.5 px-4 font-semibold">Allocated Date Interval</th>
                <th className="py-2.5 px-4 font-semibold">Allocation State</th>
                <th className="py-2.5 px-4 font-semibold">Return Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(booking.allocations || []).map((alloc) => (
                <tr key={alloc.allocation_id} className="hover:bg-stone-50/80">
                  <td className="py-3 px-4 font-mono font-medium text-stone-500">
                    #AL-{alloc.allocation_id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-stone-800">
                    {alloc.item_name || `Item #${alloc.item_id}`}
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-900">
                    {alloc.quantity_allocated} units
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {alloc.rental_start_date} → {alloc.rental_end_date}
                  </td>
                  <td className="py-3 px-4">{allocBadge(alloc.allocation_status)}</td>
                  <td className="py-3 px-4 text-stone-500">
                    {alloc.returned_at
                      ? new Date(alloc.returned_at).toLocaleString("en-IN")
                      : "Pending Event Return"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Receipts & Transaction Log */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <DollarSign className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-sm text-stone-900">
            Payment Transactions & Settlement Trail
          </h3>
        </div>

        <div className="space-y-2">
          {(booking.payments || []).map((p) => (
            <div
              key={p.payment_id}
              className="flex items-center justify-between p-3.5 rounded-lg border border-stone-200 bg-stone-50 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200 text-stone-700">
                  {p.transaction_ref}
                </span>
                <div>
                  <span className="font-semibold text-stone-900 capitalize">
                    {p.payment_type} Payment ({p.payment_method.toUpperCase()})
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    {new Date(p.transaction_date).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-sm text-stone-900">
                  ₹{p.amount.toLocaleString("en-IN")}
                </span>
                <span
                  className={`block text-[11px] font-semibold capitalize ${
                    p.status === "success"
                      ? "text-emerald-700"
                      : p.status === "refunded"
                      ? "text-rose-700"
                      : "text-amber-700"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Reject Booking Request</h3>
            <p className="text-xs text-stone-600">
              Provide a reason for turning down this reservation. All held stock will be unlocked
              immediately.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:ring-2 focus:ring-stone-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-stone-900 text-base">Confirm Equipment Return</h3>
            <p className="text-xs text-stone-600">
              Confirm that all decoration items and equipment for Booking #PS-{bookingId} have been
              inspected and returned. This will transition allocations to &quot;returned&quot; and generate
              the vendor settlement record.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Return & Generate Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-stone-900 text-base text-rose-600">
              Cancel Booking #PS-{bookingId}
            </h3>
            <p className="text-xs text-stone-600">
              Cancelling releases allocated stock back to available pool immediately and applies the
              standard tiered cancellation refund policy.
            </p>
            <textarea
              rows={2}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:ring-2 focus:ring-stone-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
              >
                Execute Cancellation & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
