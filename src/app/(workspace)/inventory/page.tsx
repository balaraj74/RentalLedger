"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Calendar,
  Edit2,
  Plus,
  RotateCcw,
  Search,
  Warehouse,
  Wrench,
  X,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import type { Item, ItemCondition } from "@/lib/types";

function InventoryContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Item Form State
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number>(1);
  const [condition, setCondition] = useState<ItemCondition>("good");
  const [totalStock, setTotalStock] = useState<number>(50);
  const [pricePerDay, setPricePerDay] = useState<number>(1200);
  const [securityDeposit, setSecurityDeposit] = useState<number>(2000);
  const [minRentalDays, setMinRentalDays] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const categories = useMemo(() => mockStore.getCategories(), []);
  const activeUser = useMemo(() => mockStore.getActiveUser(), []);

  // Vendor items (Vendor 1 Ravi Prakash or platform items)
  const items = useMemo(() => {
    let list = mockStore.getItems({ isActiveOnly: false });
    if (activeUser.role === "vendor") {
      const vendor = mockStore.getVendorForUser(activeUser.user_id);
      if (vendor) {
        list = list.filter((i) => i.vendor_id === vendor.vendor_id);
      }
    }
    if (selectedCategory !== "all") {
      list = list.filter((i) => i.category_id === selectedCategory);
    }
    if (selectedCondition !== "all") {
      list = list.filter((i) => i.condition === selectedCondition);
    }
    if (statusFilter === "active") {
      list = list.filter((i) => i.is_active);
    } else if (statusFilter === "inactive") {
      list = list.filter((i) => !i.is_active);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeUser, selectedCategory, selectedCondition, statusFilter, searchQuery]);

  function showToast(msg: string) {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  }

  function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Item name is required.");
      return;
    }
    if (totalStock <= 0) {
      setFormError("Total stock pool must be a positive integer.");
      return;
    }
    if (pricePerDay < 0) {
      setFormError("Rental price per day cannot be negative.");
      return;
    }

    const vendor = mockStore.getVendorForUser(activeUser.user_id) || { vendor_id: 1 };

    mockStore.addItem({
      vendor_id: vendor.vendor_id,
      category_id: categoryId,
      name: name.trim(),
      description: description.trim() || `${name} rental item for wedding and auspicious events.`,
      condition,
      price_per_day: pricePerDay,
      security_deposit: securityDeposit,
      total_stock: totalStock,
      min_rental_days: minRentalDays,
      is_active: true,
      primary_image: imageUrl.trim() || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    });

    // Reset Form
    setName("");
    setDescription("");
    setImageUrl("");
    setShowAddModal(false);
    showToast(`Added "${name}" to equipment inventory.`);
  }

  function handleUpdateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;

    mockStore.updateItem(editingItem.item_id, {
      name: editingItem.name,
      condition: editingItem.condition,
      price_per_day: editingItem.price_per_day,
      security_deposit: editingItem.security_deposit,
      total_stock: editingItem.total_stock,
      is_active: editingItem.is_active,
      description: editingItem.description,
    });

    showToast(`Updated "${editingItem.name}".`);
    setEditingItem(null);
  }

  function toggleActiveStatus(item: Item) {
    const updated = mockStore.updateItem(item.item_id, {
      is_active: !item.is_active,
    });
    showToast(`"${updated.name}" is now ${updated.is_active ? "active" : "inactive"}.`);
  }

  // Summary Metrics
  const totalStockUnits = useMemo(() => items.reduce((sum, i) => sum + i.total_stock, 0), [items]);
  const lowStockCount = useMemo(() => {
    return items.filter((i) => {
      const avail = mockStore.checkItemAvailability(i.item_id, "2026-11-01", "2026-11-07");
      return avail.available_stock <= 5 && avail.available_stock > 0;
    }).length;
  }, [items]);

  return (
    <main className="page-content">
      {/* Toast */}
      {toastMessage ? <div className="app-toast">{toastMessage}</div> : null}

      {/* Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Vendor Workspace</p>
          <h1 className="page-title">Equipment Inventory</h1>
          <p className="page-subtitle">
            Manage shared equipment stock pools, rental pricing, condition, and maintenance blackout intervals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="button button-primary"
          style={{ height: 38 }}
        >
          <Plus size={15} /> Add Equipment Item
        </button>
      </div>

      {/* Overview Cards */}
      <section className="metrics-grid" aria-label="Inventory Overview">
        <article className="metric-card">
          <div className="metric-top">
            <span>Catalog Items</span>
            <span className="metric-icon"><Boxes size={15} /></span>
          </div>
          <div className="metric-value">{items.length}</div>
          <div className="metric-foot">
            <span className="delta-up">Active listings</span>
            <span>in vendor catalog</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Total Stock Units</span>
            <span className="metric-icon"><Warehouse size={15} /></span>
          </div>
          <div className="metric-value">{totalStockUnits}</div>
          <div className="metric-foot">
            <span className="delta-up">Interchangeable units</span>
            <span>across pools</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Low Stock Items</span>
            <span className="metric-icon"><AlertTriangle size={15} color="#b8754b" /></span>
          </div>
          <div className="metric-value">{lowStockCount}</div>
          <div className="metric-foot">
            <span className="delta-flat">High demand</span>
            <span>for upcoming week</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Blackout Maintenance</span>
            <span className="metric-icon"><Wrench size={15} /></span>
          </div>
          <div className="metric-value">2</div>
          <div className="metric-foot">
            <span className="delta-flat">Scheduled holds</span>
            <span>for testing & polish</span>
          </div>
        </article>
      </section>

      {/* Filter Toolbar */}
      <section className="toolbar">
        <div className="filter-group">
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "#8a949a" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items by name…"
              className="form-input"
              style={{ paddingLeft: 32, width: 220, height: 36, fontSize: 12 }}
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="form-select"
            style={{ width: "auto", height: 36, fontSize: 12 }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value as ItemCondition | "all")}
            className="form-select"
            style={{ width: "auto", height: 36, fontSize: 12 }}
          >
            <option value="all">All Conditions</option>
            <option value="new">New</option>
            <option value="good">Good</option>
            <option value="worn">Worn</option>
            <option value="damaged">Damaged</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="form-select"
            style={{ width: "auto", height: 36, fontSize: 12 }}
          >
            <option value="all">All Listing Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("all");
            setSelectedCondition("all");
            setStatusFilter("all");
          }}
          className="button button-secondary"
          style={{ height: 36, fontSize: 11 }}
        >
          <RotateCcw size={13} /> Reset Filters
        </button>
      </section>

      {/* Inventory Table */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Equipment Stock Pool Records ({items.length})</h2>
            <div className="panel-description">
              Direct rentals and package components allocate against these identical physical pools.
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item name & identifier</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Total stock pool</th>
                <th>Rental price / day</th>
                <th>Security deposit</th>
                <th>Listing status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--ps-muted)" }}>
                    No inventory items match your active filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.item_id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            background: "#edeae4",
                            overflow: "hidden",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          {item.primary_image ? (
                            <img
                              src={item.primary_image}
                              alt={item.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <Boxes size={18} color="#8a949a" />
                          )}
                        </div>
                        <div>
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: 10, color: "var(--ps-muted)", marginTop: 2 }}>
                            IT-{String(item.item_id).padStart(3, "0")} · {item.vendor_city}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{item.category_name}</td>

                    <td>
                      <span className={`badge ${item.condition === "new" ? "badge-sage" : item.condition === "good" ? "badge-blue" : "badge-amber"}`}>
                        {item.condition}
                      </span>
                    </td>

                    <td>
                      <strong>{item.total_stock} units</strong>
                    </td>

                    <td>
                      <strong>₹{item.price_per_day.toLocaleString("en-IN")}</strong>
                    </td>

                    <td>₹{item.security_deposit.toLocaleString("en-IN")}</td>

                    <td>
                      <span className={`status ${item.is_active ? "status-confirmed" : "status-cancelled"}`}>
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Link
                          href={`/inventory/${item.item_id}`}
                          className="button button-secondary"
                          style={{ height: 30, padding: "0 9px", fontSize: 11 }}
                          title="View timeline & schedule maintenance blackout dates"
                        >
                          <Calendar size={13} /> Blackouts
                        </Link>

                        <button
                          onClick={() => setEditingItem(item)}
                          className="icon-button"
                          style={{ width: 30, height: 30 }}
                          title="Edit pricing or stock"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          onClick={() => toggleActiveStatus(item)}
                          className="button button-secondary"
                          style={{ height: 30, padding: "0 8px", fontSize: 11 }}
                        >
                          {item.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Item Modal */}
      {showAddModal ? (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Equipment to Stock Pool</h3>
              <button className="icon-button" aria-label="Close dialog" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateItem}>
              <div className="modal-body">
                {formError ? (
                  <div style={{ padding: "10px 12px", background: "#fdf2f2", border: "1px solid #f5cfcf", borderRadius: 8, color: "#9c3b3b", fontSize: 12 }}>
                    {formError}
                  </div>
                ) : null}

                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Crystal Chandelier (3ft)"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="form-select"
                    >
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Condition *</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ItemCondition)}
                      className="form-select"
                    >
                      <option value="new">New / Mint</option>
                      <option value="good">Good / Excellent</option>
                      <option value="worn">Worn / Functional</option>
                      <option value="damaged">Needs Repair</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Stock Pool (Units) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={totalStock}
                      onChange={(e) => setTotalStock(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rental Price per Day (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Security Deposit (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Min Rental Days</label>
                    <input
                      type="number"
                      min={1}
                      value={minRentalDays}
                      onChange={(e) => setMinRentalDays(Math.max(1, Number(e.target.value)))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/…"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Dimensions, materials, weight, and setup instructions…"
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Save to Inventory Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Edit Item Modal */}
      {editingItem ? (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Equipment: {editingItem.name}</h3>
              <button className="icon-button" aria-label="Close dialog" onClick={() => setEditingItem(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateItem}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Total Stock Pool</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingItem.total_stock}
                      onChange={(e) => setEditingItem({ ...editingItem, total_stock: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price per Day (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingItem.price_per_day}
                      onChange={(e) => setEditingItem({ ...editingItem, price_per_day: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Security Deposit (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={editingItem.security_deposit}
                      onChange={(e) => setEditingItem({ ...editingItem, security_deposit: Number(e.target.value) })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Condition</label>
                  <select
                    value={editingItem.condition}
                    onChange={(e) => setEditingItem({ ...editingItem, condition: e.target.value as ItemCondition })}
                    className="form-select"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="worn">Worn</option>
                    <option value="damaged">Damaged</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="form-textarea"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setEditingItem(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="page-content">Loading inventory records…</div>}>
      <InventoryContent />
    </Suspense>
  );
}
