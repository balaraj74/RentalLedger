"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Plus,
  Sparkles,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  X,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import { Package, Item } from "@/lib/types";

export default function PackagesPage() {
  const [currentUser] = useState(() => mockStore.getActiveUser());
  const activeVendorId = useMemo(() => {
    if (currentUser.role === "vendor") {
      const v = mockStore.getVendorForUser(currentUser.user_id);
      return v?.vendor_id || 1;
    }
    return 1;
  }, [currentUser]);

  const [packages, setPackages] = useState<Package[]>(() =>
    mockStore.getPackages({ vendorId: activeVendorId, isActiveOnly: false })
  );
  const [vendorItems, setVendorItems] = useState<Item[]>(() =>
    mockStore.getItems({ vendorId: activeVendorId, isActiveOnly: false })
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<number | null>(null);

  // Form State
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [themeTags, setThemeTags] = useState("");
  const [comboPrice, setComboPrice] = useState<number>(35000);
  const [selectedComponents, setSelectedComponents] = useState<
    Array<{ itemId: number; quantity: number }>
  >([]);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshData = () => {
    const pkgs = mockStore.getPackages({ vendorId: activeVendorId, isActiveOnly: false });
    const items = mockStore.getItems({ vendorId: activeVendorId, isActiveOnly: false });
    setPackages(pkgs);
    setVendorItems(items);
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (statusFilter === "active" && !pkg.is_active) return false;
      if (statusFilter === "inactive" && pkg.is_active) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesName = pkg.name.toLowerCase().includes(q);
        const matchesTags = pkg.theme_tags.toLowerCase().includes(q);
        const matchesDesc = pkg.description.toLowerCase().includes(q);
        if (!matchesName && !matchesTags && !matchesDesc) return false;
      }
      return true;
    });
  }, [packages, searchFilter, statusFilter]);

  // Handle Toggle Active
  const handleToggleStatus = (packageId: number) => {
    try {
      mockStore.togglePackageStatus(packageId);
      refreshData();
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update package status");
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPackageId(null);
    setPackageName("");
    setDescription("");
    setThemeTags("Wedding, Sangeet, Traditional");
    setComboPrice(25000);
    // Preset with first vendor item if available
    if (vendorItems.length > 0) {
      setSelectedComponents([{ itemId: vendorItems[0].item_id, quantity: 1 }]);
    } else {
      setSelectedComponents([]);
    }
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (pkg: Package) => {
    setEditingPackageId(pkg.package_id);
    setPackageName(pkg.name);
    setDescription(pkg.description);
    setThemeTags(pkg.theme_tags);
    setComboPrice(pkg.combo_price);
    const comps = (pkg.components || []).map((c) => ({
      itemId: c.item_id,
      quantity: c.quantity,
    }));
    setSelectedComponents(comps);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Component manipulation
  const handleAddComponent = () => {
    const unselectedItem = vendorItems.find(
      (item) => !selectedComponents.some((c) => c.itemId === item.item_id)
    );
    if (unselectedItem) {
      setSelectedComponents((prev) => [
        ...prev,
        { itemId: unselectedItem.item_id, quantity: 1 },
      ]);
    } else if (vendorItems.length > 0) {
      setSelectedComponents((prev) => [
        ...prev,
        { itemId: vendorItems[0].item_id, quantity: 1 },
      ]);
    }
  };

  const handleRemoveComponent = (index: number) => {
    setSelectedComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateComponentItem = (index: number, itemId: number) => {
    setSelectedComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, itemId } : c))
    );
  };

  const handleUpdateComponentQty = (index: number, quantity: number) => {
    const qty = Math.max(1, isNaN(quantity) ? 1 : quantity);
    setSelectedComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, quantity: qty } : c))
    );
  };

  // Real-time capacity & savings calculation for Form
  const { standaloneSum, maxCapacity, bottleneckItem } = useMemo(() => {
    let sum = 0;
    let minCap = Infinity;
    let bItemName = "";

    for (const comp of selectedComponents) {
      const it = vendorItems.find((i) => i.item_id === comp.itemId);
      if (it) {
        sum += it.price_per_day * comp.quantity;
        const capacity = Math.floor(it.total_stock / comp.quantity);
        if (capacity < minCap) {
          minCap = capacity;
          bItemName = it.name;
        }
      }
    }

    return {
      standaloneSum: sum,
      maxCapacity: minCap === Infinity ? 0 : minCap,
      bottleneckItem: bItemName,
    };
  }, [selectedComponents, vendorItems]);

  const savingsAmount = Math.max(0, standaloneSum - comboPrice);
  const savingsPercent =
    standaloneSum > 0 ? Math.round((savingsAmount / standaloneSum) * 100) : 0;

  // Handle Form Submit
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!packageName.trim()) {
      setFormError("Please enter a package title.");
      return;
    }
    if (!description.trim()) {
      setFormError("Please enter a package description.");
      return;
    }
    if (selectedComponents.length === 0) {
      setFormError("A package must include at least one inventory item.");
      return;
    }
    if (comboPrice <= 0) {
      setFormError("Combo price must be greater than zero.");
      return;
    }

    try {
      if (editingPackageId) {
        mockStore.updatePackage(editingPackageId, {
          name: packageName,
          description,
          themeTags,
          comboPrice,
          components: selectedComponents,
        });
      } else {
        mockStore.createPackage({
          vendorId: activeVendorId,
          name: packageName,
          description,
          themeTags,
          comboPrice,
          components: selectedComponents,
        });
      }
      setIsModalOpen(false);
      refreshData();
    } catch (err: unknown) {
      setFormError((err as Error).message || "Failed to save package");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Decoration Packages
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
              <Sparkles className="w-3 h-3" />
              Shared Stock Pools
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Bundle individual equipment into curated, high-margin decoration themes.
            Component stock is shared in real time with individual rentals.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Package
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search packages by title or theme tags..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Status:
          </span>
          <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100 text-xs font-medium">
            {(["all", "active", "inactive"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-3 py-1.5 rounded-md capitalize transition cursor-pointer ${
                  statusFilter === mode
                    ? "bg-white text-stone-900 font-semibold shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Package List Grid */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Boxes className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-stone-800">
            No decoration packages found
          </h3>
          <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
            {searchFilter
              ? "No packages match your search filter. Try clearing the filter or adjusting terms."
              : "Create your first decoration package to offer bundled wedding setups with automated shared inventory allocation."}
          </p>
          {!searchFilter && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-stone-800 transition"
            >
              <Plus className="w-4 h-4" />
              Create Decoration Package
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPackages.map((pkg) => {
            // Calculate standalone component price sum
            const standaloneTotal = (pkg.components || []).reduce((acc, comp) => {
              const it = comp.item;
              return acc + (it ? it.price_per_day * comp.quantity : 0);
            }, 0);

            // Calculate bottleneck capacity
            const minPkgCap = (pkg.components || []).reduce((min, comp) => {
              const it = comp.item;
              if (!it) return min;
              const cap = Math.floor(it.total_stock / comp.quantity);
              return cap < min ? cap : min;
            }, Infinity);

            const displayCapacity = minPkgCap === Infinity ? 0 : minPkgCap;
            const savings = Math.max(0, standaloneTotal - pkg.combo_price);

            return (
              <div
                key={pkg.package_id}
                className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:border-stone-300 transition-all"
              >
                {/* Package Card Top Banner */}
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={pkg.primary_image}
                    alt={pkg.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${
                        pkg.is_active
                          ? "bg-emerald-500/90 text-white"
                          : "bg-stone-800/90 text-stone-200"
                      }`}
                    >
                      {pkg.is_active ? "Active in Catalog" : "Draft / Inactive"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-stone-100">
                      <Layers className="w-3 h-3 text-amber-400" />
                      {pkg.components?.length || 0} Components
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-lg leading-snug drop-shadow-xs">
                      {pkg.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {pkg.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {pkg.theme_tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            <Tag className="w-2.5 h-2.5 text-stone-400" />
                            {tag}
                          </span>
                        ))}
                    </div>

                    {/* Components Preview Table */}
                    <div className="mt-4 border border-stone-200 rounded-lg overflow-hidden">
                      <div className="bg-stone-50 px-3 py-1.5 border-b border-stone-200 flex items-center justify-between text-[11px] font-semibold text-stone-600">
                        <span>Configured Inventory Requirements</span>
                        <span>Qty / Pkg</span>
                      </div>
                      <div className="divide-y divide-stone-100 max-h-36 overflow-y-auto">
                        {(pkg.components || []).map((comp) => (
                          <div
                            key={comp.item_id}
                            className="px-3 py-2 flex items-center justify-between text-xs hover:bg-stone-50"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                              <span className="truncate text-stone-800 font-medium">
                                {comp.item?.name || `Item #${comp.item_id}`}
                              </span>
                            </div>
                            <span className="font-semibold text-stone-900 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                              × {comp.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Bottleneck Statistics */}
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[11px] text-stone-500 block">
                          Combo Price / Event
                        </span>
                        <span className="text-base font-bold text-stone-900">
                          ₹{pkg.combo_price.toLocaleString("en-IN")}
                        </span>
                        {savings > 0 && (
                          <span className="text-[10px] text-emerald-700 block font-medium">
                            ₹{savings.toLocaleString("en-IN")} client savings
                          </span>
                        )}
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[11px] text-stone-500 block">
                          Stock Capacity Ceiling
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-base font-bold text-stone-900">
                            {displayCapacity} setups
                          </span>
                          {displayCapacity < 2 ? (
                            <span className="inline-flex text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                              Constrained
                            </span>
                          ) : (
                            <span className="inline-flex text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                              Ready
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 block">
                          based on component pool
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <button
                        onClick={() => handleToggleStatus(pkg.package_id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer border ${
                          pkg.is_active
                            ? "border-stone-300 text-stone-700 hover:bg-stone-100"
                            : "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        {pkg.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(pkg)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Package
                        </button>
                        <Link
                          href={`/catalog/${pkg.package_id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg transition"
                        >
                          Customer View
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Package Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-stone-800" />
                <h2 className="text-lg font-bold text-stone-900">
                  {editingPackageId ? "Edit Decoration Package" : "Create New Decoration Package"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 rounded-lg p-1 hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePackage} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-sm text-red-800 flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Theme Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">
                    Package Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Grand Heritage Mandap & Banquet Ensemble"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700">
                    Description & Arrangement Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the aesthetic theme, materials included, recommended event types (wedding, sangeet, reception), and venue requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
                    <span>Theme Keywords / Tags (used by pgvector semantic search)</span>
                    <span className="text-[11px] text-stone-400 font-normal">Comma-separated</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Pastel, Floral, Mandap, Fairy Lights, Luxury, Sangeet"
                    value={themeTags}
                    onChange={(e) => setThemeTags(e.target.value)}
                    className="w-full text-sm rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Components Builder Section */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Package Components (Inventory Items)
                    </h3>
                    <p className="text-xs text-stone-500">
                      All components must belong to your inventory. Shared stock is decremented atomically.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddComponent}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 px-2.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                </div>

                {selectedComponents.length === 0 ? (
                  <div className="bg-white rounded-lg border border-dashed border-stone-300 p-6 text-center text-xs text-stone-500">
                    No components added yet. Click &quot;Add Item&quot; to configure inventory components.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedComponents.map((comp, idx) => {
                      const currentItem = vendorItems.find((i) => i.item_id === comp.itemId);
                      const maxPossible = currentItem
                        ? Math.floor(currentItem.total_stock / comp.quantity)
                        : 0;

                      return (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                              Inventory Item
                            </label>
                            <select
                              value={comp.itemId}
                              onChange={(e) =>
                                handleUpdateComponentItem(idx, Number(e.target.value))
                              }
                              className="w-full text-xs rounded-md border border-stone-300 px-2.5 py-1.5 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-stone-900"
                            >
                              {vendorItems.map((item) => (
                                <option key={item.item_id} value={item.item_id}>
                                  {item.name} (Stock: {item.total_stock} · ₹{item.price_per_day}/day)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-28">
                            <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                              Units / Setup
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={comp.quantity}
                              onChange={(e) =>
                                handleUpdateComponentQty(idx, parseInt(e.target.value, 10))
                              }
                              className="w-full text-xs rounded-md border border-stone-300 px-2.5 py-1.5 text-center font-bold focus:ring-1 focus:ring-stone-900"
                            />
                          </div>

                          <div className="w-24 text-right">
                            <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                              Line Total
                            </label>
                            <span className="text-xs font-semibold text-stone-800">
                              ₹
                              {(
                                (currentItem?.price_per_day || 0) * comp.quantity
                              ).toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-stone-400 block">
                              Max: {maxPossible} pkgs
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(idx)}
                            className="text-stone-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition sm:mt-4"
                            title="Remove component"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Capacity Bottleneck & Pricing Analytics Preview */}
              <div className="bg-stone-900 text-white rounded-xl p-4.5 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-400 border-b border-stone-800 pb-2">
                  <span>Capacity & Combo Pricing Analytics</span>
                  <span className="text-amber-400 flex items-center gap-1 font-mono">
                    <Info className="w-3.5 h-3.5" />
                    Automated Invariants
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-stone-400 block">
                      Individual Item Sum
                    </span>
                    <span className="text-lg font-bold text-stone-200">
                      ₹{standaloneSum.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      at individual daily rates
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-amber-300 font-semibold block">
                      Combo Package Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={comboPrice}
                      onChange={(e) => setComboPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full text-sm font-bold bg-stone-800 border border-stone-700 rounded-md px-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 mt-0.5"
                    />
                    {savingsAmount > 0 && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-medium">
                        <TrendingDown className="w-3 h-3" />
                        {savingsPercent}% discount for customer
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-400 block">
                      Max Package Capacity
                    </span>
                    <span className="text-lg font-bold text-amber-400">
                      {maxCapacity} setups
                    </span>
                    <span className="text-[10px] text-stone-400 block truncate" title={bottleneckItem}>
                      Bottleneck: {bottleneckItem || "None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {editingPackageId ? "Save Changes" : "Publish Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
