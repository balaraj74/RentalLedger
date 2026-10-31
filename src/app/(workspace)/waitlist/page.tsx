"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Search,
  Calendar,
  Phone,
  ShieldAlert,
  Send,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import { Waitlist } from "@/lib/types";

export default function WaitlistPage() {
  const [currentUser] = useState(() => mockStore.getActiveUser());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Verification modal for stock check before notify
  const [verifyingEntry, setVerifyingEntry] = useState<Waitlist | null>(null);
  const [stockCheckResult, setStockCheckResult] = useState<{
    available: number;
    sufficient: boolean;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeVendorId = useMemo(() => {
    if (currentUser.role === "vendor") {
      const v = mockStore.getVendorForUser(currentUser.user_id);
      return v?.vendor_id;
    }
    return undefined;
  }, [currentUser]);

  const [waitlistEntries, setWaitlistEntries] = useState<Waitlist[]>(() =>
    mockStore.getWaitlist(activeVendorId)
  );

  const refreshWaitlist = () => {
    setWaitlistEntries(mockStore.getWaitlist(activeVendorId));
  };

  const filteredEntries = useMemo(() => {
    return waitlistEntries.filter((w) => {
      if (statusFilter !== "all" && w.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesItem = w.item_name?.toLowerCase().includes(q) || false;
        const matchesCustomer = w.customer_name?.toLowerCase().includes(q) || false;
        if (!matchesItem && !matchesCustomer) return false;
      }
      return true;
    });
  }, [waitlistEntries, statusFilter, searchQuery]);

  // Open Verify Modal & perform authoritative stock check
  const handleOpenNotifyCheck = (entry: Waitlist) => {
    setVerifyingEntry(entry);
    const avail = mockStore.checkItemAvailability(
      entry.item_id,
      entry.requested_start_date,
      entry.requested_end_date
    );
    const requiredQty = entry.requested_quantity || 1;
    setStockCheckResult({
      available: avail.available_stock,
      sufficient: avail.available_stock >= requiredQty,
    });
  };

  // Confirm Send Notification
  const handleConfirmNotify = () => {
    if (!verifyingEntry) return;
    try {
      mockStore.notifyWaitlistCustomer(verifyingEntry.waitlist_id);
      refreshWaitlist();
      showToast(
        `Availability notification dispatched to ${verifyingEntry.customer_name} via SMS and in-app message!`
      );
      setVerifyingEntry(null);
      setStockCheckResult(null);
    } catch (err: unknown) {
      alert((err as Error).message);
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
              Demand Waitlist & Notifications
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
              <Bell className="w-3 h-3 text-amber-600" />
              Pre-booking Leads
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Review customer waitlist requests for sold-out event dates. Perform authoritative stock
            re-checks before notifying clients when inventory is released.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search by equipment, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-lg border border-stone-300 pl-9 pr-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {["all", "waiting", "notified", "expired"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === status
                  ? "bg-stone-900 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Waitlist List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No waitlist requests</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "No waitlist entries match your active search filters."
              : "When customers request items on dates that are booked to capacity, their contact details and demand requirements appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((w) => (
            <div
              key={w.waitlist_id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:border-stone-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Details */}
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded">
                    #WL-{w.waitlist_id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      w.status === "waiting"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : w.status === "notified"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-stone-100 text-stone-600 border border-stone-200"
                    }`}
                  >
                    {w.status === "waiting" ? (
                      <Clock className="w-3 h-3 text-amber-600" />
                    ) : w.status === "notified" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-3 h-3 text-stone-400" />
                    )}
                    {w.status}
                  </span>
                  <span className="text-xs text-stone-400">
                    Requested on {new Date(w.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 text-[11px] block">Customer Contact</span>
                    <span className="font-semibold text-stone-900">{w.customer_name}</span>
                    {w.customer_phone && (
                      <span className="text-stone-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        {w.customer_phone}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-stone-400 text-[11px] block">Item Demanded</span>
                    <span className="font-semibold text-stone-900">{w.item_name}</span>
                    <span className="text-stone-500 text-[11px] block">
                      Required Quantity: {w.requested_quantity || 1} units
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 text-[11px] block">Event Interval</span>
                    <div className="flex items-center gap-1 font-semibold text-stone-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {w.requested_start_date} → {w.requested_end_date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                <Link
                  href={`/items/${w.item_id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
                >
                  View Item
                </Link>

                {w.status === "waiting" ? (
                  <button
                    onClick={() => handleOpenNotifyCheck(w)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    Check Stock & Notify
                  </button>
                ) : w.status === "notified" ? (
                  <span className="text-xs text-emerald-700 font-semibold px-2 py-1">
                    Notification Sent
                  </span>
                ) : (
                  <span className="text-xs text-stone-400 px-2 py-1">Expired</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Authoritative Stock Re-Check Modal */}
      {verifyingEntry && stockCheckResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-stone-900">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base">Authoritative Stock Verification</h3>
            </div>

            <p className="text-xs text-stone-600">
              Before sending an availability alert to{" "}
              <strong className="text-stone-800">{verifyingEntry.customer_name}</strong>, the system
              re-checks live PostgreSQL inventory reservations across the requested calendar dates.
            </p>

            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Requested Dates:</span>
                <span className="font-semibold text-stone-800">
                  {verifyingEntry.requested_start_date} → {verifyingEntry.requested_end_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Requested Units:</span>
                <span className="font-bold text-stone-900">
                  {verifyingEntry.requested_quantity || 1} units
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2">
                <span className="text-stone-500">Current Available Stock:</span>
                <span
                  className={`font-bold ${
                    stockCheckResult.sufficient ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {stockCheckResult.available} units available
                </span>
              </div>
            </div>

            {stockCheckResult.sufficient ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>
                  Sufficient stock is currently available! You can safely notify the customer to complete
                  their reservation.
                </span>
              </div>
            ) : (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>
                  Inventory bottleneck: Only {stockCheckResult.available} units are available, which is
                  less than the requested {verifyingEntry.requested_quantity || 1} units. Do not notify
                  until additional stock is freed.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setVerifyingEntry(null);
                  setStockCheckResult(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleConfirmNotify}
                disabled={!stockCheckResult.sufficient}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 ${
                  stockCheckResult.sufficient
                    ? "bg-stone-900 hover:bg-stone-800 text-white cursor-pointer"
                    : "bg-stone-300 text-stone-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                Dispatch Availability Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
