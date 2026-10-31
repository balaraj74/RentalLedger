"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";

export default function CustomersPage() {
  const [currentUser] = useState(() => mockStore.getActiveUser());
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeVendorId = useMemo(() => {
    if (currentUser.role === "vendor") {
      const v = mockStore.getVendorForUser(currentUser.user_id);
      return v?.vendor_id;
    }
    return undefined;
  }, [currentUser]);

  const [customers] = useState(() => mockStore.getCustomers(activeVendorId));

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.user?.name.toLowerCase().includes(q) || false;
        const matchesEmail = c.user?.email.toLowerCase().includes(q) || false;
        const matchesPhone = c.user?.phone?.toLowerCase().includes(q) || false;
        const matchesCity = c.addresses[0]?.city.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCity) return false;
      }
      return true;
    });
  }, [customers, searchQuery]);

  // Aggregate Metrics
  const totalClients = customers.length;
  const repeatClients = customers.filter((c) => c.total_bookings > 1).length;
  const totalVolume = customers.reduce((sum, c) => sum + c.total_spend, 0);

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
              Customer Directory
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Privacy Boundary Enforced
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            {currentUser.role === "vendor"
              ? "Showing verified clients who have placed equipment reservations or decoration bookings with your business."
              : "Platform-wide customer registry with booking histories and verified delivery venues."}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Linked Clients</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-2">{totalClients}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            With registered booking requests
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Repeat Customers</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{repeatClients}</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            Multi-event reservation holders
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Cumulative Client Spend</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            ₹{totalVolume.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            Confirmed & completed orders
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder="Search clients by name, phone, email, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-lg border border-stone-300 pl-9 pr-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Customer List Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">No customers found</h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            {searchQuery
              ? "No clients match your search criteria. Try a different name or phone number."
              : "When customers book your inventory, their contact records and event venues will automatically be cataloged here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredCustomers.map((c) => (
            <div
              key={c.customer_id}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:border-stone-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-800 text-sm">
                      {c.user?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2) || "CL"}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm leading-snug">
                        {c.user?.name}
                      </h3>
                      <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-stone-400" />
                        {c.addresses[0]?.city || "Bengaluru"}, India
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                    #CUST-{c.customer_id}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-stone-100 pt-3">
                  <div className="flex items-center gap-2 text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{c.user?.phone || "+91 98450 00000"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-700 truncate" title={c.user?.email}>
                    <Mail className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                    <span className="truncate">{c.user?.email}</span>
                  </div>
                </div>

                {/* Booking & Spend Metrics */}
                <div className="mt-3 grid grid-cols-3 gap-2 bg-stone-50 p-2.5 rounded-lg border border-stone-100 text-center">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      Bookings
                    </span>
                    <span className="text-sm font-bold text-stone-900">{c.total_bookings}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      Total Spend
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      ₹{c.total_spend.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      Latest Event
                    </span>
                    <span className="text-xs font-semibold text-stone-800">
                      {c.last_event_date ? c.last_event_date : "Recent"}
                    </span>
                  </div>
                </div>

                {/* Saved Venues */}
                {c.addresses && c.addresses.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-stone-500 block mb-1">
                      Event Delivery Addresses ({c.addresses.length})
                    </span>
                    <div className="space-y-1">
                      {c.addresses.map((a) => (
                        <div
                          key={a.address_id}
                          className="text-[11px] text-stone-600 bg-stone-50/70 p-2 rounded border border-stone-100 flex items-start gap-1.5"
                        >
                          <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="truncate">
                            {a.address_line}, {a.city} - {a.pincode}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Links */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
                <button
                  onClick={() =>
                    showToast(`Contact info copied for ${c.user?.name} (${c.user?.phone})`)
                  }
                  className="font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Copy Details
                </button>
                <Link
                  href="/bookings"
                  className="inline-flex items-center gap-1 font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
                >
                  View Bookings
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
