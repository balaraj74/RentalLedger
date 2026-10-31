// ============================================================================
// Rental Ledger — Data Provider Interface & Factory
// Abstracts between deterministic mock provider and future PostgreSQL API provider
// ============================================================================

import { mockStore } from "@/lib/data/mock-store";
import type {
  Booking,
  BookingStatus,
  Category,
  Dispute,
  EventType,
  Item,
  Notification,
  Package,
  PackageAvailability,
  Payment,
  Review,
  SemanticSearchResult,
  SummaryMetric,
  User,
  Vendor,
  VendorPayout,
  Waitlist,
} from "@/lib/types";

export interface RentalLedgerDataProvider {
  // Session & User
  getActiveUser(): Promise<User>;
  switchUser(userId: number): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getAllVendors(): Promise<Vendor[]>;

  // Dashboard & Metrics
  getSummary(vendorId?: number): Promise<SummaryMetric[]>;

  // Catalog & Inventory
  getCategories(): Promise<Category[]>;
  getItems(filters?: {
    vendorId?: number;
    categoryId?: number;
    searchQuery?: string;
  }): Promise<Item[]>;
  getItemById(itemId: number): Promise<Item | undefined>;
  addItem(item: Omit<Item, "item_id" | "created_at">): Promise<Item>;
  updateItem(itemId: number, updates: Partial<Item>): Promise<Item>;
  checkItemAvailability(
    itemId: number,
    startDate: string,
    endDate: string
  ): Promise<{
    item_id: number;
    item_name: string;
    total_stock: number;
    available_stock: number;
    allocated_stock: number;
    status: string;
    is_blacked_out: boolean;
    blackout_reason?: string;
  }>;

  // Packages & Discovery
  getPackages(filters?: {
    vendorId?: number;
    searchQuery?: string;
  }): Promise<Package[]>;
  getPackageById(packageId: number): Promise<Package | undefined>;
  createPackage(params: {
    vendorId: number;
    name: string;
    description: string;
    themeTags: string;
    comboPrice: number;
    components: Array<{ itemId: number; quantity: number }>;
  }): Promise<Package>;
  checkPackageAvailability(
    packageId: number,
    startDate: string,
    endDate: string,
    requestedQuantity?: number
  ): Promise<PackageAvailability>;
  searchPackagesSemantically(
    queryText: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      minPrice?: number;
      maxPrice?: number;
      vendorId?: number;
    }
  ): Promise<SemanticSearchResult[]>;

  // Bookings & Allocations
  getBookings(filters?: {
    customerId?: number;
    vendorId?: number;
    status?: BookingStatus;
  }): Promise<Booking[]>;
  getBookingById(bookingId: number): Promise<Booking | undefined>;
  createBooking(params: {
    customerId: number;
    deliveryAddressId?: number;
    eventType: EventType;
    startDate: string;
    endDate: string;
    couponCode?: string;
    lines: Array<{
      itemId?: number;
      packageId?: number;
      quantity: number;
      fulfillmentType?: "delivery" | "pickup" | "vendor_setup";
    }>;
  }): Promise<{ booking: Booking }>;
  acceptBooking(bookingId: number): Promise<Booking | undefined>;
  rejectBooking(bookingId: number, reason?: string): Promise<Booking | undefined>;
  markBookingReturned(bookingId: number): Promise<Booking | undefined>;
  cancelBooking(
    bookingId: number,
    cancelledBy: "customer" | "vendor" | "admin",
    reason: string
  ): Promise<{ booking: Booking; refundAmount: number; penaltyAmount: number }>;

  // Financials & Payouts
  getPayments(filters?: { bookingId?: number }): Promise<Payment[]>;
  getPayouts(vendorId?: number): Promise<VendorPayout[]>;
  processPayout(payoutId: number): Promise<VendorPayout>;

  // Reviews, Disputes, Waitlist & Notifications
  getReviews(vendorId?: number): Promise<Review[]>;
  addReview(review: Omit<Review, "review_id" | "created_at">): Promise<Review>;
  respondToReview(reviewId: number, response: string): Promise<Review>;
  getDisputes(filters?: { status?: string }): Promise<Dispute[]>;
  resolveDispute(
    disputeId: number,
    notes: string,
    action: "resolved" | "rejected"
  ): Promise<Dispute>;
  getWaitlist(vendorId?: number): Promise<Waitlist[]>;
  addToWaitlist(
    entry: Omit<Waitlist, "waitlist_id" | "created_at" | "status">
  ): Promise<Waitlist>;
  notifyWaitlistCustomer(waitlistId: number): Promise<Waitlist>;
  getNotifications(userId: number): Promise<Notification[]>;
  markNotificationRead(notificationId: number): Promise<void>;
}

