"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  XCircle,
  Eye,
  AlertTriangle,
  Sparkles,
  Tag,
  Phone,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import { Booking, BookingStatus } from "@/lib/types";

export default function BookingsPage() {
  const [currentUser] = useState(() => mockStore.getActiveUser());
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [rejectingBookingId, setRejectingBookingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [returningBookingId, setReturningBookingId] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getVendorOrCustomerId = (user: typeof currentUser) => {
    if (user.role === "vendor") {
      const v = mockStore.getVendorForUser(user.user_id);
      return { vendorId: v?.vendor_id || 1 };
    }
    if (user.role === "customer") {
      const c = mockStore.getCustomerForUser(user.user_id);
      return { customerId: c?.customer_id || 1 };
    }
    return {};
  };

  const [bookingsList, setBookingsList] = useState<Booking[]>(() => {
    const filters = getVendorOrCustomerId(currentUser);
    return mockStore.getBookings(filters);
  });

  const refreshBookings = () => {
    const filters = getVendorOrCustomerId(currentUser);
    setBookingsList(mockStore.getBookings(filters));
  };

  const filteredBookings = useMemo(() => {
    return bookingsList.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = `ps-${b.booking_id}`.includes(q) || `${b.booking_id}`.includes(q);
        const matchesCustomer = b.customer_name?.toLowerCase().includes(q) || false;
        const matchesEvent = b.event_type.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesEvent) return false;
      }
      return true;
    });
  }, [bookingsList, statusFilter, searchQuery]);

  // Action Handlers
  const handleAccept = (bookingId: number) => {
    try {
      mockStore.acceptBooking(bookingId);
      refreshBookings();
      showToast(`Booking #PS-${bookingId} confirmed! Inventory allocations moved to reserved.`);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingBookingId) return;
    try {
      mockStore.rejectBooking(rejectingBookingId, rejectReason || "Declined by vendor");
      refreshBookings();
      showToast(`Booking #PS-${rejectingBookingId} rejected. Inventory allocations released.`);
      setRejectingBookingId(null);
      setRejectReason("");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmReturn = () => {
    if (!returningBookingId) return;
    try {
      mockStore.markBookingReturned(returningBookingId);
      refreshBookings();
      showToast(
        `Booking #PS-${returningBookingId} marked as returned & completed! Settlement payout generated.`
      );
      setReturningBookingId(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingBookingId) return;
    try {
      const res = mockStore.cancelBooking(
        cancellingBookingId,
        currentUser.role === "vendor" ? "vendor" : "customer",
        cancelReason || "User requested cancellation"
      );
      refreshBookings();
      showToast(
        `Booking #PS-${cancellingBookingId} cancelled. Refund of ₹${res.refundAmount.toLocaleString(
          "en-IN"
        )} processed. Stock returned to pool.`
      );
      setCancellingBookingId(null);
      setCancelReason("");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Approval
          </span>
        );
      case "partially_confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" />
            Partially Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700 border border-stone-200">
            <RotateCcw className="w-3 h-3 text-stone-500" />
            Returned & Settled
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-stone-900 text-white px-4 py-3 shadow-xl flex items-center gap-2.5 text-sm animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Event Bookings & Orders
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700 border border-stone-200">
              {filteredBookings.length} Total
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Track customer reservation requests, atomic inventory allocation statuses, return
            confirmations, and policy-driven cancellations.
          </p>
        </div>

        {currentUser.role === "customer" && (
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Browse Catalog to Book
          </Link>
        )}
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search by #PS-ID, customer, event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-lg border border-stone-300 pl-9 pr-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(
            [
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "confirmed", label: "Confirmed" },
              { id: "completed", label: "Completed" },
              { id: "cancelled", label: "Cancelled" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No bookings found</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No reservations match your active search and status filter criteria."
              : "No reservation requests have been placed yet. Explore the catalog to test real booking allocations!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const hasMultipleItems = (b.items || []).length > 1;
            const primaryItem = b.items?.[0];

            return (
              <div
                key={b.booking_id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:border-stone-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Booking Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-md">
                      #PS-{b.booking_id}
                    </span>
                    {statusBadge(b.status)}
                    <span className="inline-flex items-center gap-1 rounded-md bg-stone-50 px-2 py-0.5 text-xs font-medium text-stone-600 border border-stone-200 capitalize">
                      <Tag className="w-3 h-3 text-stone-400" />
                      {b.event_type}
                    </span>
                    <span className="text-xs text-stone-400">
                      Booked {new Date(b.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {/* Customer & Event Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[11px]">Customer Contact</span>
                      <span className="font-semibold text-stone-800">{b.customer_name}</span>
                      {b.customer_phone && (
                        <span className="text-stone-500 block text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-2.5 h-2.5" />
                          {b.customer_phone}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[11px]">Inclusive Event Dates</span>
                      <div className="flex items-center gap-1 font-semibold text-stone-800">
                        <Calendar className="w-3.5 h-3.5 text-amber-600" />
                        <span>
                          {b.event_start_date} → {b.event_end_date}
                        </span>
                      </div>
                      <span className="text-stone-400 text-[10px]">
                        Allocations active across full duration
                      </span>
                    </div>

                    <div>
                      <span className="text-stone-400 block text-[11px]">Reserved Items / Line</span>
                      <div className="font-semibold text-stone-800 truncate" title={primaryItem?.package_name || primaryItem?.item_name}>
                        {primaryItem?.package_name || primaryItem?.item_name || "Rental Items"}
                        {hasMultipleItems && (
                          <span className="text-stone-400 font-normal">
                            {" "}
                            (+{b.items!.length - 1} more)
                          </span>
                        )}
                      </div>
                      <span className="text-stone-500 text-[11px]">
                        {(b.allocations || []).length} physical stock units allocated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Pricing & Action Controls */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-stone-100 gap-3">
                  <div className="text-left lg:text-right">
                    <span className="text-[11px] text-stone-500 block">Total Rental Amount</span>
                    <span className="text-lg font-bold text-stone-900">
                      ₹{b.total_amount.toLocaleString("en-IN")}
                    </span>
                    {b.applied_coupon && (
                      <span className="text-[10px] text-emerald-700 block font-medium">
                        Coupon {b.applied_coupon.code} applied
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Details Link */}
                    <Link
                      href={`/bookings/${b.booking_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Link>

                    {/* Pending Actions for Vendor / Admin */}
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(b.booking_id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept
                        </button>
                        <button
                          onClick={() => setRejectingBookingId(b.booking_id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-red-600 bg-white border border-stone-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Confirmed Actions */}
                    {b.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => setReturningBookingId(b.booking_id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-900 bg-amber-300 hover:bg-amber-400 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Mark Returned
                        </button>
                        <button
                          onClick={() => setCancellingBookingId(b.booking_id)}
                          className="text-xs font-medium text-stone-500 hover:text-rose-600 px-2 py-1.5 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-stone-900">
                Reject Booking Request #PS-{rejectingBookingId}
              </h3>
            </div>
            <p className="text-xs text-stone-600">
              Rejecting this booking will release all temporary inventory holds and notify the customer.
            </p>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Reason for rejection
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Venue capacity constraints, scheduling clash..."
                className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingBookingId(null)}
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

      {/* Return & Complete Modal */}
      {returningBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="font-bold text-stone-900">
                Confirm Return for Booking #PS-{returningBookingId}
              </h3>
            </div>
            <p className="text-xs text-stone-600">
              This confirms that all equipment/package items have been returned in satisfactory condition.
              Physical stock allocations will transition to <span className="font-semibold text-stone-800">returned</span>, and a vendor settlement payout record will be generated automatically.
            </p>
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 space-y-1">
              <div className="flex justify-between">
                <span>Inventory Pool Restored:</span>
                <span className="font-semibold text-emerald-700">Immediate</span>
              </div>
              <div className="flex justify-between">
                <span>Vendor Settlement Generated:</span>
                <span className="font-semibold text-stone-800">Net after 10% commission</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReturningBookingId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer shadow-xs"
              >
                Confirm Return & Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal with Policy Preview */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-stone-900">
                Cancel Booking #PS-{cancellingBookingId}
              </h3>
            </div>
            <p className="text-xs text-stone-600">
              Cancelling releases allocated stock back to available pool immediately and applies the
              standard tiered cancellation refund policy.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
              <span className="font-semibold block">Platform Cancellation Policy Tiers:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-700">
                <li>&gt;30 days prior: 100% refund</li>
                <li>15-30 days prior: 75% refund</li>
                <li>7-14 days prior: 50% refund</li>
                <li>&lt;7 days prior: 0% refund (retention penalty)</li>
              </ul>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Cancellation Reason
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Event postponed, client request..."
                className="w-full text-xs rounded-lg border border-stone-300 p-2 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
              >
                Execute Cancellation & Release Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
