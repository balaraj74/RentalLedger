"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import {
  Activity,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Package,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import type { Notification, User, UserRole } from "@/lib/types";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  count?: string;
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeUser, setActiveUser] = useState<User>(() => mockStore.getActiveUser());
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    mockStore.getNotifications(mockStore.getActiveUser().user_id)
  );


  function switchRole(userId: number) {
    const newUser = mockStore.setActiveUser(userId);
    setActiveUser(newUser);
    setNotifications(mockStore.getNotifications(newUser.user_id));
    setShowRoleModal(false);

    // Redirect to home or role landing
    if (newUser.role === "customer" && (pathname === "/dashboard" || pathname === "/inventory" || pathname === "/packages")) {
      router.push("/catalog");
    } else if (newUser.role === "admin" && (pathname.startsWith("/customer/") || pathname === "/inventory")) {
      router.push("/admin/vendors");
    } else if (newUser.role === "vendor" && pathname.startsWith("/customer/")) {
      router.push("/dashboard");
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = query.trim();
    if (clean) {
      router.push(`/catalog?query=${encodeURIComponent(clean)}`);
    } else {
      router.push("/catalog");
    }
  }

  function markAllRead() {
    for (const n of notifications) {
      mockStore.markNotificationRead(n.notification_id);
    }
    setNotifications(mockStore.getNotifications(activeUser.user_id));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Build role-tailored navigation items
  let mainNav: NavigationItem[] = [];
  let businessNav: NavigationItem[] = [];

  if (activeUser.role === "customer") {
    mainNav = [
      { label: "Browse & search", href: "/catalog", icon: Sparkles },
      { label: "My bookings", href: "/customer/bookings", icon: CalendarDays },
      { label: "My payments", href: "/customer/payments", icon: CreditCard },
      { label: "Profile & addresses", href: "/customer/profile", icon: Users },
    ];
    businessNav = [
      { label: "Vendor directory", href: "/catalog?view=vendors", icon: Warehouse },
      { label: "Item waitlist", href: "/waitlist", icon: Boxes },
    ];
  } else if (activeUser.role === "admin") {
    mainNav = [
      { label: "Platform overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Catalog inspection", href: "/catalog", icon: Sparkles },
      { label: "Vendor management", href: "/admin/vendors", icon: ShieldCheck },
      { label: "User accounts", href: "/admin/users", icon: UserCheck },
    ];
    businessNav = [
      { label: "Dispute resolution", href: "/admin/disputes", icon: MessageSquareText },
      { label: "Cancellation policies", href: "/admin/policies", icon: FileCheck2 },
      { label: "Promotional coupons", href: "/admin/coupons", icon: Ticket },
      { label: "System reports", href: "/admin/reports", icon: Activity },
    ];
  } else {
    // Vendor Role
    mainNav = [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Package discovery", href: "/catalog", icon: Sparkles },
      { label: "Inventory", href: "/inventory", icon: Warehouse },
      { label: "Packages", href: "/packages", icon: Package },
      { label: "Bookings", href: "/bookings", icon: CalendarDays, count: "14" },
    ];
    businessNav = [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Payments & payouts", href: "/payments", icon: CreditCard },
      { label: "Waitlist", href: "/waitlist", icon: Boxes },
      { label: "Reviews & disputes", href: "/reviews", icon: MessageSquareText },
      { label: "Reports", href: "/reports", icon: Activity },
    ];
  }

  function renderNavLinks(items: NavigationItem[]) {
    return items.map(({ label, href, icon: Icon, count }) => {
      const active =
        pathname === href || (href !== "/dashboard" && href !== "/catalog" && pathname.startsWith(`${href}`));
      return (
        <Link
          key={href}
          href={href}
          className={`nav-link${active ? " active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>{label}</span>
          {count ? <span className="nav-count">{count}</span> : null}
        </Link>
      );
    });
  }

  const roleLabels: Record<UserRole, { title: string; subtitle: string; badge: string }> = {
    vendor: {
      title: "Ravi Prakash",
      subtitle: "Prakash Mandap Decors",
      badge: "Vendor Account",
    },
    customer: {
      title: "Aarav Sharma",
      subtitle: "Wedding Organizer (Customer)",
      badge: "Customer Account",
    },
    admin: {
      title: "Pooja Hegde",
      subtitle: "Operations Lead (Admin)",
      badge: "Admin Account",
    },
  };

  const currentRoleInfo = roleLabels[activeUser.role];

  return (
    <div className="app-shell">
      {menuOpen ? (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside className={`sidebar${menuOpen ? " open" : ""}`} aria-label="Main navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">RL</div>
          <div>
            <div className="brand-name">Rental Ledger</div>
            <div className="brand-sub">Function & Wedding Inventory</div>
          </div>
          <button
            className="icon-button sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="nav-section">
          {activeUser.role === "customer" ? "Customer Workspace" : activeUser.role === "admin" ? "Administration" : "Workspace"}
        </div>
        <nav>{renderNavLinks(mainNav)}</nav>

        <div className="nav-section">Operations</div>
        <nav>{renderNavLinks(businessNav)}</nav>

        <div className="nav-section">Preferences</div>
        <nav>{renderNavLinks([{ label: "Settings & Profile", href: "/settings", icon: Settings }])}</nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-title">Active Role: {activeUser.role.toUpperCase()}</div>
            <div className="help-copy">
              Shared stock availability prevents inventory conflicts across individual rentals and packages.
            </div>
            <button
              onClick={() => setShowRoleModal(true)}
              className="text-link"
              style={{ display: "inline-block", marginTop: 8, background: "none", border: "none", padding: 0, cursor: "pointer" }}
            >
              Switch demo role ↗
            </button>
          </div>

          <div
            className="user-chip"
            style={{ cursor: "pointer" }}
            onClick={() => setShowRoleModal(true)}
            role="button"
            tabIndex={0}
            aria-label="Switch active demo user role"
          >
            <div className="avatar">
              {activeUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="user-name">{currentRoleInfo.title}</div>
              <div className="user-role">{currentRoleInfo.subtitle}</div>
            </div>
            <ChevronDown size={15} color="#75828a" aria-hidden="true" />
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="workspace">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={18} />
            </button>
            <form className="search-box" onSubmit={handleSearch} role="search">
              <Search size={15} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search items, packages and themes"
                placeholder="Search items, packages, themes…"
              />
              <span style={{ color: "#a0a8ac", fontSize: 10, whiteSpace: "nowrap" }}>↵</span>
            </form>
          </div>

          <div className="topbar-actions" style={{ position: "relative" }}>
            {/* Role Switcher Pill */}
            <button
              onClick={() => setShowRoleModal(true)}
              className={`role-pill role-${activeUser.role}`}
              title="Click to toggle between Customer, Vendor, and Administrator perspectives"
            >
              <span aria-hidden="true">●</span>
              <span>{currentRoleInfo.badge}</span>
              <ChevronDown size={12} />
            </button>

            <span className="demo-pill">
              <span aria-hidden="true">●</span> DEMO DATA
            </span>

            <button
              className="icon-button"
              aria-label="Settings and help centre"
              onClick={() => router.push("/settings")}
            >
              <CircleHelp size={16} />
            </button>

            {/* Notification Bell Button */}
            <div style={{ position: "relative" }}>
              <button
                className="icon-button"
                aria-label={`Notifications (${unreadCount} unread)`}
                onClick={() => setShowNotifMenu(!showNotifMenu)}
              >
                <Bell size={16} />
                {unreadCount > 0 ? (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#b8754b",
                    }}
                    aria-hidden="true"
                  />
                ) : null}
              </button>

              {/* Notification Popover Menu */}
              {showNotifMenu ? (
                <div className="popover-menu">
                  <div className="popover-header">
                    <div className="popover-title">Notifications ({notifications.length})</div>
                    {unreadCount > 0 ? (
                      <button
                        onClick={markAllRead}
                        style={{ border: "none", background: "none", color: "#3c5a76", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>
                  <div className="popover-body">
                    {notifications.length === 0 ? (
                      <div style={{ padding: 20, textAlign: "center", color: "#8a949a" }}>No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.notification_id}
                          className={`popover-item${!n.is_read ? " unread" : ""}`}
                          onClick={() => {
                            mockStore.markNotificationRead(n.notification_id);
                            setShowNotifMenu(false);
                            if (n.link) router.push(n.link);
                          }}
                        >
                          <div style={{ fontWeight: 650, color: "#20364d" }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: "#8a949a" }}>
                            {new Date(n.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="popover-footer">
                    <button
                      onClick={() => {
                        setShowNotifMenu(false);
                        router.push(activeUser.role === "customer" ? "/customer/bookings" : "/bookings");
                      }}
                      className="text-link"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                      View all activities ↗
                    </button>
                  </div>
                </div>
              ) : null}
            </div>


            {/* User Avatar */}
            <div
              className="avatar"
              style={{ cursor: "pointer" }}
              onClick={() => setShowRoleModal(true)}
              aria-label={`Current user: ${activeUser.name}`}
            >
              {activeUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          </div>
        </header>

        {children}
      </div>

      {/* Interactive Role Switcher Modal */}
      {showRoleModal ? (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Switch Active Demo Role</h2>
                <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                  Experience the system from any participant perspective
                </div>
              </div>
              <button
                className="icon-button"
                aria-label="Close dialog"
                onClick={() => setShowRoleModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: 0, color: "var(--ps-muted)", fontSize: 12 }}>
                Rental Ledger enforces strict server-side role boundaries. Select a persona below to inspect their tailored navigation, data scoping, and permissions:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Vendor Option */}
                <div
                  onClick={() => switchRole(2)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    border: `1.5px solid ${activeUser.user_id === 2 ? "var(--ps-navy)" : "var(--ps-border)"}`,
                    background: activeUser.user_id === 2 ? "#edf1f4" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <div className="avatar" style={{ background: "#d5e4ed", color: "#1e374d" }}>RP</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>Ravi Prakash</strong>
                      <span className="badge badge-blue">Vendor</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                      Prakash Mandap & Event Decors · Full inventory, package builder, bookings, and payouts
                    </div>
                  </div>
                  {activeUser.user_id === 2 ? <Check size={18} color="var(--ps-navy)" /> : null}
                </div>

                {/* Customer Option */}
                <div
                  onClick={() => switchRole(1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    border: `1.5px solid ${activeUser.user_id === 1 ? "var(--ps-navy)" : "var(--ps-border)"}`,
                    background: activeUser.user_id === 1 ? "#edf4ee" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <div className="avatar" style={{ background: "#dbe8dd", color: "#2d5239" }}>AS</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>Aarav Sharma</strong>
                      <span className="badge badge-sage">Customer</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                      Event Organizer · Browse packages, date-range availability checks, own bookings and payments
                    </div>
                  </div>
                  {activeUser.user_id === 1 ? <Check size={18} color="#2d5239" /> : null}
                </div>

                {/* Administrator Option */}
                <div
                  onClick={() => switchRole(4)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    border: `1.5px solid ${activeUser.user_id === 4 ? "var(--ps-navy)" : "var(--ps-border)"}`,
                    background: activeUser.user_id === 4 ? "#fbf2e1" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <div className="avatar" style={{ background: "#f2e4c8", color: "#74511d" }}>PH</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 13 }}>Pooja Hegde</strong>
                      <span className="badge badge-amber">Administrator</span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ps-muted)", marginTop: 2 }}>
                      Platform Operations · Vendor KYC verification, dispute resolution, policies, and coupons
                    </div>
                  </div>
                  {activeUser.user_id === 4 ? <Check size={18} color="#74511d" /> : null}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="button button-secondary"
                onClick={() => {
                  mockStore.resetToDefault();
                  window.location.reload();
                }}
              >
                Reset demo state to baseline
              </button>
              <button
                className="button button-primary"
                onClick={() => setShowRoleModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