class MockDataProvider implements RentalLedgerDataProvider {
  async getActiveUser(): Promise<User> {
    return mockStore.getActiveUser();
  }
  async switchUser(userId: number): Promise<User> {
    return mockStore.setActiveUser(userId);
  }
  async getAllUsers(): Promise<User[]> {
    return mockStore.getAllUsers();
  }
  async getAllVendors(): Promise<Vendor[]> {
    return mockStore.getAllVendors();
  }
  async getSummary(vendorId?: number): Promise<SummaryMetric[]> {
    return mockStore.getSummaryMetrics(vendorId);
  }
  async getCategories(): Promise<Category[]> {
    return mockStore.getCategories();
  }
  async getItems(filters?: {
    vendorId?: number;
    categoryId?: number;
    searchQuery?: string;
  }): Promise<Item[]> {
    return mockStore.getItems(filters);
  }
  async getItemById(itemId: number): Promise<Item | undefined> {
    return mockStore.getItemById(itemId);
  }
  async addItem(item: Omit<Item, "item_id" | "created_at">): Promise<Item> {
    return mockStore.addItem(item);
  }
  async updateItem(itemId: number, updates: Partial<Item>): Promise<Item> {
    return mockStore.updateItem(itemId, updates);
  }
  async checkItemAvailability(
    itemId: number,
    startDate: string,
    endDate: string
  ) {
    return mockStore.checkItemAvailability(itemId, startDate, endDate);
  }
  async getPackages(filters?: {
    vendorId?: number;
    searchQuery?: string;
  }): Promise<Package[]> {
    return mockStore.getPackages(filters);
  }
  async getPackageById(packageId: number): Promise<Package | undefined> {
    return mockStore.getPackageById(packageId);
  }
  async createPackage(params: {
    vendorId: number;
    name: string;
    description: string;
    themeTags: string;
    comboPrice: number;
    components: Array<{ itemId: number; quantity: number }>;
  }): Promise<Package> {
    return mockStore.createPackage(params);
  }
  async checkPackageAvailability(
    packageId: number,
    startDate: string,
    endDate: string,
    requestedQuantity: number = 1
  ): Promise<PackageAvailability> {
    return mockStore.checkPackageAvailability(
      packageId,
      startDate,
      endDate,
      requestedQuantity
    );
  }
  async searchPackagesSemantically(
    queryText: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      minPrice?: number;
      maxPrice?: number;
      vendorId?: number;
    }
  ): Promise<SemanticSearchResult[]> {
    return mockStore.searchPackagesSemantically(queryText, filters);
  }
  async getBookings(filters?: {
    customerId?: number;
    vendorId?: number;
    status?: BookingStatus;
  }): Promise<Booking[]> {
    return mockStore.getBookings(filters);
  }
  async getBookingById(bookingId: number): Promise<Booking | undefined> {
    return mockStore.getBookingById(bookingId);
  }
  async createBooking(params: {
    customerId: number;
    deliveryAddressId?: number;
    eventType: EventType;
    startDate: string;
    endDate: string;
    couponCode?: string;
    lines: Array<{
      itemId?: number;
      packageId?: number;
      quantity: number;
      fulfillmentType?: "delivery" | "pickup" | "vendor_setup";
    }>;
  }): Promise<{ booking: Booking }> {
    return mockStore.createBooking(params);
  }
  async acceptBooking(bookingId: number): Promise<Booking | undefined> {
    return mockStore.acceptBooking(bookingId);
  }
  async rejectBooking(
    bookingId: number,
    reason?: string
  ): Promise<Booking | undefined> {
    return mockStore.rejectBooking(bookingId, reason);
  }
  async markBookingReturned(bookingId: number): Promise<Booking | undefined> {
    return mockStore.markBookingReturned(bookingId);
  }
  async cancelBooking(
    bookingId: number,
    cancelledBy: "customer" | "vendor" | "admin",
    reason: string
  ): Promise<{ booking: Booking; refundAmount: number; penaltyAmount: number }> {
    return mockStore.cancelBooking(bookingId, cancelledBy, reason);
  }
  async getPayments(filters?: { bookingId?: number }): Promise<Payment[]> {
    return mockStore.getPayments(filters);
  }
  async getPayouts(vendorId?: number): Promise<VendorPayout[]> {
    return mockStore.getPayouts(vendorId);
  }
  async processPayout(payoutId: number): Promise<VendorPayout> {
    return mockStore.processPayout(payoutId);
  }
  async getReviews(vendorId?: number): Promise<Review[]> {
    return mockStore.getReviews(vendorId);
  }
  async addReview(
    review: Omit<Review, "review_id" | "created_at">
  ): Promise<Review> {
    return mockStore.addReview(review);
  }
  async respondToReview(reviewId: number, response: string): Promise<Review> {
    return mockStore.respondToReview(reviewId, response);
  }
  async getDisputes(filters?: { status?: string }): Promise<Dispute[]> {
    return mockStore.getDisputes(filters);
  }
  async resolveDispute(
    disputeId: number,
    notes: string,
    action: "resolved" | "rejected"
  ): Promise<Dispute> {
    return mockStore.resolveDispute(disputeId, notes, action);
  }
  async getWaitlist(vendorId?: number): Promise<Waitlist[]> {
    return mockStore.getWaitlist(vendorId);
  }
  async addToWaitlist(
    entry: Omit<Waitlist, "waitlist_id" | "created_at" | "status">
  ): Promise<Waitlist> {
    return mockStore.addToWaitlist(entry);
  }
  async notifyWaitlistCustomer(waitlistId: number): Promise<Waitlist> {
    return mockStore.notifyWaitlistCustomer(waitlistId);
  }
  async getNotifications(userId: number): Promise<Notification[]> {
    return mockStore.getNotifications(userId);
  }
  async markNotificationRead(notificationId: number): Promise<void> {
    mockStore.markNotificationRead(notificationId);
  }
}

// Export singleton data provider instance
export const dataProvider: RentalLedgerDataProvider = new MockDataProvider();
