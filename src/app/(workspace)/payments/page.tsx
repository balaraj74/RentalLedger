"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  Building,
  ArrowUpRight,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import { Payment, VendorPayout } from "@/lib/types";

export default function PaymentsPage() {
  const [currentUser] = useState(() => mockStore.getActiveUser());
  const [activeTab, setActiveTab] = useState<"transactions" | "settlements">("transactions");
  const [txTypeFilter, setTxTypeFilter] = useState<string>("all");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Load Transactions & Payouts
  const [payments, setPayments] = useState<Payment[]>(() => mockStore.getPayments());
  const [payouts, setPayouts] = useState<VendorPayout[]>(() =>
    mockStore.getPayouts(activeVendorId)
  );

  const refreshData = () => {
    setPayments(mockStore.getPayments());
    setPayouts(mockStore.getPayouts(activeVendorId));
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (txTypeFilter !== "all" && p.payment_type !== txTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = p.transaction_ref.toLowerCase().includes(q);
        const matchesBooking = `${p.booking_id}`.includes(q);
        const matchesMethod = p.payment_method.toLowerCase().includes(q);
        if (!matchesRef && !matchesBooking && !matchesMethod) return false;
      }
      return true;
    });
  }, [payments, txTypeFilter, searchQuery]);

  // Filtered Payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter((po) => {
      if (payoutStatusFilter !== "all" && po.status !== payoutStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesItem = po.item_name?.toLowerCase().includes(q) || false;
        const matchesCustomer = po.customer_name?.toLowerCase().includes(q) || false;
        const matchesId = `${po.payout_id}`.includes(q);
        if (!matchesItem && !matchesCustomer && !matchesId) return false;
      }
      return true;
    });
  }, [payouts, payoutStatusFilter, searchQuery]);

  // Aggregate Metrics
  const totalGross = payouts.reduce((sum, po) => sum + po.gross_amount, 0);
  const totalCommission = payouts.reduce((sum, po) => sum + po.commission_amount, 0);
  const totalNet = payouts.reduce((sum, po) => sum + po.net_amount, 0);
  const pendingSettlements = payouts.filter((po) => po.status === "pending");
  const pendingAmount = pendingSettlements.reduce((sum, po) => sum + po.net_amount, 0);

  // Process Payout Action
  const handleProcessPayout = (payoutId: number) => {
    try {
      mockStore.processPayout(payoutId);
      refreshData();
      showToast(`Settlement #PO-${payoutId} marked as PAID. Bank transfer initiated.`);
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
              Payments & Vendor Settlements
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              UPI & Bank Escrow
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Track recorded customer advances, balance collections, deposit returns, platform
            commissions, and automated vendor payouts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-lg border border-stone-200 p-1 bg-stone-100 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "transactions"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment Transactions ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab("settlements")}
            className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "settlements"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Vendor Payouts ({payouts.length})
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Gross Merchandise Value</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            ₹{totalGross.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            Across {payouts.length} rented equipment lines
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Platform Commission (10%)</span>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">
            ₹{totalCommission.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Retained for platform operations
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Net Vendor Earnings</span>
            <Building className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            ₹{totalNet.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            Disbursable to vendor bank accounts
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Pending Settlement Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-amber-800 font-medium mt-0.5 block">
            {pendingSettlements.length} awaiting transfer
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder={
              activeTab === "transactions"
                ? "Search by Tx reference, booking #..."
                : "Search by equipment line, customer..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-lg border border-stone-300 pl-9 pr-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
          />
        </div>

        {activeTab === "transactions" ? (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {["all", "advance", "balance", "full", "refund"].map((type) => (
              <button
                key={type}
                onClick={() => setTxTypeFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  txTypeFilter === type
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {["all", "pending", "paid"].map((status) => (
              <button
                key={status}
                onClick={() => setPayoutStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  payoutStatusFilter === status
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "transactions" ? (
        /* Transactions Table */
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/70 text-stone-600 border-b border-stone-200">
                  <th className="py-3 px-4 font-semibold">Transaction Reference</th>
                  <th className="py-3 px-4 font-semibold">Booking ID</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Payment Method</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPayments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-stone-800">
                      {p.transaction_ref}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/bookings/${p.booking_id}`}
                        className="font-mono text-stone-900 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        #PS-{p.booking_id}
                        <ArrowUpRight className="w-3 h-3 text-stone-400" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-800">
                        {p.payment_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-stone-700">
                      {p.payment_method}
                    </td>
                    <td className="py-3 px-4 text-stone-500">
                      {new Date(p.transaction_date).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {p.payment_type === "refund" ? "-" : "+"}₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          p.status === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : p.status === "refunded"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() =>
                          showToast(`Receipt downloaded for Tx ${p.transaction_ref}`)
                        }
                        className="text-stone-500 hover:text-stone-900 font-semibold cursor-pointer text-xs"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Payouts Table */
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/70 text-stone-600 border-b border-stone-200">
                  <th className="py-3 px-4 font-semibold">Payout ID</th>
                  <th className="py-3 px-4 font-semibold">Equipment / Package Line</th>
                  <th className="py-3 px-4 font-semibold">Customer / Booking</th>
                  <th className="py-3 px-4 font-semibold">Gross Rental</th>
                  <th className="py-3 px-4 font-semibold">Commission (10%)</th>
                  <th className="py-3 px-4 font-semibold">Net Vendor Payout</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredPayouts.map((po) => (
                  <tr key={po.payout_id} className="hover:bg-stone-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-stone-500">
                      #PO-{po.payout_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {po.item_name || `Line #${po.booking_item_id}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-800 block">
                        {po.customer_name || "Customer"}
                      </span>
                      {po.booking_id && (
                        <Link
                          href={`/bookings/${po.booking_id}`}
                          className="text-[11px] text-stone-500 hover:underline"
                        >
                          Booking #PS-{po.booking_id}
                        </Link>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      ₹{po.gross_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-amber-800 font-medium">
                      -₹{po.commission_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700 text-sm">
                      ₹{po.net_amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          po.status === "paid"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {po.status === "paid" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Disbursed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Bank NEFT
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status === "pending" ? (
                        <button
                          onClick={() => handleProcessPayout(po.payout_id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          Process Payout
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">
                          Paid {po.paid_at ? new Date(po.paid_at).toLocaleDateString("en-IN") : ""}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
