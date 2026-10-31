// ============================================================================
// Rental Ledger — Domain & API Type Definitions
// Authoritative mapping to PostgreSQL schema & Application Data Contracts
// ============================================================================

export type UserRole = "customer" | "vendor" | "admin";

export type User = {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
};

export type Customer = {
  customer_id: number;
  user_id: number;
  default_address_id?: number | null;
  loyalty_points: number;
  user?: User;
};

export type VendorKYCStatus = "pending" | "verified" | "rejected";

export type Vendor = {
  vendor_id: number;
  user_id: number;
  business_name: string;
  business_address?: string;
  city: string;
  gst_number?: string;
  kyc_status: VendorKYCStatus;
  commission_rate: number; // e.g. 0.10 for 10%
  avg_rating: number;
  created_at: string;
  user?: User;
};

export type AddressLabel = "home" | "venue" | "other";

export type CustomerAddress = {
  address_id: number;
  customer_id: number;
  label: AddressLabel;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
};

export type Category = {
  category_id: number;
  parent_category_id?: number | null;
  name: string;
  description?: string;
  item_count?: number;
};

export type ItemCondition = "new" | "good" | "worn" | "damaged";

export type Item = {
  item_id: number;
  vendor_id: number;
  category_id?: number | null;
  name: string;
  description: string;
  condition: ItemCondition;
  price_per_day: number;
  security_deposit: number;
  total_stock: number;
  min_rental_days: number;
  is_active: boolean;
  created_at: string;
  images?: ItemImage[];
  primary_image?: string;
  category_name?: string;
  vendor_name?: string;
  vendor_city?: string;
};

export type ItemImage = {
  image_id: number;
  item_id: number;
  image_url: string;
  is_primary: boolean;
};

export type BlackoutReason = "maintenance" | "repair" | "vendor_holiday";

export type ItemBlackoutDate = {
  blackout_id: number;
  item_id: number;
  start_date: string;
  end_date: string;
  reason: BlackoutReason;
  notes?: string;
};

export type PackageItemComponent = {
  package_id: number;
  item_id: number;
  quantity: number;
  item?: Item;
};

export type Package = {
  package_id: number;
  vendor_id: number;
  name: string;
  description: string;
  theme_tags: string; // e.g. "Royal, Rajasthani, Floral, Gold, Mandap"
  combo_price: number;
  is_active: boolean;
  vendor_name?: string;
  vendor_city?: string;
  components?: PackageItemComponent[];
  primary_image?: string;
};

export type PackageEmbedding = {
  package_id: number;
  source_text: string;
  embedding: number[];
  embedding_model: string;
  embedded_at: string;
};

export type EventType = "wedding" | "engagement" | "reception" | "sangeet" | "other";

export type BookingStatus =
  | "pending"
  | "partially_confirmed"
  | "confirmed"
  | "completed"
  | "cancelled";

export type BookingSubStatus =
  | "requested"
  | "confirmed"
  | "rejected"
  | "delivered"
  | "returned"
  | "completed"
  | "cancelled";

export type FulfillmentType = "delivery" | "pickup" | "vendor_setup";

export type BookingItem = {
  booking_item_id: number;
  booking_id: number;
  vendor_id: number;
  item_id?: number | null;
  package_id?: number | null;
  quantity: number;
  price_at_booking: number;
  deposit_at_booking: number;
  fulfillment_type: FulfillmentType;
  sub_status: BookingSubStatus;
  created_at: string;
  item_name?: string;
  package_name?: string;
  vendor_name?: string;
  primary_image?: string;
};

export type AllocationStatus = "held" | "reserved" | "released" | "returned";

export type BookingItemAllocation = {
  allocation_id: number;
  booking_item_id: number;
  item_id: number;
  quantity_allocated: number;
  rental_start_date: string;
  rental_end_date: string;
  allocation_status: AllocationStatus;
  hold_expires_at?: string | null;
  returned_at?: string | null;
  created_at: string;
  item_name?: string;
};

export type Booking = {
  booking_id: number;
  customer_id: number;
  delivery_address_id?: number | null;
  event_type: EventType;
  event_start_date: string;
  event_end_date: string;
  status: BookingStatus;
  total_amount: number;
  coupon_id?: number | null;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  delivery_address?: CustomerAddress;
  items?: BookingItem[];
  allocations?: BookingItemAllocation[];
  payments?: Payment[];
  applied_coupon?: Coupon;
};

