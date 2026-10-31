"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  Plus,
  Search,
  ExternalLink,
  User,
  Building,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { mockStore } from "@/lib/data/mock-store";
import { Review, Dispute, DisputeIssueType, DisputeStatus } from "@/lib/types";

export default function ReviewsAndDisputesPage() {
  const [currentUser] = useState(() => mockStore.getActiveUser());
  const [activeTab, setActiveTab] = useState<"reviews" | "disputes">("reviews");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [disputeStatusFilter, setDisputeStatusFilter] = useState<DisputeStatus | "all">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vendor Reply Modal
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [vendorResponseText, setVendorResponseText] = useState("");

  // Customer File Dispute Modal
  const [showFileDisputeModal, setShowFileDisputeModal] = useState(false);
  const [disputeBookingItemId, setDisputeBookingItemId] = useState<number>(201);
  const [disputeIssueType, setDisputeIssueType] = useState<DisputeIssueType>("mismatch");
  const [disputeDescription, setDisputeDescription] = useState("");

  // Admin Resolve Dispute Modal
  const [resolvingDisputeId, setResolvingDisputeId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

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

  // Load Reviews & Disputes
  const [reviews, setReviews] = useState<Review[]>(() => mockStore.getReviews(activeVendorId));
  const [disputes, setDisputes] = useState<Dispute[]>(() =>
    mockStore.getDisputes({ vendorId: activeVendorId })
  );

  const refreshData = () => {
    setReviews(mockStore.getReviews(activeVendorId));
    setDisputes(mockStore.getDisputes({ vendorId: activeVendorId }));
  };

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating !== ratingFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesComment = r.comment.toLowerCase().includes(q);
        const matchesCustomer = r.customer_name?.toLowerCase().includes(q) || false;
        const matchesItem = r.item_name?.toLowerCase().includes(q) || false;
        if (!matchesComment && !matchesCustomer && !matchesItem) return false;
      }
      return true;
    });
  }, [reviews, ratingFilter, searchQuery]);

  // Filtered Disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      if (disputeStatusFilter !== "all" && d.status !== disputeStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesDesc = d.description.toLowerCase().includes(q);
        const matchesCustomer = d.customer_name?.toLowerCase().includes(q) || false;
        const matchesItem = d.item_name?.toLowerCase().includes(q) || false;
        if (!matchesDesc && !matchesCustomer && !matchesItem) return false;
      }
      return true;
    });
  }, [disputes, disputeStatusFilter, searchQuery]);

  // Metrics
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";
  const openDisputesCount = disputes.filter((d) => d.status === "open").length;

  // Handlers
  const handleSendVendorResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReviewId || !vendorResponseText.trim()) return;
    try {
      mockStore.respondToReview(replyingReviewId, vendorResponseText.trim());
      refreshData();
      showToast("Vendor response published successfully!");
      setReplyingReviewId(null);
      setVendorResponseText("");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleCreateDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeDescription.trim()) return;
    try {
      mockStore.addDispute({
        booking_item_id: disputeBookingItemId,
        raised_by: currentUser.role === "vendor" ? "vendor" : "customer",
        issue_type: disputeIssueType,
        description: disputeDescription.trim(),
        customer_name: currentUser.name,
        booking_id: 101,
        item_name: "Contemporary Pastel Floral Wedding Package",
        vendor_name: "Prakash Mandap & Event Decors",
      });
      refreshData();
      showToast("Dispute ticket opened. Platform arbitration assigned.");
      setShowFileDisputeModal(false);
      setDisputeDescription("");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleResolveDispute = (action: "resolved" | "rejected") => {
    if (!resolvingDisputeId) return;
    try {
      mockStore.resolveDispute(resolvingDisputeId, resolutionNotes || "Arbitrated by platform operations", action);
      refreshData();
      showToast(`Dispute #DIS-${resolvingDisputeId} has been marked as ${action.toUpperCase()}.`);
      setResolvingDisputeId(null);
      setResolutionNotes("");
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
              Reviews & Disputes
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              Verified Event Clients
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Manage client reviews, post vendor responses, and review booking disputes with
            platform-level resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Action button based on role */}
          <button
            onClick={() => setShowFileDisputeModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            File an Issue / Dispute
          </button>

          {/* Tab Switcher */}
          <div className="inline-flex rounded-lg border border-stone-200 p-1 bg-stone-100 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab("disputes")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "disputes"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Disputes ({disputes.length})
              {openDisputesCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {openDisputesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Overall Client Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-stone-900">{avgRating}</span>
            <span className="text-xs text-stone-400">out of 5.0</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
            Based on {reviews.length} verified completed bookings
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Vendor Response Rate</span>
            <MessageSquare className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-3xl font-extrabold text-stone-900 mt-2">100%</div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            All reviews have public vendor remarks
          </span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-4.5 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Open Disputes</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-extrabold text-stone-900 mt-2">
            {openDisputesCount}
          </div>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {openDisputesCount === 0 ? "No active escalation" : "Awaiting arbitration"}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder={
              activeTab === "reviews"
                ? "Search reviews, client feedback..."
                : "Search disputes, issue details..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm rounded-lg border border-stone-300 pl-9 pr-3 py-2 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition"
          />
        </div>

        {activeTab === "reviews" ? (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500 mr-1">Rating:</span>
            {(["all", 5, 4, 3, 2, 1] as const).map((star) => (
              <button
                key={star}
                onClick={() => setRatingFilter(star)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  ratingFilter === star
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {star === "all" ? (
                  "All Stars"
                ) : (
                  <>
                    <Star className="w-3 h-3 fill-current" />
                    {star}
                  </>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            <span className="text-xs font-semibold text-stone-500 mr-1">Status:</span>
            {(["all", "open", "under_review", "resolved", "rejected"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setDisputeStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  disputeStatusFilter === status
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "reviews" ? (
        /* Reviews List */
        filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-800">No reviews found</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              No customer reviews match your active filter criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((r) => (
              <div
                key={r.review_id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-800 text-xs">
                      {r.customer_name?.slice(0, 2).toUpperCase() || "CU"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-snug">
                        {r.customer_name}
                      </h4>
                      <span className="text-[11px] text-stone-500">
                        {r.item_name} · Reviewed on{" "}
                        {new Date(r.created_at).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-stone-800">
                      {r.rating}.0
                    </span>
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  &quot;{r.comment}&quot;
                </p>

                {/* Vendor Response */}
                {r.vendor_response ? (
                  <div className="bg-stone-50 rounded-xl p-3.5 border-l-3 border-amber-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-stone-900">
                        Response from {r.vendor_name || "Vendor"}
                      </span>
                      <span className="text-[10px] text-stone-400">Official Remark</span>
                    </div>
                    <p className="text-xs text-stone-600">{r.vendor_response}</p>
                  </div>
                ) : (
                  currentUser.role === "vendor" && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setReplyingReviewId(r.review_id);
                          setVendorResponseText("");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Reply to Review
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Disputes List */
        filteredDisputes.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
            <ShieldAlert className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-stone-800">No disputes recorded</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-md mx-auto">
              All bookings are in good standing without active customer escalations.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((d) => (
              <div
                key={d.dispute_id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      #DIS-{d.dispute_id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        d.status === "open"
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : d.status === "under_review"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : d.status === "resolved"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-xs font-medium text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200 uppercase text-[10px]">
                      Issue: {d.issue_type.replace("_", " ")}
                    </span>
                  </div>

                  <span className="text-xs text-stone-400">
                    Raised on {new Date(d.created_at).toLocaleDateString("en-IN")} by {d.raised_by}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Booking & Client</span>
                    <span className="font-semibold text-stone-800">
                      {d.customer_name} (Booking #{d.booking_id})
                    </span>
                    <span className="text-stone-500 block text-[11px] mt-0.5">
                      {d.item_name}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block text-[11px]">Dispute Description</span>
                    <p className="text-stone-700 leading-relaxed">{d.description}</p>
                  </div>
                </div>

                {/* Resolution Notes */}
                {d.resolution_notes ? (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 space-y-1">
                    <span className="font-semibold block">Platform Resolution:</span>
                    <p>{d.resolution_notes}</p>
                    <span className="text-[10px] text-emerald-700 block">
                      Resolved on{" "}
                      {d.resolved_at
                        ? new Date(d.resolved_at).toLocaleDateString("en-IN")
                        : "Platform arbitration"}
                    </span>
                  </div>
                ) : (
                  (currentUser.role === "admin" || currentUser.role === "vendor") && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setResolvingDisputeId(d.dispute_id);
                          setResolutionNotes("");
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Arbitrate & Resolve Dispute
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Vendor Reply Modal */}
      {replyingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-stone-900 text-base">Reply to Customer Review</h3>
            <p className="text-xs text-stone-600">
              Your response will appear publicly under the customer&apos;s review on your vendor profile
              and catalog page.
            </p>
            <form onSubmit={handleSendVendorResponse} className="space-y-4">
              <textarea
                required
                rows={4}
                value={vendorResponseText}
                onChange={(e) => setVendorResponseText(e.target.value)}
                placeholder="Thank the client or clarify the operational arrangements..."
                className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:ring-2 focus:ring-stone-900 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingReviewId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  Post Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Dispute Modal */}
      {showFileDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-stone-900 text-base">File Booking Issue or Dispute</h3>
            </div>
            <p className="text-xs text-stone-600">
              Escalate issues regarding condition, mismatch, or delivery failures. Platform
              arbitration will inspect allocation logs and evidence.
            </p>

            <form onSubmit={handleCreateDispute} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Issue Classification
                </label>
                <select
                  value={disputeIssueType}
                  onChange={(e) => setDisputeIssueType(e.target.value as DisputeIssueType)}
                  className="w-full text-xs rounded-lg border border-stone-300 p-2 focus:ring-2 focus:ring-stone-900 focus:outline-none bg-stone-50"
                >
                  <option value="mismatch">Item Mismatch / Specification Variance</option>
                  <option value="damaged">Damaged / Sub-par Condition</option>
                  <option value="item_not_delivered">Item Not Delivered on Schedule</option>
                  <option value="other">Other Commercial Dispute</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Description of Issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Detail the issue with quantities, delivery timings, or condition..."
                  className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:ring-2 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFileDisputeModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Submit Dispute Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal (Admin / Arbitration) */}
      {resolvingDisputeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-stone-900 text-base">
              Arbitrate Dispute #DIS-{resolvingDisputeId}
            </h3>
            <p className="text-xs text-stone-600">
              Enter formal resolution notes explaining settlement adjustments, refund deductions, or
              restoration of vendor payouts.
            </p>
            <textarea
              required
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Verified delivery photos. 20% compensation granted for minor floral color variance."
              className="w-full text-xs rounded-lg border border-stone-300 p-2.5 focus:ring-2 focus:ring-stone-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolvingDisputeId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResolveDispute("rejected")}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleResolveDispute("resolved")}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs cursor-pointer"
              >
                Resolve & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
