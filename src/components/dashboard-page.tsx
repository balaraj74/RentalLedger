"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CalendarPlus, CircleAlert,
  ClipboardList, IndianRupee, MoreHorizontal, PackageCheck, Plus, Warehouse,
} from "lucide-react";
import { activity, inventoryPreview, recentBookings, summaryMetrics, weeklyBookings } from "@/lib/mock-data";
import type { BookingPreview } from "@/lib/types";

const statusClass: Record<BookingPreview["status"], string> = {
  Confirmed: "status status-confirmed",
  Completed: "status status-completed",
  Pending: "status status-pending",
  "Partially confirmed": "status status-partial",
  Cancelled: "status status-cancelled",
};

const metricIcons = [CalendarPlus, IndianRupee, Warehouse, ClipboardList];

export function DashboardPage() {
  const [bookingFilter, setBookingFilter] = useState("All bookings");
  const [toast, setToast] = useState("");
  const filteredBookings = useMemo(() => bookingFilter === "All bookings" ? recentBookings : recentBookings.filter((booking) => booking.status === bookingFilter), [bookingFilter]);

  function showDemoNotice(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Wednesday, 28 October 2026</p>
          <h1 className="page-title">Good afternoon, Ravi <span aria-hidden="true">✦</span></h1>
          <p className="page-subtitle">Here’s what’s happening across your rental business today.</p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Link className="button button-secondary" href="/inventory"><Plus size={15}/> Add inventory</Link>
          <Link className="button button-primary" href="/bookings"><CalendarPlus size={15}/> New booking</Link>
        </div>
      </div>

      <section className="metrics-grid" aria-label="Business summary">
        {summaryMetrics.map((metric, index) => {
          const Icon = metricIcons[index];
          return <article className="metric-card" key={metric.label}>
            <div className="metric-top"><span>{metric.label}</span><span className="metric-icon"><Icon size={15}/></span></div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-foot"><span className={metric.direction === "flat" ? "delta-flat" : "delta-up"}>{metric.direction === "down" ? <ArrowDownRight size={12} style={{ display: "inline" }}/> : <ArrowUpRight size={12} style={{ display: "inline" }}/>} {metric.delta}</span><span>{metric.helper}</span></div>
          </article>;
        })}
      </section>

      <div className="content-grid">
        <div>
          <section className="panel">
            <div className="panel-header">
              <div><h2 className="panel-title">Booking overview</h2><div className="panel-description">Requests and confirmed rentals across the current week</div></div>
              <Link href="/bookings" className="text-link">View bookings <ArrowRight size={12} style={{ display: "inline", verticalAlign: "-2px" }}/></Link>
            </div>
            <div className="chart-area">
              <div className="chart-topline"><div><div className="chart-total">428 <span style={{ fontSize: 11, color: "#64717b", fontWeight: 500 }}>bookings</span></div><div className="chart-note">Illustrative sample data · last 7 days</div></div><button className="icon-button" aria-label="More chart options" onClick={() => showDemoNotice("Chart options are part of the next dashboard milestone.")}><MoreHorizontal size={17}/></button></div>
              <div className="bar-chart" role="img" aria-label="Sample weekly bookings: Monday 42, Tuesday 56, Wednesday 36, Thursday 73, Friday 61, Saturday 92, Sunday 68.">
                {weeklyBookings.map((day) => <div className="bar-column" key={day.day}><div className={`bar${day.day === "Sat" ? " active" : ""}`} style={{ height: `${day.value}%` }} title={`${day.day}: ${day.value}`}/></div>)}
              </div>
              <div className="bar-labels" aria-hidden="true">{weeklyBookings.map((day) => <span key={day.day}>{day.day}</span>)}</div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div><h2 className="panel-title">Recent bookings</h2><div className="panel-description">Track what is requested, confirmed and completed</div></div>
              <select aria-label="Filter bookings by status" value={bookingFilter} onChange={(e) => setBookingFilter(e.target.value)} style={{ border: "1px solid var(--ps-border)", borderRadius: 7, padding: "7px 9px", color: "#5e6b74", background: "white", fontSize: 10 }}>
                <option>All bookings</option><option>Pending</option><option>Confirmed</option><option>Partially confirmed</option><option>Completed</option><option>Cancelled</option>
              </select>
            </div>
            <div className="table-wrap"><table><thead><tr><th>Booking / customer</th><th>Event date</th><th>Rental</th><th>Amount</th><th>Status</th></tr></thead><tbody>
              {filteredBookings.map((booking) => <tr key={booking.id}><td><div className="table-person"><div className="avatar-sm">{booking.initials}</div><div><strong>{booking.id}</strong><div style={{ color: "#849097", marginTop: 2 }}>{booking.customer}</div></div></div></td><td>{booking.date}</td><td>{booking.items}</td><td><strong>₹{booking.amount.toLocaleString("en-IN")}</strong></td><td><span className={statusClass[booking.status]}>{booking.status}</span></td></tr>)}
              {filteredBookings.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#75828a" }}>No sample bookings match this status.</td></tr> : null}
            </tbody></table></div>
            <div style={{ padding: "12px 18px", background: "#fdfdfa", borderTop: "1px solid #f0f0eb" }}><Link href="/bookings" className="text-link">Open booking workspace ↗</Link></div>
          </section>
        </div>

        <div className="side-column">
          <section className="panel">
            <div className="panel-header"><div><h2 className="panel-title">Inventory watch</h2><div className="panel-description">Items with capacity to monitor</div></div><Link href="/inventory" className="text-link">All items</Link></div>
            <div className="inventory-list">
              {inventoryPreview.map((item) => <div className="inventory-row" key={item.id}><div className="item-thumb"><PackageCheck size={17}/></div><div className="inventory-main"><div className="inventory-name">{item.name}</div><div className="inventory-meta">{item.category} · {item.id}</div><div style={{ height: 4, marginTop: 7, borderRadius: 99, background: "#eff0eb", overflow: "hidden" }}><div style={{ width: `${Math.min(100, item.reserved / item.stock * 100)}%`, height: 4, background: item.status === "Low stock" ? "#b8754b" : "#547a63", borderRadius: 99 }}/></div></div><div className="stock-numbers"><strong>{item.stock - item.reserved} free</strong>{item.reserved}/{item.stock}</div></div>)}
            </div>
            <div style={{ padding: "12px 18px", borderTop: "1px solid #f0f0eb" }}><Link href="/inventory" className="text-link">Review stock levels <ArrowRight size={12} style={{ display: "inline", verticalAlign: "-2px" }}/></Link></div>
          </section>

          <section className="panel">
            <div className="panel-header"><div><h2 className="panel-title">Recent activity</h2><div className="panel-description">Latest operational updates</div></div><button className="icon-button" aria-label="More activity options" onClick={() => showDemoNotice("Activity options are not wired to a live service in demo mode.")}><MoreHorizontal size={16}/></button></div>
            <div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.title}><span className={`activity-dot ${item.tone}`} aria-hidden="true"/><div className="activity-text">{item.title}<span className="activity-detail">{item.detail}</span></div><span className="activity-time">{item.time}</span></div>)}</div>
          </section>

          <section className="panel" style={{ background: "#f9f7f1" }}>
            <div style={{ padding: 18 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "#8c633a" }}><CircleAlert size={17}/><span style={{ fontSize: 12, fontWeight: 750 }}>Availability matters</span></div><p style={{ margin: "0 0 13px", color: "#69747b", fontSize: 11, lineHeight: 1.65 }}>Packages and single-item rentals share the same stock pool. Verify component availability before confirming overlapping dates.</p><Link href="/catalog" className="text-link">Explore package discovery ↗</Link></div>
          </section>
        </div>
      </div>

      <footer className="page-footer"><span>© 2026 Rental Ledger · Rental resource management</span><span>Sample data for development · Booking availability is not live</span></footer>
      {toast ? <div role="status" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50, borderRadius: 10, background: "#20364d", color: "white", padding: "12px 16px", fontSize: 12, boxShadow: "0 10px 30px #18243220" }}>{toast}</div> : null}
    </main>
  );
}