export type BookingStatusHistory = {
  history_id: number;
  booking_id: number;
  old_status?: string | null;
  new_status: string;
  changed_by?: number | null;
  reason?: string | null;
  changed_at: string;
};

export type PaymentType = "advance" | "full" | "balance" | "refund";
export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet" | "cash" | "simulation";
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type Payment = {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref: string;
  transaction_date: string;
};

export type CancellationPolicy = {
  policy_id: number;
  days_before_event: number;
  refund_percentage: number;
};

export type Cancellation = {
  cancellation_id: number;
  booking_item_id: number;
  cancelled_by: "customer" | "vendor" | "admin";
  reason: string;
  policy_id?: number | null;
  penalty_amount: number;
  refund_amount: number;
  cancelled_at: string;
};

export type VendorPayoutStatus = "pending" | "processing" | "paid" | "reversed";

export type VendorPayout = {
  payout_id: number;
  vendor_id: number;
  booking_item_id: number;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  status: VendorPayoutStatus;
  paid_at?: string | null;
  booking_id?: number;
  item_name?: string;
  customer_name?: string;
  vendor_name?: string;
};

export type Coupon = {
  coupon_id: number;
  code: string;
  discount_type: "flat" | "percentage";
  discount_value: number;
  vendor_id?: number | null;
  valid_from: string;
  valid_to: string;
  max_uses?: number | null;
  times_used: number;
};

export type Review = {
  review_id: number;
  customer_id: number;
  vendor_id: number;
  booking_item_id: number;
  rating: number; // 1 to 5
  comment: string;
  vendor_response?: string | null;
  created_at: string;
  customer_name?: string;
  item_name?: string;
  vendor_name?: string;
};

export type DisputeIssueType = "item_not_delivered" | "damaged" | "mismatch" | "other";
export type DisputeStatus = "open" | "under_review" | "resolved" | "rejected";

export type Dispute = {
  dispute_id: number;
  booking_item_id: number;
  raised_by: "customer" | "vendor";
  issue_type: DisputeIssueType;
  description: string;
  status: DisputeStatus;
  resolution_notes?: string | null;
  resolved_by?: number | null;
  created_at: string;
  resolved_at?: string | null;
  booking_id?: number;
  customer_name?: string;
  vendor_name?: string;
  item_name?: string;
};

export type NotificationType =
  | "booking_update"
  | "payment"
  | "cancellation"
  | "waitlist"
  | "dispute";

export type Notification = {
  notification_id: number;
  user_id: number;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  link?: string;
};

export type WaitlistStatus = "waiting" | "notified" | "expired";

export type Waitlist = {
  waitlist_id: number;
  customer_id: number;
  item_id: number;
  requested_quantity?: number;
  requested_start_date: string;
  requested_end_date: string;
  status: WaitlistStatus;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  item_name?: string;
};

// ============================================================================
// Semantic Search & Availability DTOs
// ============================================================================

export type AvailabilityStatus = "available" | "limited" | "unavailable";

export type ItemAvailability = {
  item_id: number;
  item_name: string;
  total_stock: number;
  available_stock: number;
  allocated_stock: number;
  status: AvailabilityStatus;
  is_blacked_out: boolean;
  blackout_reason?: string;
};

export type ComponentStockCheck = {
  item_id: number;
  item_name: string;
  required_per_package: number;
  total_required: number;
  available_stock: number;
  is_bottleneck: boolean;
  is_blacked_out: boolean;
};

export type PackageAvailability = {
  package_id: number;
  package_name: string;
  available_packages: number;
  requested_packages: number;
  is_fully_available: boolean;
  status: AvailabilityStatus;
  components: ComponentStockCheck[];
  bottleneck_item_name?: string;
};

export type SemanticSearchResult = {
  package: Package;
  similarity_score: number; // 0.0 - 1.0 (cosine similarity)
  matched_terms: string[];
  availability: PackageAvailability;
};

// ============================================================================
// Legacy & Dashboard UI Types
// ============================================================================

export type InventoryStatus = "Available" | "Low stock" | "Unavailable";

export type SummaryMetric = {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down" | "flat";
  helper: string;
};

export type BookingPreview = {
  id: string;
  customer: string;
  event: string;
  date: string;
  items: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Partially confirmed" | "Completed" | "Cancelled";
  initials: string;
};

export type InventoryPreview = {
  id: string;
  name: string;
  category: string;
  stock: number;
  reserved: number;
  unit: string;
  status: InventoryStatus;
};

export type DataMode = "mock" | "api";
