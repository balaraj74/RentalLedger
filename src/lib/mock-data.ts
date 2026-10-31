import type { BookingPreview, InventoryPreview, SummaryMetric } from "@/lib/types";

export const summaryMetrics: SummaryMetric[] = [
  { label: "Bookings this month", value: "128", delta: "+12.8%", direction: "up", helper: "vs. last month" },
  { label: "Rental revenue", value: "₹4.82L", delta: "+8.4%", direction: "up", helper: "recorded demo value" },
  { label: "Inventory utilisation", value: "72%", delta: "+4.2%", direction: "up", helper: "across sample stock" },
  { label: "Pending requests", value: "14", delta: "3 urgent", direction: "flat", helper: "need vendor review" },
];

export const recentBookings: BookingPreview[] = [
  { id: "PS-26089", customer: "Aarav Sharma", event: "Wedding reception", date: "02 Nov 2026", items: "Mandap + lighting package", amount: 48500, status: "Confirmed", initials: "AS" },
  { id: "PS-26088", customer: "Meera Nair", event: "Engagement", date: "04 Nov 2026", items: "Stage décor + 120 chairs", amount: 32750, status: "Pending", initials: "MN" },
  { id: "PS-26087", customer: "Rohan Kulkarni", event: "Wedding", date: "06 Nov 2026", items: "Traditional mandap package", amount: 61200, status: "Partially confirmed", initials: "RK" },
  { id: "PS-26086", customer: "Ananya Rao", event: "Reception", date: "08 Nov 2026", items: "Lighting + seating", amount: 21900, status: "Confirmed", initials: "AR" },
  { id: "PS-26085", customer: "Kiran Shetty", event: "Naming ceremony", date: "10 Nov 2026", items: "Canopy + floral décor", amount: 15800, status: "Completed", initials: "KS" },
];

export const inventoryPreview: InventoryPreview[] = [
  { id: "IT-001", name: "Banquet chair — ivory", category: "Seating", stock: 240, reserved: 168, unit: "units", status: "Available" },
  { id: "IT-014", name: "Warm LED string light", category: "Lighting", stock: 80, reserved: 72, unit: "sets", status: "Low stock" },
  { id: "IT-023", name: "Traditional mandap frame", category: "Mandap", stock: 6, reserved: 5, unit: "sets", status: "Low stock" },
  { id: "IT-031", name: "Round banquet table", category: "Furniture", stock: 48, reserved: 19, unit: "units", status: "Available" },
];

export const weeklyBookings = [
  { day: "Mon", value: 42 }, { day: "Tue", value: 56 }, { day: "Wed", value: 36 },
  { day: "Thu", value: 73 }, { day: "Fri", value: 61 }, { day: "Sat", value: 92 }, { day: "Sun", value: 68 },
];

export const activity = [
  { title: "Booking confirmed", detail: "PS-26089 · Aarav Sharma", time: "12 min ago", tone: "sage" },
  { title: "Inventory running low", detail: "Warm LED string lights · 8 sets free", time: "37 min ago", tone: "amber" },
  { title: "New package request", detail: "PS-26088 · Meera Nair", time: "1 hr ago", tone: "blue" },
];
