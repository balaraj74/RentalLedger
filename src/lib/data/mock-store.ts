// ============================================================================
// Rental Ledger — In-Memory Reactive Mock Store & Domain Engine
// Provides full relational integrity, date-range availability calculations,
// concurrency-safe atomic allocation simulation, and LocalStorage sync.
// ============================================================================

import type {
  Booking,
  BookingItem,
  BookingItemAllocation,
  BookingStatus,
  BookingStatusHistory,
  Cancellation,
  CancellationPolicy,
  Category,
  ComponentStockCheck,
  Coupon,
  Customer,
  CustomerAddress,
  Dispute,
  EventType,
  Item,
  ItemBlackoutDate,
  Notification,
  Package,
  PackageAvailability,
  PackageItemComponent,
  Payment,
  Review,
  SemanticSearchResult,
  SummaryMetric,
  User,
  Vendor,
  VendorPayout,
  Waitlist,
} from "@/lib/types";

// ============================================================================
// Seed Data Definitions (Authoritative Indian Wedding/Function Rental Catalog)
// ============================================================================

const SEED_USERS: User[] = [
  {
    user_id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98450 12345",
    role: "customer",
    is_verified: true,
    created_at: "2026-08-10T10:00:00Z",
  },
  {
    user_id: 2,
    name: "Ravi Prakash",
    email: "ravi@prakashdecors.in",
    phone: "+91 98860 54321",
    role: "vendor",
    is_verified: true,
    created_at: "2026-07-01T09:00:00Z",
  },
  {
    user_id: 3,
    name: "Sunita Rao",
    email: "sunita@royalfestivities.in",
    phone: "+91 99000 88776",
    role: "vendor",
    is_verified: true,
    created_at: "2026-07-15T11:00:00Z",
  },
  {
    user_id: 4,
    name: "Pooja Hegde",
    email: "pooja.ops@rentalledger.local",
    phone: "+91 94480 99001",
    role: "admin",
    is_verified: true,
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    user_id: 5,
    name: "Meera Nair",
    email: "meera.nair@example.com",
    phone: "+91 97410 44332",
    role: "customer",
    is_verified: true,
    created_at: "2026-09-05T14:30:00Z",
  },
  {
    user_id: 6,
    name: "Rohan Kulkarni",
    email: "rohan.k@example.com",
    phone: "+91 98800 66554",
    role: "customer",
    is_verified: true,
    created_at: "2026-09-12T16:00:00Z",
  },
];

const SEED_CUSTOMERS: Customer[] = [
  { customer_id: 1, user_id: 1, default_address_id: 1, loyalty_points: 350 },
  { customer_id: 2, user_id: 5, default_address_id: 4, loyalty_points: 120 },
  { customer_id: 3, user_id: 6, default_address_id: 5, loyalty_points: 50 },
];

const SEED_VENDORS: Vendor[] = [
  {
    vendor_id: 1,
    user_id: 2,
    business_name: "Prakash Mandap & Event Decors",
    business_address: "Plot 42, 8th Main, Industrial Suburb, Yeshwanthpur",
    city: "Bengaluru",
    gst_number: "29ABCDE1234F1Z5",
    kyc_status: "verified",
    commission_rate: 0.10,
    avg_rating: 4.8,
    created_at: "2026-07-01T09:00:00Z",
  },
  {
    vendor_id: 2,
    user_id: 3,
    business_name: "Royal Festivities & Furnishings",
    business_address: "18, Palace Road, Vani Vilas Mohalla",
    city: "Mysuru",
    gst_number: "29XYZAB5678C2Z9",
    kyc_status: "verified",
    commission_rate: 0.10,
    avg_rating: 4.6,
    created_at: "2026-07-15T11:00:00Z",
  },
];

const SEED_ADDRESSES: CustomerAddress[] = [
  {
    address_id: 1,
    customer_id: 1,
    label: "home",
    address_line: "Flat 402, Green Glen Towers, Bellandur",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    is_default: true,
  },
  {
    address_id: 2,
    customer_id: 1,
    label: "venue",
    address_line: "Palace Grounds, Main Gate 4, Bellary Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560006",
    is_default: false,
  },
  {
    address_id: 3,
    customer_id: 1,
    label: "venue",
    address_line: "The Leela Convention Hall, Old Airport Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560008",
    is_default: false,
  },
  {
    address_id: 4,
    customer_id: 2,
    label: "home",
    address_line: "Villa 12, Sobha Malabar, Kadavanthra",
    city: "Kochi",
    state: "Kerala",
    pincode: "682020",
    is_default: true,
  },
  {
    address_id: 5,
    customer_id: 3,
    label: "home",
    address_line: "21, Prabhat Road, Lane 4, Deccan",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411004",
    is_default: true,
  },
];

const SEED_CATEGORIES: Category[] = [
  { category_id: 1, name: "Mandap & Canopies", description: "Traditional teakwood, royal, and floral canopies for wedding ceremonies" },
  { category_id: 2, name: "Seating & Chairs", description: "Banquet Chiavari chairs, royal thrones, and comfortable guest seating" },
  { category_id: 3, name: "Banquet Tables & Furniture", description: "Round guest dining tables, buffet counters, and luxury VIP setups" },
  { category_id: 4, name: "Stage & Backdrop Décor", description: "Modular stages, floral walls, velvet backdrops, and welcome arches" },
  { category_id: 5, name: "Lighting & Illumination", description: "Warm fairy string lights, RGB stage uplights, and crystal chandeliers" },
  { category_id: 6, name: "Traditional Brass & Cultural Accessories", description: "Peacock deepam samai, urlis, floral brass bowls, and wedding accessories" },
];

const SEED_ITEMS: Item[] = [
  {
    item_id: 1,
    vendor_id: 1,
    category_id: 1,
    name: "Traditional Teakwood Carved Mandap Frame",
    description: "Four-pillar hand-carved south Indian temple style teakwood mandap with floral ring attachment and havan kund platform.",
    condition: "good",
    price_per_day: 24000,
    security_deposit: 10000,
    total_stock: 6,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-02T10:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    category_name: "Mandap & Canopies",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 2,
    vendor_id: 1,
    category_id: 1,
    name: "Contemporary Pastel Floral Mandap Canopy",
    description: "Open-air modern curved metal arch canopy with draped chiffon and artificial blush-pink and white hydrangeas.",
    condition: "new",
    price_per_day: 28500,
    security_deposit: 12000,
    total_stock: 8,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-05T12:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1545232979-fbf68fe9b1af?auto=format&fit=crop&w=800&q=80",
    category_name: "Mandap & Canopies",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 3,
    vendor_id: 1,
    category_id: 2,
    name: "Ivory Chiavari Banquet Chair with Cushion",
    description: "High-grade resin banquet chair in pearl ivory with removable white velvet cushion. High comfort for long ceremonies.",
    condition: "good",
    price_per_day: 85,
    security_deposit: 2000,
    total_stock: 350,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-03T10:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
    category_name: "Seating & Chairs",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 4,
    vendor_id: 1,
    category_id: 2,
    name: "Maharaja Gold Velvet Throne Chairs (Pair)",
    description: "Carved gold-leaf teakwood ceremonial bride and groom high-back chairs with deep maroon velvet upholstery.",
    condition: "good",
    price_per_day: 3500,
    security_deposit: 3000,
    total_stock: 12,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-04T11:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
    category_name: "Seating & Chairs",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 5,
    vendor_id: 1,
    category_id: 2,
    name: "Cushion Crossback Rustic Dining Chair",
    description: "Warm oak timber crossback chair with natural linen tie-on cushion. Ideal for sangeet and outdoor dinners.",
    condition: "good",
    price_per_day: 95,
    security_deposit: 1500,
    total_stock: 220,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-06T14:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&w=800&q=80",
    category_name: "Seating & Chairs",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 6,
    vendor_id: 1,
    category_id: 3,
    name: "Round 6-Foot Banquet Table with Satin Tablecloth",
    description: "Folding heavy-duty banquet table seating 8-10 guests, including wrinkle-resistant ivory satin runner and skirting.",
    condition: "good",
    price_per_day: 450,
    security_deposit: 1000,
    total_stock: 45,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-06T15:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
    category_name: "Banquet Tables & Furniture",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 7,
    vendor_id: 1,
    category_id: 3,
    name: "Mirror-Top Rectangular VIP Table (8ft)",
    description: "Gold electroplated stainless steel frame with beveled safety mirror top. Perfect for family head tables.",
    condition: "new",
    price_per_day: 1200,
    security_deposit: 2500,
    total_stock: 16,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-08T09:30:00Z",
    primary_image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80",
    category_name: "Banquet Tables & Furniture",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 8,
    vendor_id: 1,
    category_id: 4,
    name: "Modular Carpeted Function Stage (40x20 ft)",
    description: "Adjustable height aluminum modular stage platforms with non-slip red carpet covering and safety skirting.",
    condition: "good",
    price_per_day: 18000,
    security_deposit: 8000,
    total_stock: 4,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-09T11:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80",
    category_name: "Stage & Backdrop Décor",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 9,
    vendor_id: 1,
    category_id: 4,
    name: "Handcrafted Marigold & Jasmine Floral Backdrop (12x10 ft)",
    description: "Dense hanging floral curtain with brass bells, suspended tassel borders, and golden fairy backlight channels.",
    condition: "good",
    price_per_day: 12500,
    security_deposit: 4000,
    total_stock: 10,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-10T14:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
    category_name: "Stage & Backdrop Décor",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 10,
    vendor_id: 1,
    category_id: 5,
    name: "Warm LED Fairy String Light Bundles (100m Set)",
    description: "Commercial waterproof IP65 warm amber fairy lights with multiple flashing and static ambient modes.",
    condition: "good",
    price_per_day: 350,
    security_deposit: 500,
    total_stock: 80,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-11T16:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    category_name: "Lighting & Illumination",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 11,
    vendor_id: 1,
    category_id: 5,
    name: "RGBW DMX Stage Uplight Cans (Pack of 8)",
    description: "High-power 54x3W LED stage wash par lights with remote wireless DMX control and sound-activation.",
    condition: "new",
    price_per_day: 2800,
    security_deposit: 2000,
    total_stock: 25,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-12T13:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80",
    category_name: "Lighting & Illumination",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 12,
    vendor_id: 1,
    category_id: 6,
    name: "Brass Traditional Peacock Samai Deepam (5ft Pair)",
    description: "Pure heavy brass polished 5-tier traditional oil lamps with carved peacock finial for auspicious lighting.",
    condition: "good",
    price_per_day: 1800,
    security_deposit: 2500,
    total_stock: 15,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-13T10:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80",
    category_name: "Traditional Brass & Cultural Accessories",
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
  },
  {
    item_id: 13,
    vendor_id: 2,
    category_id: 5,
    name: "Crystal Chandelier Centerpiece Hanging Unit",
    description: "Tiered K9 crystal chandelier with internal warm golden halogen spotlight for entrance mandap or banquet hall.",
    condition: "good",
    price_per_day: 3200,
    security_deposit: 3000,
    total_stock: 18,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-16T12:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
    category_name: "Lighting & Illumination",
    vendor_name: "Royal Festivities & Furnishings",
    vendor_city: "Mysuru",
  },
  {
    item_id: 14,
    vendor_id: 2,
    category_id: 2,
    name: "Royal Rajasthani Low Diwan Seating with Bolsters",
    description: "Handcrafted low wooden carved diwan with rich brocade mattress, 4 silk bolsters, and 6 zardozi cushion covers.",
    condition: "good",
    price_per_day: 1500,
    security_deposit: 1500,
    total_stock: 20,
    min_rental_days: 1,
    is_active: true,
    created_at: "2026-07-17T15:00:00Z",
    primary_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    category_name: "Seating & Chairs",
    vendor_name: "Royal Festivities & Furnishings",
    vendor_city: "Mysuru",
  },
];

const SEED_BLACKOUTS: ItemBlackoutDate[] = [
  {
    blackout_id: 1,
    item_id: 1,
    start_date: "2026-11-14",
    end_date: "2026-11-16",
    reason: "maintenance",
    notes: "Annual polish, structural timber inspection and termite protection.",
  },
  {
    blackout_id: 2,
    item_id: 10,
    start_date: "2026-11-20",
    end_date: "2026-11-22",
    reason: "repair",
    notes: "Transformer testing and waterproof connector replacement.",
  },
];

const SEED_PACKAGE_COMPONENTS: PackageItemComponent[] = [
  // Package 1: Royal Grand Heritage Mandap & Banquet Ensemble (Vendor 1)
  { package_id: 1, item_id: 1, quantity: 1 },   // Teakwood Mandap Frame x 1
  { package_id: 1, item_id: 4, quantity: 1 },   // Maharaja Throne Chairs x 1 pair
  { package_id: 1, item_id: 3, quantity: 150 }, // Ivory Chiavari Chairs x 150
  { package_id: 1, item_id: 6, quantity: 15 },  // Round Banquet Tables x 15
  { package_id: 1, item_id: 10, quantity: 20 }, // Warm LED Fairy Lights x 20
  { package_id: 1, item_id: 12, quantity: 2 },  // Brass Samai Deepam x 2 pairs

  // Package 2: Contemporary Pastel Floral Wedding Package (Vendor 1)
  { package_id: 2, item_id: 2, quantity: 1 },   // Pastel Floral Mandap x 1
  { package_id: 2, item_id: 8, quantity: 1 },   // Modular Stage 40x20 x 1
  { package_id: 2, item_id: 9, quantity: 1 },   // Marigold/Jasmine Backdrop x 1
  { package_id: 2, item_id: 3, quantity: 100 }, // Ivory Chiavari Chairs x 100
  { package_id: 2, item_id: 10, quantity: 25 }, // Warm LED Fairy Lights x 25
  { package_id: 2, item_id: 11, quantity: 2 },  // RGBW Stage Uplights x 2 packs

  // Package 3: Intimate Sangeet & Mehendi Celebration Setup (Vendor 1)
  { package_id: 3, item_id: 9, quantity: 1 },   // Marigold Backdrop x 1
  { package_id: 3, item_id: 5, quantity: 60 },  // Cushion Crossback Chairs x 60
  { package_id: 3, item_id: 6, quantity: 8 },   // Round Banquet Tables x 8
  { package_id: 3, item_id: 10, quantity: 15 }, // Warm LED Fairy Lights x 15
  { package_id: 3, item_id: 11, quantity: 1 },  // RGBW Stage Uplights x 1 pack

  // Package 4: Royal Rajasthani Canopy & Chandelier Luxury Setup (Vendor 2)
  { package_id: 4, item_id: 13, quantity: 4 },  // Crystal Chandelier x 4
  { package_id: 4, item_id: 14, quantity: 8 },  // Royal Diwan Seating x 8
];

const SEED_PACKAGES: Package[] = [
  {
    package_id: 1,
    vendor_id: 1,
    name: "Royal Grand Heritage Mandap & Banquet Ensemble",
    description: "Complete traditional South Indian wedding ceremony package featuring authentic carved teakwood mandap, maharaja throne chairs, 150 ivory guest chairs, 15 banquet tables, warm fairy illumination, and tall auspicious brass samai lamps.",
    theme_tags: "Royal, Heritage, Traditional, Teakwood, Mandap, Gold, Grand Wedding, Classical, South Indian",
    combo_price: 62000,
    is_active: true,
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
    primary_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  {
    package_id: 2,
    vendor_id: 1,
    name: "Contemporary Pastel Floral Wedding Package",
    description: "Breathtaking modern romantic wedding arrangement with curved blush-pink floral mandap, large modular carpeted stage, floral entrance backdrop, 100 guest Chiavari chairs, ambient amber strings, and intelligent DMX stage wash uplights.",
    theme_tags: "Pastel, Floral, Contemporary, Romantic, Engagement, Reception, Fairy Lights, Modern, Elegant",
    combo_price: 54000,
    is_active: true,
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
    primary_image: "https://images.unsplash.com/photo-1545232979-fbf68fe9b1af?auto=format&fit=crop&w=800&q=80",
  },
  {
    package_id: 3,
    vendor_id: 1,
    name: "Intimate Sangeet & Mehendi Celebration Setup",
    description: "Vibrant yellow marigold and jasmine backdrop, 60 rustic crossback chairs, 8 banquet dining tables with runners, fairy canopy lighting, and stage wash lighting for lively musical evenings.",
    theme_tags: "Sangeet, Mehendi, Vibrant, Marigold, Crossback, Rustic, Music Night, Haldi, Intimate",
    combo_price: 31500,
    is_active: true,
    vendor_name: "Prakash Mandap & Event Decors",
    vendor_city: "Bengaluru",
    primary_image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
  },
  {
    package_id: 4,
    vendor_id: 2,
    name: "Royal Rajasthani Canopy & Chandelier Luxury Setup",
    description: "Palatial ambiance package with 4 sparkling crystal chandeliers and 8 handcrafted royal diwan setups with silk brocade bolsters and cushions for high-end VIP receptions.",
    theme_tags: "Rajasthani, Luxury, Chandelier, Crystal, Diwan, Palace, Reception, Royal, Mysuru",
    combo_price: 48000,
    is_active: true,
    vendor_name: "Royal Festivities & Furnishings",
    vendor_city: "Mysuru",
    primary_image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80",
  },
];

const SEED_POLICIES: CancellationPolicy[] = [
  { policy_id: 1, days_before_event: 30, refund_percentage: 100 },
  { policy_id: 2, days_before_event: 15, refund_percentage: 75 },
  { policy_id: 3, days_before_event: 7, refund_percentage: 50 },
  { policy_id: 4, days_before_event: 0, refund_percentage: 0 },
];

const SEED_COUPONS: Coupon[] = [
  {
    coupon_id: 1,
    code: "WEDDING2026",
    discount_type: "percentage",
    discount_value: 10,
    valid_from: "2026-01-01",
    valid_to: "2026-12-31",
    max_uses: 500,
    times_used: 42,
  },
  {
    coupon_id: 2,
    code: "FESTIVE5000",
    discount_type: "flat",
    discount_value: 5000,
    valid_from: "2026-08-01",
    valid_to: "2026-12-31",
    max_uses: 100,
    times_used: 18,
  },
  {
    coupon_id: 3,
    code: "EARLYBIRD",
    discount_type: "percentage",
    discount_value: 15,
    valid_from: "2026-09-01",
    valid_to: "2026-11-30",
    max_uses: 50,
    times_used: 12,
  },
];

const SEED_BOOKINGS: Booking[] = [
  {
    booking_id: 101,
    customer_id: 1,
    delivery_address_id: 2,
    event_type: "reception",
    event_start_date: "2026-11-02",
    event_end_date: "2026-11-04",
    status: "confirmed",
    total_amount: 54000,
    coupon_id: 1,
    created_at: "2026-10-15T09:30:00Z",
    customer_name: "Aarav Sharma",
    customer_phone: "+91 98450 12345",
  },
  {
    booking_id: 102,
    customer_id: 2,
    delivery_address_id: 4,
    event_type: "engagement",
    event_start_date: "2026-11-04",
    event_end_date: "2026-11-05",
    status: "pending",
    total_amount: 32700,
    created_at: "2026-10-24T14:15:00Z",
    customer_name: "Meera Nair",
    customer_phone: "+91 97410 44332",
  },
  {
    booking_id: 103,
    customer_id: 3,
    delivery_address_id: 5,
    event_type: "wedding",
    event_start_date: "2026-11-06",
    event_end_date: "2026-11-08",
    status: "partially_confirmed",
    total_amount: 62000,
    created_at: "2026-10-25T11:45:00Z",
    customer_name: "Rohan Kulkarni",
    customer_phone: "+91 98800 66554",
  },
  {
    booking_id: 104,
    customer_id: 1,
    delivery_address_id: 1,
    event_type: "sangeet",
    event_start_date: "2026-10-20",
    event_end_date: "2026-10-22",
    status: "completed",
    total_amount: 31500,
    created_at: "2026-09-28T16:00:00Z",
    customer_name: "Aarav Sharma",
    customer_phone: "+91 98450 12345",
  },
  {
    booking_id: 105,
    customer_id: 2,
    delivery_address_id: 4,
    event_type: "wedding",
    event_start_date: "2026-10-25",
    event_end_date: "2026-10-26",
    status: "cancelled",
    total_amount: 24000,
    created_at: "2026-10-01T10:00:00Z",
    customer_name: "Meera Nair",
    customer_phone: "+91 97410 44332",
  },
];

const SEED_BOOKING_ITEMS: BookingItem[] = [
  // Booking 101: Package 2 (Contemporary Pastel Floral)
  {
    booking_item_id: 201,
    booking_id: 101,
    vendor_id: 1,
    package_id: 2,
    item_id: null,
    quantity: 1,
    price_at_booking: 54000,
    deposit_at_booking: 12000,
    fulfillment_type: "vendor_setup",
    sub_status: "confirmed",
    created_at: "2026-10-15T09:30:00Z",
    package_name: "Contemporary Pastel Floral Wedding Package",
    vendor_name: "Prakash Mandap & Event Decors",
    primary_image: "https://images.unsplash.com/photo-1545232979-fbf68fe9b1af?auto=format&fit=crop&w=800&q=80",
  },
  // Booking 102: Direct rental lines
  {
    booking_item_id: 202,
    booking_id: 102,
    vendor_id: 1,
    item_id: 9,
    package_id: null,
    quantity: 1,
    price_at_booking: 12500,
    deposit_at_booking: 4000,
    fulfillment_type: "delivery",
    sub_status: "requested",
    created_at: "2026-10-24T14:15:00Z",
    item_name: "Handcrafted Marigold & Jasmine Floral Backdrop (12x10 ft)",
    vendor_name: "Prakash Mandap & Event Decors",
    primary_image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
  },
  {
    booking_item_id: 203,
    booking_id: 102,
    vendor_id: 1,
    item_id: 3,
    package_id: null,
    quantity: 120,
    price_at_booking: 85,
    deposit_at_booking: 2000,
    fulfillment_type: "delivery",
    sub_status: "requested",
    created_at: "2026-10-24T14:15:00Z",
    item_name: "Ivory Chiavari Banquet Chair with Cushion",
    vendor_name: "Prakash Mandap & Event Decors",
    primary_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
  },
  // Booking 103: Package 1 (Royal Grand Heritage Mandap)
  {
    booking_item_id: 204,
    booking_id: 103,
    vendor_id: 1,
    package_id: 1,
    item_id: null,
    quantity: 1,
    price_at_booking: 62000,
    deposit_at_booking: 10000,
    fulfillment_type: "vendor_setup",
    sub_status: "confirmed",
    created_at: "2026-10-25T11:45:00Z",
    package_name: "Royal Grand Heritage Mandap & Banquet Ensemble",
    vendor_name: "Prakash Mandap & Event Decors",
    primary_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
  // Booking 104: Package 3 (Intimate Sangeet & Mehendi)
  {
    booking_item_id: 205,
    booking_id: 104,
    vendor_id: 1,
    package_id: 3,
    item_id: null,
    quantity: 1,
    price_at_booking: 31500,
    deposit_at_booking: 4000,
    fulfillment_type: "delivery",
    sub_status: "completed",
    created_at: "2026-09-28T16:00:00Z",
    package_name: "Intimate Sangeet & Mehendi Celebration Setup",
    vendor_name: "Prakash Mandap & Event Decors",
    primary_image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
  },
  // Booking 105: Direct Teakwood mandap rental (Cancelled)
  {
    booking_item_id: 206,
    booking_id: 105,
    vendor_id: 1,
    item_id: 1,
    package_id: null,
    quantity: 1,
    price_at_booking: 24000,
    deposit_at_booking: 10000,
    fulfillment_type: "delivery",
    sub_status: "cancelled",
    created_at: "2026-10-01T10:00:00Z",
    item_name: "Traditional Teakwood Carved Mandap Frame",
    vendor_name: "Prakash Mandap & Event Decors",
    primary_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  },
];

const SEED_ALLOCATIONS: BookingItemAllocation[] = [
  // Allocations for Booking 101 (Package 2 components) — RESERVED
  { allocation_id: 301, booking_item_id: 201, item_id: 2, quantity_allocated: 1, rental_start_date: "2026-11-02", rental_end_date: "2026-11-04", allocation_status: "reserved", created_at: "2026-10-15T09:30:00Z", item_name: "Contemporary Pastel Floral Mandap Canopy" },
  { allocation_id: 302, booking_item_id: 201, item_id: 8, quantity_allocated: 1, rental_start_date: "2026-11-02", rental_end_date: "2026-11-04", allocation_status: "reserved", created_at: "2026-10-15T09:30:00Z", item_name: "Modular Carpeted Function Stage (40x20 ft)" },
  { allocation_id: 303, booking_item_id: 201, item_id: 9, quantity_allocated: 1, rental_start_date: "2026-11-02", rental_end_date: "2026-11-04", allocation_status: "reserved", created_at: "2026-10-15T09:30:00Z", item_name: "Handcrafted Marigold & Jasmine Floral Backdrop (12x10 ft)" },
  { allocation_id: 304, booking_item_id: 201, item_id: 3, quantity_allocated: 100, rental_start_date: "2026-11-02", rental_end_date: "2026-11-04", allocation_status: "reserved", created_at: "2026-10-15T09:30:00Z", item_name: "Ivory Chiavari Banquet Chair with Cushion" },
  { allocation_id: 305, booking_item_id: 201, item_id: 10, quantity_allocated: 25, rental_start_date: "2026-11-02", rental_end_date: "2026-11-04", allocation_status: "reserved", created_at: "2026-10-15T09:30:00Z", item_name: "Warm LED Fairy String Light Bundles (100m Set)" },
  { allocation_id: 306, booking_item_id: 201, item_id: 11, quantity_allocated: 2, rental_start_date: "2026-11-02", rental_end_date: "2026-11-04", allocation_status: "reserved", created_at: "2026-10-15T09:30:00Z", item_name: "RGBW DMX Stage Uplight Cans (Pack of 8)" },

  // Allocations for Booking 102 (Direct items) — HELD (with hold expiry)
  { allocation_id: 307, booking_item_id: 202, item_id: 9, quantity_allocated: 1, rental_start_date: "2026-11-04", rental_end_date: "2026-11-05", allocation_status: "held", hold_expires_at: "2026-10-29T18:00:00Z", created_at: "2026-10-24T14:15:00Z", item_name: "Handcrafted Marigold & Jasmine Floral Backdrop (12x10 ft)" },
  { allocation_id: 308, booking_item_id: 203, item_id: 3, quantity_allocated: 120, rental_start_date: "2026-11-04", rental_end_date: "2026-11-05", allocation_status: "held", hold_expires_at: "2026-10-29T18:00:00Z", created_at: "2026-10-24T14:15:00Z", item_name: "Ivory Chiavari Banquet Chair with Cushion" },

  // Allocations for Booking 103 (Package 1 components) — RESERVED
  { allocation_id: 309, booking_item_id: 204, item_id: 1, quantity_allocated: 1, rental_start_date: "2026-11-06", rental_end_date: "2026-11-08", allocation_status: "reserved", created_at: "2026-10-25T11:45:00Z", item_name: "Traditional Teakwood Carved Mandap Frame" },
  { allocation_id: 310, booking_item_id: 204, item_id: 4, quantity_allocated: 1, rental_start_date: "2026-11-06", rental_end_date: "2026-11-08", allocation_status: "reserved", created_at: "2026-10-25T11:45:00Z", item_name: "Maharaja Gold Velvet Throne Chairs (Pair)" },
  { allocation_id: 311, booking_item_id: 204, item_id: 3, quantity_allocated: 150, rental_start_date: "2026-11-06", rental_end_date: "2026-11-08", allocation_status: "reserved", created_at: "2026-10-25T11:45:00Z", item_name: "Ivory Chiavari Banquet Chair with Cushion" },
  { allocation_id: 312, booking_item_id: 204, item_id: 6, quantity_allocated: 15, rental_start_date: "2026-11-06", rental_end_date: "2026-11-08", allocation_status: "reserved", created_at: "2026-10-25T11:45:00Z", item_name: "Round 6-Foot Banquet Table with Satin Tablecloth" },
  { allocation_id: 313, booking_item_id: 204, item_id: 10, quantity_allocated: 20, rental_start_date: "2026-11-06", rental_end_date: "2026-11-08", allocation_status: "reserved", created_at: "2026-10-25T11:45:00Z", item_name: "Warm LED Fairy String Light Bundles (100m Set)" },
  { allocation_id: 314, booking_item_id: 204, item_id: 12, quantity_allocated: 2, rental_start_date: "2026-11-06", rental_end_date: "2026-11-08", allocation_status: "reserved", created_at: "2026-10-25T11:45:00Z", item_name: "Brass Traditional Peacock Samai Deepam (5ft Pair)" },

  // Allocations for Booking 104 (Completed) — RETURNED
  { allocation_id: 315, booking_item_id: 205, item_id: 9, quantity_allocated: 1, rental_start_date: "2026-10-20", rental_end_date: "2026-10-22", allocation_status: "returned", returned_at: "2026-10-23T11:00:00Z", created_at: "2026-09-28T16:00:00Z", item_name: "Handcrafted Marigold & Jasmine Floral Backdrop (12x10 ft)" },

  // Allocations for Booking 105 (Cancelled) — RELEASED (stock returned to pool)
  { allocation_id: 316, booking_item_id: 206, item_id: 1, quantity_allocated: 1, rental_start_date: "2026-10-25", rental_end_date: "2026-10-26", allocation_status: "released", created_at: "2026-10-01T10:00:00Z", item_name: "Traditional Teakwood Carved Mandap Frame" },
];

const SEED_PAYMENTS: Payment[] = [
  { payment_id: 401, booking_id: 101, amount: 30000, payment_type: "advance", payment_method: "upi", status: "success", transaction_ref: "UPI/26089/99812", transaction_date: "2026-10-15T09:35:00Z" },
  { payment_id: 402, booking_id: 101, amount: 24000, payment_type: "balance", payment_method: "netbanking", status: "success", transaction_ref: "NEFT/88219/00192", transaction_date: "2026-11-01T14:20:00Z" },
  { payment_id: 403, booking_id: 104, amount: 31500, payment_type: "full", payment_method: "card", status: "success", transaction_ref: "CARD/SIM-992144", transaction_date: "2026-09-28T16:05:00Z" },
  { payment_id: 404, booking_id: 105, amount: 24000, payment_type: "advance", payment_method: "upi", status: "refunded", transaction_ref: "UPI/REF-112049", transaction_date: "2026-10-01T10:05:00Z" },
];

const SEED_PAYOUTS: VendorPayout[] = [
  {
    payout_id: 501,
    vendor_id: 1,
    booking_item_id: 205,
    gross_amount: 31500,
    commission_amount: 3150,
    net_amount: 28350,
    status: "paid",
    paid_at: "2026-10-24T15:00:00Z",
    booking_id: 104,
    item_name: "Intimate Sangeet & Mehendi Celebration Setup",
    customer_name: "Aarav Sharma",
  },
  {
    payout_id: 502,
    vendor_id: 1,
    booking_item_id: 201,
    gross_amount: 54000,
    commission_amount: 5400,
    net_amount: 48600,
    status: "processing",
    booking_id: 101,
    item_name: "Contemporary Pastel Floral Wedding Package",
    customer_name: "Aarav Sharma",
  },
];

const SEED_REVIEWS: Review[] = [
  {
    review_id: 601,
    customer_id: 1,
    vendor_id: 1,
    booking_item_id: 205,
    rating: 5,
    comment: "The marigold backdrop and lighting completely transformed our sangeet hall. Ravi Prakash and team delivered on time and handled setup seamlessly. Highly recommended!",
    vendor_response: "Thank you Aarav ji! It was our pleasure to be part of your auspicious celebrations.",
    created_at: "2026-10-23T16:00:00Z",
    customer_name: "Aarav Sharma",
    item_name: "Intimate Sangeet & Mehendi Celebration Setup",
    vendor_name: "Prakash Mandap & Event Decors",
  },
];

const SEED_DISPUTES: Dispute[] = [
  {
    dispute_id: 701,
    booking_item_id: 206,
    raised_by: "customer",
    issue_type: "other",
    description: "Event venue changed on short notice. Requested full refund under the 30-day cancellation policy.",
    status: "resolved",
    resolution_notes: "Cancellation verified more than 20 days in advance. 75% refund policy applied and settled to customer account.",
    resolved_by: 4,
    created_at: "2026-10-02T12:00:00Z",
    resolved_at: "2026-10-03T10:00:00Z",
    booking_id: 105,
    customer_name: "Meera Nair",
    vendor_name: "Prakash Mandap & Event Decors",
    item_name: "Traditional Teakwood Carved Mandap Frame",
  },
];

const SEED_WAITLIST: Waitlist[] = [
  {
    waitlist_id: 801,
    customer_id: 2,
    item_id: 1,
    requested_start_date: "2026-11-14",
    requested_end_date: "2026-11-16",
    status: "waiting",
    created_at: "2026-10-20T10:00:00Z",
    customer_name: "Meera Nair",
    customer_phone: "+91 97410 44332",
    item_name: "Traditional Teakwood Carved Mandap Frame",
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    notification_id: 901,
    user_id: 2, // Vendor Ravi Prakash
    message: "New booking request #PS-102 received from Meera Nair for 04 Nov 2026.",
    type: "booking_update",
    is_read: false,
    created_at: "2026-10-24T14:15:00Z",
    link: "/bookings",
  },
  {
    notification_id: 902,
    user_id: 1, // Customer Aarav Sharma
    message: "Booking #PS-101 has been confirmed by Prakash Mandap Decors. Advance payment received.",
    type: "payment",
    is_read: false,
    created_at: "2026-10-15T09:35:00Z",
    link: "/customer/bookings",
  },
  {
    notification_id: 903,
    user_id: 2, // Vendor Ravi
    message: "Inventory Alert: Warm LED Fairy Lights has high demand for early November.",
    type: "waitlist",
    is_read: true,
    created_at: "2026-10-25T08:00:00Z",
    link: "/inventory",
  },
];

// ============================================================================
// In-Memory Reactive Store Implementation
// ============================================================================

class MockStore {
  private users: User[] = [...SEED_USERS];
  private customers: Customer[] = [...SEED_CUSTOMERS];
  private vendors: Vendor[] = [...SEED_VENDORS];
  private addresses: CustomerAddress[] = [...SEED_ADDRESSES];
  private categories: Category[] = [...SEED_CATEGORIES];
  private items: Item[] = [...SEED_ITEMS];
  private blackouts: ItemBlackoutDate[] = [...SEED_BLACKOUTS];
  private packages: Package[] = [...SEED_PACKAGES];
  private packageComponents: PackageItemComponent[] = [...SEED_PACKAGE_COMPONENTS];
  private policies: CancellationPolicy[] = [...SEED_POLICIES];
  private coupons: Coupon[] = [...SEED_COUPONS];
  private bookings: Booking[] = [...SEED_BOOKINGS];
  private bookingItems: BookingItem[] = [...SEED_BOOKING_ITEMS];
  private allocations: BookingItemAllocation[] = [...SEED_ALLOCATIONS];
  private payments: Payment[] = [...SEED_PAYMENTS];
  private payouts: VendorPayout[] = [...SEED_PAYOUTS];
  private reviews: Review[] = [...SEED_REVIEWS];
  private disputes: Dispute[] = [...SEED_DISPUTES];
  private waitlist: Waitlist[] = [...SEED_WAITLIST];
  private notifications: Notification[] = [...SEED_NOTIFICATIONS];
  private cancellations: Cancellation[] = [];
  private statusHistory: BookingStatusHistory[] = [];

  // Active Role State (defaults to vendor for management overview)
  private activeUserId: number = 2; // Default to Vendor Ravi Prakash


  constructor() {
    this.hydrateFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  private hydrateFromStorage() {
    if (!this.isBrowser()) return;
    try {
      const stored = localStorage.getItem("rental_ledger_mock_state_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.activeUserId) this.activeUserId = parsed.activeUserId;
        if (parsed.items) this.items = parsed.items;
        if (parsed.packages) this.packages = parsed.packages;
        if (parsed.packageComponents) this.packageComponents = parsed.packageComponents;
        if (parsed.blackouts) this.blackouts = parsed.blackouts;
        if (parsed.bookings) this.bookings = parsed.bookings;
        if (parsed.bookingItems) this.bookingItems = parsed.bookingItems;
        if (parsed.allocations) this.allocations = parsed.allocations;
        if (parsed.payments) this.payments = parsed.payments;
        if (parsed.payouts) this.payouts = parsed.payouts;
        if (parsed.reviews) this.reviews = parsed.reviews;
        if (parsed.disputes) this.disputes = parsed.disputes;
        if (parsed.waitlist) this.waitlist = parsed.waitlist;
        if (parsed.notifications) this.notifications = parsed.notifications;
      }
    } catch (e) {
      console.warn("Failed to hydrate mock state from localStorage:", e);
    }
  }

  private persist() {
    if (!this.isBrowser()) return;
    try {
      const state = {
        activeUserId: this.activeUserId,
        items: this.items,
        packages: this.packages,
        packageComponents: this.packageComponents,
        blackouts: this.blackouts,
        bookings: this.bookings,
        bookingItems: this.bookingItems,
        allocations: this.allocations,
        payments: this.payments,
        payouts: this.payouts,
        reviews: this.reviews,
        disputes: this.disputes,
        waitlist: this.waitlist,
        notifications: this.notifications,
      };
      localStorage.setItem("rental_ledger_mock_state_v1", JSON.stringify(state));
    } catch (e) {
      console.warn("Failed to persist mock state to localStorage:", e);
    }
  }

  public resetToDefault() {
    this.users = [...SEED_USERS];
    this.customers = [...SEED_CUSTOMERS];
    this.vendors = [...SEED_VENDORS];
    this.addresses = [...SEED_ADDRESSES];
    this.categories = [...SEED_CATEGORIES];
    this.items = [...SEED_ITEMS];
    this.blackouts = [...SEED_BLACKOUTS];
    this.packages = [...SEED_PACKAGES];
    this.packageComponents = [...SEED_PACKAGE_COMPONENTS];
    this.policies = [...SEED_POLICIES];
    this.coupons = [...SEED_COUPONS];
    this.bookings = [...SEED_BOOKINGS];
    this.bookingItems = [...SEED_BOOKING_ITEMS];
    this.allocations = [...SEED_ALLOCATIONS];
    this.payments = [...SEED_PAYMENTS];
    this.payouts = [...SEED_PAYOUTS];
    this.reviews = [...SEED_REVIEWS];
    this.disputes = [...SEED_DISPUTES];
    this.waitlist = [...SEED_WAITLIST];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.activeUserId = 2;
    if (this.isBrowser()) {
      localStorage.removeItem("rental_ledger_mock_state_v1");
    }
  }

  // ==========================================================================
  // Session & Role Management
  // ==========================================================================

  public getActiveUser(): User {
    const user = this.users.find((u) => u.user_id === this.activeUserId);
    return user || this.users[1]; // Fallback to Ravi Prakash
  }

  public setActiveUser(userId: number): User {
    const user = this.users.find((u) => u.user_id === userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    this.activeUserId = user.user_id;
    this.persist();
    return user;
  }

  public getCustomerForUser(userId: number): Customer | undefined {
    return this.customers.find((c) => c.user_id === userId);
  }

  public getVendorForUser(userId: number): Vendor | undefined {
    return this.vendors.find((v) => v.user_id === userId);
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getAllVendors(): Vendor[] {
    return this.vendors.map((v) => {
      const user = this.users.find((u) => u.user_id === v.user_id);
      return { ...v, user };
    });
  }

  public getCustomers(vendorId?: number): Array<Customer & {
    user?: User;
    total_bookings: number;
    total_spend: number;
    last_event_date?: string;
    addresses: CustomerAddress[];
  }> {
    let customerIds: number[];

    if (vendorId) {
      const vendorBookingIds = new Set(
        this.bookingItems.filter((bi) => bi.vendor_id === vendorId).map((bi) => bi.booking_id)
      );
      const vendorBookings = this.bookings.filter((b) => vendorBookingIds.has(b.booking_id));
      customerIds = Array.from(new Set(vendorBookings.map((b) => b.customer_id)));
    } else {
      customerIds = this.customers.map((c) => c.customer_id);
    }

    return customerIds.map((cId) => {
      const cust = this.customers.find((c) => c.customer_id === cId)!;
      const user = this.users.find((u) => u.user_id === cust.user_id);
      let customerBookings = this.bookings.filter((b) => b.customer_id === cId);
      if (vendorId) {
        const vendorBookingIds = new Set(
          this.bookingItems.filter((bi) => bi.vendor_id === vendorId).map((bi) => bi.booking_id)
        );
        customerBookings = customerBookings.filter((b) => vendorBookingIds.has(b.booking_id));
      }
      const totalSpend = customerBookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + b.total_amount, 0);

      const sortedDates = [...customerBookings]
        .map((b) => b.event_start_date)
        .sort((a, b) => b.localeCompare(a));

      const addresses = this.addresses.filter((a) => a.customer_id === cId);

      return {
        ...cust,
        user,
        total_bookings: customerBookings.length,
        total_spend: totalSpend,
        last_event_date: sortedDates[0],
        addresses,
      };
    });
  }

  public getCustomerAddresses(customerId: number): CustomerAddress[] {
    return this.addresses.filter((a) => a.customer_id === customerId);
  }

  public addCustomerAddress(address: Omit<CustomerAddress, "address_id">): CustomerAddress {
    const newAddressId = Math.max(10, ...this.addresses.map((a) => a.address_id)) + 1;
    if (address.is_default) {
      // Unset previous defaults
      for (const a of this.addresses) {
        if (a.customer_id === address.customer_id) a.is_default = false;
      }
    }
    const fullAddress: CustomerAddress = {
      ...address,
      address_id: newAddressId,
    };
    this.addresses.push(fullAddress);
    this.persist();
    return fullAddress;
  }

  // ==========================================================================
  // Catalog & Inventory Reads & Availability
  // ==========================================================================

  public getCategories(): Category[] {
    return this.categories.map((c) => {
      const count = this.items.filter((i) => i.category_id === c.category_id && i.is_active).length;
      return { ...c, item_count: count };
    });
  }

  public getItems(filters?: {
    vendorId?: number;
    categoryId?: number;
    searchQuery?: string;
    isActiveOnly?: boolean;
  }): Item[] {
    let result = [...this.items];
    if (filters?.isActiveOnly !== false) {
      result = result.filter((i) => i.is_active);
    }
    if (filters?.vendorId) {
      result = result.filter((i) => i.vendor_id === filters.vendorId);
    }
    if (filters?.categoryId) {
      result = result.filter((i) => i.category_id === filters.categoryId);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return result;
  }

  public getItemById(itemId: number): Item | undefined {
    const item = this.items.find((i) => i.item_id === itemId);
    if (!item) return undefined;
    const vendor = this.vendors.find((v) => v.vendor_id === item.vendor_id);
    const category = this.categories.find((c) => c.category_id === item.category_id);
    return {
      ...item,
      vendor_name: vendor?.business_name,
      vendor_city: vendor?.city,
      category_name: category?.name,
    };
  }

  public getItemBlackouts(itemId: number): ItemBlackoutDate[] {
    return this.blackouts.filter((b) => b.item_id === itemId);
  }

  public addBlackoutDate(blackout: Omit<ItemBlackoutDate, "blackout_id">): ItemBlackoutDate {
    if (blackout.end_date < blackout.start_date) {
      throw new Error("End date must be on or after start date");
    }
    const newBlackout: ItemBlackoutDate = {
      ...blackout,
      blackout_id: Math.max(0, ...this.blackouts.map((b) => b.blackout_id)) + 1,
    };
    this.blackouts.push(newBlackout);
    this.persist();
    return newBlackout;
  }

  public removeBlackoutDate(blackoutId: number) {
    this.blackouts = this.blackouts.filter((b) => b.blackout_id !== blackoutId);
    this.persist();
  }

  /**
   * Evaluates date-range stock availability matching PostgreSQL function:
   * available_stock_for_item(p_item_id, p_start_date, p_end_date)
   * Intervals are inclusive calendar days: [start_date, end_date]
   */
  public checkItemAvailability(itemId: number, startDate: string, endDate: string) {
    const item = this.getItemById(itemId);
    if (!item || !item.is_active) {
      return {
        item_id: itemId,
        item_name: item?.name || "Unknown Item",
        total_stock: 0,
        available_stock: 0,
        allocated_stock: 0,
        status: "unavailable" as const,
        is_blacked_out: false,
      };
    }

    if (endDate < startDate) {
      throw new Error("End date cannot be prior to start date");
    }

    // Check Blackout Dates: intervals overlap if !(end < start_req || start > end_req)
    const blackoutOverlap = this.blackouts.find(
      (b) => b.item_id === itemId && !(b.end_date < startDate || b.start_date > endDate)
    );

    if (blackoutOverlap) {
      return {
        item_id: itemId,
        item_name: item.name,
        total_stock: item.total_stock,
        available_stock: 0,
        allocated_stock: item.total_stock,
        status: "unavailable" as const,
        is_blacked_out: true,
        blackout_reason: `${blackoutOverlap.reason}: ${blackoutOverlap.notes || "Item maintenance"}`,
      };
    }

    // Calculate sum of active allocations overlapping the requested interval
    const now = new Date().toISOString();
    const activeAllocations = this.allocations.filter((a) => {
      if (a.item_id !== itemId) return false;
      const statusActive =
        a.allocation_status === "reserved" ||
        (a.allocation_status === "held" && (!a.hold_expires_at || a.hold_expires_at > now));
      if (!statusActive) return false;
      // Overlap condition for inclusive dates
      const overlaps = !(a.rental_end_date < startDate || a.rental_start_date > endDate);
      return overlaps;
    });

    const allocated = activeAllocations.reduce((sum, a) => sum + a.quantity_allocated, 0);
    const available = Math.max(0, item.total_stock - allocated);
    const status = available === 0 ? "unavailable" : available <= 5 ? "limited" : "available";

    return {
      item_id: itemId,
      item_name: item.name,
      total_stock: item.total_stock,
      available_stock: available,
      allocated_stock: allocated,
      status,
      is_blacked_out: false,
    };
  }

  // ==========================================================================
  // Package Management & Availability Engine
  // ==========================================================================

  public getPackages(filters?: {
    vendorId?: number;
    searchQuery?: string;
    isActiveOnly?: boolean;
  }): Package[] {
    let result = [...this.packages];
    if (filters?.isActiveOnly !== false) {
      result = result.filter((p) => p.is_active);
    }
    if (filters?.vendorId) {
      result = result.filter((p) => p.vendor_id === filters.vendorId);
    }
    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.theme_tags.toLowerCase().includes(q)
      );
    }
    return result.map((p) => this.attachPackageComponents(p));
  }

  public getPackageById(packageId: number): Package | undefined {
    const pkg = this.packages.find((p) => p.package_id === packageId);
    if (!pkg) return undefined;
    return this.attachPackageComponents(pkg);
  }

  private attachPackageComponents(pkg: Package): Package {
    const components = this.packageComponents
      .filter((pc) => pc.package_id === pkg.package_id)
      .map((pc) => ({
        ...pc,
        item: this.getItemById(pc.item_id),
      }));
    const vendor = this.vendors.find((v) => v.vendor_id === pkg.vendor_id);
    return {
      ...pkg,
      components,
      vendor_name: vendor?.business_name,
      vendor_city: vendor?.city,
    };
  }

  /**
   * Package Availability Check:
   * Expands package into component requirements, checks shared item stock for each,
   * and calculates the maximum concurrent bookable package capacity.
   */
  public checkPackageAvailability(
    packageId: number,
    startDate: string,
    endDate: string,
    requestedPackages: number = 1
  ): PackageAvailability {
    const pkg = this.getPackageById(packageId);
    if (!pkg || !pkg.is_active) {
      return {
        package_id: packageId,
        package_name: pkg?.name || "Unknown Package",
        available_packages: 0,
        requested_packages: requestedPackages,
        is_fully_available: false,
        status: "unavailable",
        components: [],
        bottleneck_item_name: "Package is inactive or does not exist",
      };
    }

    const components = pkg.components || [];
    if (components.length === 0) {
      return {
        package_id: packageId,
        package_name: pkg.name,
        available_packages: 0,
        requested_packages: requestedPackages,
        is_fully_available: false,
        status: "unavailable",
        components: [],
        bottleneck_item_name: "No components configured for package",
      };
    }

    let minPackageCapacity = Infinity;
    let bottleneckName = "";
    const componentChecks: ComponentStockCheck[] = [];

    for (const comp of components) {
      const itemAvail = this.checkItemAvailability(comp.item_id, startDate, endDate);
      const totalRequired = comp.quantity * requestedPackages;
      const capacityForThisItem = Math.floor(itemAvail.available_stock / comp.quantity);

      if (capacityForThisItem < minPackageCapacity) {
        minPackageCapacity = capacityForThisItem;
        bottleneckName = comp.item?.name || `Item #${comp.item_id}`;
      }

      componentChecks.push({
        item_id: comp.item_id,
        item_name: comp.item?.name || `Item #${comp.item_id}`,
        required_per_package: comp.quantity,
        total_required: totalRequired,
        available_stock: itemAvail.available_stock,
        is_bottleneck: capacityForThisItem <= minPackageCapacity,
        is_blacked_out: itemAvail.is_blacked_out,
      });
    }

    const availablePackages = Math.max(0, minPackageCapacity === Infinity ? 0 : minPackageCapacity);
    const isFullyAvailable = availablePackages >= requestedPackages;
    const status = availablePackages === 0 ? "unavailable" : availablePackages < 3 ? "limited" : "available";

    return {
      package_id: packageId,
      package_name: pkg.name,
      available_packages: availablePackages,
      requested_packages: requestedPackages,
      is_fully_available: isFullyAvailable,
      status,
      components: componentChecks,
      bottleneck_item_name: isFullyAvailable ? undefined : bottleneckName,
    };
  }

  // ==========================================================================
  // Semantic Vector Search for Packages
  // Simulates cosine similarity retrieval with relational post-filtering
  // ==========================================================================

  public searchPackagesSemantically(
    queryText: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      minPrice?: number;
      maxPrice?: number;
      vendorId?: number;
    }
  ): SemanticSearchResult[] {
    const activePackages = this.getPackages({
      vendorId: filters?.vendorId,
      isActiveOnly: true,
    });

    if (!queryText.trim()) {
      // Default to returning active packages sorted by price/popularity
      return activePackages.map((pkg) => {
        const avail =
          filters?.startDate && filters?.endDate
            ? this.checkPackageAvailability(pkg.package_id, filters.startDate, filters.endDate, 1)
            : this.checkPackageAvailability(pkg.package_id, "2026-11-01", "2026-11-02", 1);
        return {
          package: pkg,
          similarity_score: 1.0,
          matched_terms: ["Catalog All"],
          availability: avail,
        };
      });
    }

    const queryTokens = queryText
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const scored: SemanticSearchResult[] = [];

    for (const pkg of activePackages) {
      // Budget filters
      if (filters?.minPrice && pkg.combo_price < filters.minPrice) continue;
      if (filters?.maxPrice && pkg.combo_price > filters.maxPrice) continue;

      const sourceText = `${pkg.name} ${pkg.description} ${pkg.theme_tags}`.toLowerCase();
      const matchedTerms: string[] = [];
      let matchScore = 0;

      for (const token of queryTokens) {
        if (sourceText.includes(token)) {
          matchedTerms.push(token);
          // Higher weight for theme tag & title matches
          if (pkg.theme_tags.toLowerCase().includes(token)) matchScore += 0.35;
          else if (pkg.name.toLowerCase().includes(token)) matchScore += 0.25;
          else matchScore += 0.15;
        }
      }

      // Add baseline cosine similarity simulation
      const baseCosine = matchedTerms.length / Math.max(1, queryTokens.length);
      const finalScore = Math.min(1.0, Math.round((baseCosine * 0.7 + matchScore * 0.3 + 0.15) * 100) / 100);

      if (matchedTerms.length > 0 || finalScore > 0.3) {
        // Authoritative relational availability check for the candidate!
        const avail =
          filters?.startDate && filters?.endDate
            ? this.checkPackageAvailability(pkg.package_id, filters.startDate, filters.endDate, 1)
            : this.checkPackageAvailability(pkg.package_id, "2026-11-01", "2026-11-02", 1);

        scored.push({
          package: pkg,
          similarity_score: finalScore,
          matched_terms: matchedTerms,
          availability: avail,
        });
      }
    }

    // Sort descending by semantic similarity score
    scored.sort((a, b) => b.similarity_score - a.similarity_score);
    return scored;
  }

  // ==========================================================================
  // Booking Creation & Atomic Allocation Transaction Engine
  // ==========================================================================

  public createBooking(params: {
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
  }): { booking: Booking; allocations: BookingItemAllocation[] } {
    if (params.endDate < params.startDate) {
      throw new Error("Event end date must be on or after start date");
    }
    if (!params.lines || params.lines.length === 0) {
      throw new Error("Booking must contain at least one item or package line");
    }

    // 1. Transaction Pre-validation: Verify each line has exactly one of item_id OR package_id
    for (const line of params.lines) {
      if ((!line.itemId && !line.packageId) || (line.itemId && line.packageId)) {
        throw new Error("A booking line must specify exactly one of item_id or package_id");
      }
      if (line.quantity <= 0) {
        throw new Error("Booking quantity must be positive");
      }
    }

    // 2. Expand all lines to required physical items and quantities
    const itemDemand = new Map<number, number>();

    for (const line of params.lines) {
      if (line.itemId) {
        const cur = itemDemand.get(line.itemId) || 0;
        itemDemand.set(line.itemId, cur + line.quantity);
      } else if (line.packageId) {
        const pkg = this.getPackageById(line.packageId);
        if (!pkg) throw new Error(`Package #${line.packageId} not found`);
        if (!pkg.is_active) throw new Error(`Package "${pkg.name}" is currently inactive`);
        for (const comp of pkg.components || []) {
          const cur = itemDemand.get(comp.item_id) || 0;
          itemDemand.set(comp.item_id, cur + comp.quantity * line.quantity);
        }
      }
    }

    // 3. Atomically check availability for all required items across the requested interval
    // Simulates SELECT ... FOR UPDATE sorted by item_id to prevent deadlocks and race conditions
    const sortedItemIds = Array.from(itemDemand.keys()).sort((a, b) => a - b);
    for (const itemId of sortedItemIds) {
      const required = itemDemand.get(itemId)!;
      const avail = this.checkItemAvailability(itemId, params.startDate, params.endDate);
      if (avail.is_blacked_out) {
        throw new Error(
          `Inventory conflict: "${avail.item_name}" has a scheduled blackout period (${avail.blackout_reason}) during requested dates.`
        );
      }
      if (avail.available_stock < required) {
        throw new Error(
          `Inventory conflict: "${avail.item_name}" requires ${required} units, but only ${avail.available_stock} are available for ${params.startDate} to ${params.endDate}.`
        );
      }
    }

    // 4. Calculate pricing & discounts
    let subtotal = 0;
    const preparedBookingItems: Omit<BookingItem, "booking_item_id" | "booking_id">[] = [];

    for (const line of params.lines) {
      if (line.itemId) {
        const item = this.getItemById(line.itemId)!;
        const lineTotal = item.price_per_day * line.quantity;
        subtotal += lineTotal;
        preparedBookingItems.push({
          vendor_id: item.vendor_id,
          item_id: item.item_id,
          package_id: null,
          quantity: line.quantity,
          price_at_booking: item.price_per_day,
          deposit_at_booking: item.security_deposit,
          fulfillment_type: line.fulfillmentType || "delivery",
          sub_status: "confirmed",
          created_at: new Date().toISOString(),
          item_name: item.name,
          vendor_name: item.vendor_name,
          primary_image: item.primary_image,
        });
      } else if (line.packageId) {
        const pkg = this.getPackageById(line.packageId)!;
        const lineTotal = pkg.combo_price * line.quantity;
        subtotal += lineTotal;
        preparedBookingItems.push({
          vendor_id: pkg.vendor_id,
          package_id: pkg.package_id,
          item_id: null,
          quantity: line.quantity,
          price_at_booking: pkg.combo_price,
          deposit_at_booking: 5000,
          fulfillment_type: line.fulfillmentType || "vendor_setup",
          sub_status: "confirmed",
          created_at: new Date().toISOString(),
          package_name: pkg.name,
          vendor_name: pkg.vendor_name,
          primary_image: pkg.primary_image,
        });
      }
    }

    let couponDiscount = 0;
    let appliedCoupon: Coupon | undefined;
    if (params.couponCode) {
      const coupon = this.coupons.find(
        (c) => c.code.toUpperCase() === params.couponCode!.toUpperCase()
      );
      if (coupon) {
        if (coupon.discount_type === "percentage") {
          couponDiscount = (subtotal * coupon.discount_value) / 100;
        } else {
          couponDiscount = coupon.discount_value;
        }
        appliedCoupon = coupon;
        coupon.times_used += 1;
      }
    }

    const finalAmount = Math.max(0, subtotal - couponDiscount);
    const newBookingId = Math.max(100, ...this.bookings.map((b) => b.booking_id)) + 1;
    const customer = this.customers.find((c) => c.customer_id === params.customerId);
    const user = customer ? this.users.find((u) => u.user_id === customer.user_id) : undefined;
    const address = params.deliveryAddressId
      ? this.addresses.find((a) => a.address_id === params.deliveryAddressId)
      : undefined;

    const newBooking: Booking = {
      booking_id: newBookingId,
      customer_id: params.customerId,
      delivery_address_id: params.deliveryAddressId || null,
      event_type: params.eventType,
      event_start_date: params.startDate,
      event_end_date: params.endDate,
      status: "confirmed",
      total_amount: finalAmount,
      coupon_id: appliedCoupon?.coupon_id || null,
      created_at: new Date().toISOString(),
      customer_name: user?.name,
      customer_email: user?.email,
      customer_phone: user?.phone,
      delivery_address: address,
      applied_coupon: appliedCoupon,
    };

    // 5. Commit Booking Items and Allocations
    let nextItemId = Math.max(200, ...this.bookingItems.map((bi) => bi.booking_item_id)) + 1;
    let nextAllocId = Math.max(300, ...this.allocations.map((a) => a.allocation_id)) + 1;
    const committedItems: BookingItem[] = [];
    const committedAllocations: BookingItemAllocation[] = [];

    for (const prepItem of preparedBookingItems) {
      const bookingItemId = nextItemId++;
      const fullBookingItem: BookingItem = {
        ...prepItem,
        booking_item_id: bookingItemId,
        booking_id: newBookingId,
      };
      committedItems.push(fullBookingItem);
      this.bookingItems.push(fullBookingItem);

      // Create allocations
      if (prepItem.item_id) {
        const item = this.getItemById(prepItem.item_id)!;
        const alloc: BookingItemAllocation = {
          allocation_id: nextAllocId++,
          booking_item_id: bookingItemId,
          item_id: prepItem.item_id,
          quantity_allocated: prepItem.quantity,
          rental_start_date: params.startDate,
          rental_end_date: params.endDate,
          allocation_status: "reserved",
          created_at: new Date().toISOString(),
          item_name: item.name,
        };
        committedAllocations.push(alloc);
        this.allocations.push(alloc);
      } else if (prepItem.package_id) {
        const pkg = this.getPackageById(prepItem.package_id)!;
        for (const comp of pkg.components || []) {
          const item = this.getItemById(comp.item_id)!;
          const alloc: BookingItemAllocation = {
            allocation_id: nextAllocId++,
            booking_item_id: bookingItemId,
            item_id: comp.item_id,
            quantity_allocated: comp.quantity * prepItem.quantity,
            rental_start_date: params.startDate,
            rental_end_date: params.endDate,
            allocation_status: "reserved",
            created_at: new Date().toISOString(),
            item_name: item.name,
          };
          committedAllocations.push(alloc);
          this.allocations.push(alloc);
        }
      }
    }

    newBooking.items = committedItems;
    newBooking.allocations = committedAllocations;
    this.bookings.unshift(newBooking);

    // Create advance payment record simulation
    const newPaymentId = Math.max(400, ...this.payments.map((p) => p.payment_id)) + 1;
    const advanceAmount = Math.round(finalAmount * 0.5);
    const newPayment: Payment = {
      payment_id: newPaymentId,
      booking_id: newBookingId,
      amount: advanceAmount,
      payment_type: "advance",
      payment_method: "upi",
      status: "success",
      transaction_ref: `UPI/SIM-${newBookingId}-${Date.now().toString().slice(-4)}`,
      transaction_date: new Date().toISOString(),
    };
    this.payments.unshift(newPayment);

    // Notify vendor
    const vendorIds = Array.from(new Set(committedItems.map((ci) => ci.vendor_id)));
    for (const vId of vendorIds) {
      const vendor = this.vendors.find((v) => v.vendor_id === vId);
      if (vendor) {
        this.notifications.unshift({
          notification_id: Math.max(900, ...this.notifications.map((n) => n.notification_id)) + 1,
          user_id: vendor.user_id,
          message: `New confirmed booking #PS-${newBookingId} received from ${user?.name || "Customer"}.`,
          type: "booking_update",
          is_read: false,
          created_at: new Date().toISOString(),
          link: `/bookings`,
        });
      }
    }

    this.persist();
    return { booking: newBooking, allocations: committedAllocations };
  }

  // ==========================================================================
  // Booking Lifecycle Actions (Accept, Reject, Return, Cancel)
  // ==========================================================================

  public getBookings(filters?: {
    customerId?: number;
    vendorId?: number;
    status?: BookingStatus;
  }): Booking[] {
    let result = [...this.bookings];
    if (filters?.customerId) {
      result = result.filter((b) => b.customer_id === filters.customerId);
    }
    if (filters?.vendorId) {
      // Filter bookings that contain items belonging to this vendor
      const vendorBookingIds = new Set(
        this.bookingItems.filter((bi) => bi.vendor_id === filters.vendorId).map((bi) => bi.booking_id)
      );
      result = result.filter((b) => vendorBookingIds.has(b.booking_id));
    }
    if (filters?.status) {
      result = result.filter((b) => b.status === filters.status);
    }
    return result.map((b) => this.hydrateBookingDetails(b));
  }

  public getBookingById(bookingId: number): Booking | undefined {
    const booking = this.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) return undefined;
    return this.hydrateBookingDetails(booking);
  }

  private hydrateBookingDetails(booking: Booking): Booking {
    const items = this.bookingItems.filter((bi) => bi.booking_id === booking.booking_id);
    const itemIds = new Set(items.map((i) => i.booking_item_id));
    const allocations = this.allocations.filter((a) => itemIds.has(a.booking_item_id));
    const payments = this.payments.filter((p) => p.booking_id === booking.booking_id);
    const customer = this.customers.find((c) => c.customer_id === booking.customer_id);
    const user = customer ? this.users.find((u) => u.user_id === customer.user_id) : undefined;
    const address = booking.delivery_address_id
      ? this.addresses.find((a) => a.address_id === booking.delivery_address_id)
      : undefined;

    return {
      ...booking,
      items,
      allocations,
      payments,
      customer_name: user?.name,
      customer_email: user?.email,
      customer_phone: user?.phone,
      delivery_address: address,
    };
  }

  public acceptBooking(bookingId: number) {
    const booking = this.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) throw new Error("Booking not found");
    booking.status = "confirmed";
    const items = this.bookingItems.filter((bi) => bi.booking_id === bookingId);
    for (const item of items) {
      item.sub_status = "confirmed";
      const allocs = this.allocations.filter((a) => a.booking_item_id === item.booking_item_id);
      for (const a of allocs) {
        a.allocation_status = "reserved";
        a.hold_expires_at = null;
      }
    }
    this.persist();
    return this.getBookingById(bookingId);
  }

  public rejectBooking(bookingId: number, reason?: string) {
    const booking = this.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) throw new Error("Booking not found");
    const oldStatus = booking.status;
    booking.status = "cancelled";
    this.statusHistory.unshift({
      history_id: this.statusHistory.length + 1,
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: "cancelled",
      reason: reason || "Vendor rejected booking request",
      changed_at: new Date().toISOString(),
    });

    const items = this.bookingItems.filter((bi) => bi.booking_id === bookingId);
    for (const item of items) {
      item.sub_status = "rejected";
      const allocs = this.allocations.filter((a) => a.booking_item_id === item.booking_item_id);
      for (const a of allocs) {
        a.allocation_status = "released"; // Released so inventory is freed immediately
      }
    }
    this.persist();
    return this.getBookingById(bookingId);
  }

  public markBookingReturned(bookingId: number) {
    const booking = this.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) throw new Error("Booking not found");
    booking.status = "completed";
    const items = this.bookingItems.filter((bi) => bi.booking_id === bookingId);
    const returnTimestamp = new Date().toISOString();

    for (const item of items) {
      item.sub_status = "returned";
      const allocs = this.allocations.filter((a) => a.booking_item_id === item.booking_item_id);
      for (const a of allocs) {
        a.allocation_status = "returned";
        a.returned_at = returnTimestamp;
      }

      // Generate vendor settlement / payout record if not already created
      const existingPayout = this.payouts.find((p) => p.booking_item_id === item.booking_item_id);
      if (!existingPayout) {
        const vendor = this.vendors.find((v) => v.vendor_id === item.vendor_id);
        const commissionRate = vendor?.commission_rate || 0.10;
        const gross = item.price_at_booking * item.quantity;
        const commission = Math.round(gross * commissionRate);
        const net = gross - commission;
        this.payouts.unshift({
          payout_id: Math.max(500, ...this.payouts.map((p) => p.payout_id)) + 1,
          vendor_id: item.vendor_id,
          booking_item_id: item.booking_item_id,
          gross_amount: gross,
          commission_amount: commission,
          net_amount: net,
          status: "pending",
          booking_id: bookingId,
          item_name: item.item_name || item.package_name,
          customer_name: booking.customer_name,
        });
      }
    }

    this.persist();
    return this.getBookingById(bookingId);
  }

  /**
   * Cancellation Flow:
   * Evaluates days before event against policy table, computes refund and penalty,
   * transitions allocations to 'released' (freeing stock!), and records cancellation.
   */
  public cancelBooking(
    bookingId: number,
    cancelledBy: "customer" | "vendor" | "admin",
    reason: string
  ): { booking: Booking; refundAmount: number; penaltyAmount: number } {
    const booking = this.bookings.find((b) => b.booking_id === bookingId);
    if (!booking) throw new Error("Booking not found");
    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    const today = new Date();
    const eventDate = new Date(booking.event_start_date);
    const diffTime = eventDate.getTime() - today.getTime();
    const daysBeforeEvent = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Match policy: sorted descending by days_before_event
    const policy =
      this.policies
        .filter((p) => daysBeforeEvent >= p.days_before_event)
        .sort((a, b) => b.days_before_event - a.days_before_event)[0] || this.policies[this.policies.length - 1];

    const refundPercentage = policy ? policy.refund_percentage : 0;
    const totalPaid = this.payments
      .filter((p) => p.booking_id === bookingId && p.status === "success")
      .reduce((sum, p) => sum + p.amount, 0);

    const refundAmount = Math.round((totalPaid * refundPercentage) / 100);
    const penaltyAmount = totalPaid - refundAmount;

    const oldStatus = booking.status;
    booking.status = "cancelled";

    this.statusHistory.unshift({
      history_id: this.statusHistory.length + 1,
      booking_id: bookingId,
      old_status: oldStatus,
      new_status: "cancelled",
      reason: reason || `Cancelled by ${cancelledBy}`,
      changed_at: new Date().toISOString(),
    });

    // Release all allocations!
    const items = this.bookingItems.filter((bi) => bi.booking_id === bookingId);
    for (const item of items) {
      item.sub_status = "cancelled";
      this.cancellations.unshift({
        cancellation_id: this.cancellations.length + 1,
        booking_item_id: item.booking_item_id,
        cancelled_by: cancelledBy,
        reason: reason,
        policy_id: policy?.policy_id,
        penalty_amount: penaltyAmount,
        refund_amount: refundAmount,
        cancelled_at: new Date().toISOString(),
      });

      const allocs = this.allocations.filter((a) => a.booking_item_id === item.booking_item_id);
      for (const a of allocs) {
        a.allocation_status = "released"; // Released so stock returns to available pool immediately
      }
    }

    // Record refund payment entry if applicable
    if (refundAmount > 0) {
      this.payments.unshift({
        payment_id: Math.max(400, ...this.payments.map((p) => p.payment_id)) + 1,
        booking_id: bookingId,
        amount: refundAmount,
        payment_type: "refund",
        payment_method: "upi",
        status: "refunded",
        transaction_ref: `REFUND/${bookingId}/${Date.now().toString().slice(-4)}`,
        transaction_date: new Date().toISOString(),
      });
    }

    this.persist();
    return {
      booking: this.getBookingById(bookingId)!,
      refundAmount,
      penaltyAmount,
    };
  }


  // ==========================================================================
  // Payments, Reviews, Disputes, Waitlist & Reporting
  // ==========================================================================

  public getPayments(filters?: { bookingId?: number; customerId?: number }): Payment[] {
    let result = [...this.payments];
    if (filters?.bookingId) {
      result = result.filter((p) => p.booking_id === filters.bookingId);
    }
    return result;
  }

  public getPayouts(vendorId?: number): VendorPayout[] {
    if (vendorId) {
      return this.payouts.filter((p) => p.vendor_id === vendorId);
    }
    return [...this.payouts];
  }

  public processPayout(payoutId: number) {
    const payout = this.payouts.find((p) => p.payout_id === payoutId);
    if (!payout) throw new Error("Payout not found");
    payout.status = "paid";
    payout.paid_at = new Date().toISOString();
    this.persist();
    return payout;
  }

  public getReviews(vendorId?: number): Review[] {
    if (vendorId) {
      return this.reviews.filter((r) => r.vendor_id === vendorId);
    }
    return [...this.reviews];
  }

  public addReview(review: Omit<Review, "review_id" | "created_at">): Review {
    const newReview: Review = {
      ...review,
      review_id: Math.max(600, ...this.reviews.map((r) => r.review_id)) + 1,
      created_at: new Date().toISOString(),
    };
    this.reviews.unshift(newReview);
    this.persist();
    return newReview;
  }

  public respondToReview(reviewId: number, response: string): Review {
    const review = this.reviews.find((r) => r.review_id === reviewId);
    if (!review) throw new Error("Review not found");
    review.vendor_response = response;
    this.persist();
    return review;
  }

  public getDisputes(filters?: { vendorId?: number; customerId?: number; status?: string }): Dispute[] {
    let result = [...this.disputes];
    if (filters?.status) {
      result = result.filter((d) => d.status === filters.status);
    }
    return result;
  }

  public resolveDispute(disputeId: number, resolutionNotes: string, action: "resolved" | "rejected") {
    const dispute = this.disputes.find((d) => d.dispute_id === disputeId);
    if (!dispute) throw new Error("Dispute not found");
    dispute.status = action;
    dispute.resolution_notes = resolutionNotes;
    dispute.resolved_at = new Date().toISOString();
    dispute.resolved_by = 4; // Pooja Hegde (Admin)
    this.persist();
    return dispute;
  }

  public addDispute(dispute: Omit<Dispute, "dispute_id" | "created_at" | "status">): Dispute {
    const newDispute: Dispute = {
      ...dispute,
      dispute_id: Math.max(700, ...this.disputes.map((d) => d.dispute_id)) + 1,
      status: "open",
      created_at: new Date().toISOString(),
    };
    this.disputes.unshift(newDispute);
    this.persist();
    return newDispute;
  }

  public getWaitlist(vendorId?: number): Waitlist[] {
    if (vendorId) {
      const vendorItemIds = new Set(this.items.filter((i) => i.vendor_id === vendorId).map((i) => i.item_id));
      return this.waitlist.filter((w) => vendorItemIds.has(w.item_id));
    }
    return [...this.waitlist];
  }

  public addToWaitlist(entry: Omit<Waitlist, "waitlist_id" | "created_at" | "status">): Waitlist {
    const newEntry: Waitlist = {
      ...entry,
      waitlist_id: Math.max(800, ...this.waitlist.map((w) => w.waitlist_id)) + 1,
      status: "waiting",
      created_at: new Date().toISOString(),
    };
    this.waitlist.unshift(newEntry);
    this.persist();
    return newEntry;
  }

  public notifyWaitlistCustomer(waitlistId: number) {
    const entry = this.waitlist.find((w) => w.waitlist_id === waitlistId);
    if (!entry) throw new Error("Waitlist entry not found");
    entry.status = "notified";
    this.persist();
    return entry;
  }

  public getNotifications(userId: number): Notification[] {
    return this.notifications.filter((n) => n.user_id === userId);
  }

  public markNotificationRead(notificationId: number) {
    const n = this.notifications.find((notif) => notif.notification_id === notificationId);
    if (n) {
      n.is_read = true;
      this.persist();
    }
  }

  // ==========================================================================
  // Vendor Inventory Mutation (Add / Edit Item)
  // ==========================================================================

  public addItem(item: Omit<Item, "item_id" | "created_at">): Item {
    const newItemId = Math.max(10, ...this.items.map((i) => i.item_id)) + 1;
    const category = this.categories.find((c) => c.category_id === item.category_id);
    const vendor = this.vendors.find((v) => v.vendor_id === item.vendor_id);
    const fullItem: Item = {
      ...item,
      item_id: newItemId,
      created_at: new Date().toISOString(),
      category_name: category?.name,
      vendor_name: vendor?.business_name,
      vendor_city: vendor?.city,
    };
    this.items.unshift(fullItem);
    this.persist();
    return fullItem;
  }

  public updateItem(itemId: number, updates: Partial<Item>): Item {
    const itemIndex = this.items.findIndex((i) => i.item_id === itemId);
    if (itemIndex === -1) throw new Error("Item not found");
    this.items[itemIndex] = { ...this.items[itemIndex], ...updates };
    this.persist();
    return this.getItemById(itemId)!;
  }

  // ==========================================================================
  // Package Builder Mutation (Add / Edit Package)
  // ==========================================================================

  public createPackage(params: {
    vendorId: number;
    name: string;
    description: string;
    themeTags: string;
    comboPrice: number;
    components: Array<{ itemId: number; quantity: number }>;
  }): Package {
    if (!params.components || params.components.length === 0) {
      throw new Error("A package must contain at least one item component");
    }

    // Constraint: All component items must belong to the same vendor
    for (const comp of params.components) {
      const item = this.getItemById(comp.itemId);
      if (!item) throw new Error(`Item #${comp.itemId} does not exist`);
      if (item.vendor_id !== params.vendorId) {
        throw new Error(`Item "${item.name}" belongs to another vendor. Same-vendor policy violated.`);
      }
      if (comp.quantity <= 0) {
        throw new Error("Component quantities must be positive numbers");
      }
    }

    const newPackageId = Math.max(10, ...this.packages.map((p) => p.package_id)) + 1;
    const vendor = this.vendors.find((v) => v.vendor_id === params.vendorId);
    const firstItem = this.getItemById(params.components[0].itemId);

    const newPackage: Package = {
      package_id: newPackageId,
      vendor_id: params.vendorId,
      name: params.name,
      description: params.description,
      theme_tags: params.themeTags,
      combo_price: params.comboPrice,
      is_active: true,
      vendor_name: vendor?.business_name,
      vendor_city: vendor?.city,
      primary_image: firstItem?.primary_image || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    };

    this.packages.unshift(newPackage);

    for (const comp of params.components) {
      this.packageComponents.push({
        package_id: newPackageId,
        item_id: comp.itemId,
        quantity: comp.quantity,
      });
    }

    this.persist();
    return this.getPackageById(newPackageId)!;
  }

  public updatePackage(
    packageId: number,
    updates: {
      name?: string;
      description?: string;
      themeTags?: string;
      comboPrice?: number;
      isActive?: boolean;
      components?: Array<{ itemId: number; quantity: number }>;
    }
  ): Package {
    const pkg = this.packages.find((p) => p.package_id === packageId);
    if (!pkg) throw new Error("Package not found");

    if (updates.name !== undefined) pkg.name = updates.name;
    if (updates.description !== undefined) pkg.description = updates.description;
    if (updates.themeTags !== undefined) pkg.theme_tags = updates.themeTags;
    if (updates.comboPrice !== undefined) pkg.combo_price = updates.comboPrice;
    if (updates.isActive !== undefined) pkg.is_active = updates.isActive;

    if (updates.components) {
      if (updates.components.length === 0) {
        throw new Error("A package must contain at least one item component");
      }
      // Check same-vendor policy
      for (const comp of updates.components) {
        const item = this.getItemById(comp.itemId);
        if (!item) throw new Error(`Item #${comp.itemId} does not exist`);
        if (item.vendor_id !== pkg.vendor_id) {
          throw new Error(`Item "${item.name}" belongs to another vendor. Same-vendor policy violated.`);
        }
      }
      // Remove old components for this package
      this.packageComponents = this.packageComponents.filter((pc) => pc.package_id !== packageId);
      // Insert new components
      for (const comp of updates.components) {
        this.packageComponents.push({
          package_id: packageId,
          item_id: comp.itemId,
          quantity: comp.quantity,
        });
      }
    }

    this.persist();
    return this.getPackageById(packageId)!;
  }

  public togglePackageStatus(packageId: number): Package {
    const pkg = this.packages.find((p) => p.package_id === packageId);
    if (!pkg) throw new Error("Package not found");
    pkg.is_active = !pkg.is_active;
    this.persist();
    return this.getPackageById(packageId)!;
  }

  // ==========================================================================
  // Summary Analytics & Reports
  // ==========================================================================

  public getSummaryMetrics(vendorId?: number): SummaryMetric[] {
    const bookings = this.getBookings({ vendorId });
    const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
    const totalRev = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + b.total_amount, 0);

    const items = this.getItems({ vendorId });
    const totalStock = items.reduce((sum, i) => sum + i.total_stock, 0);
    const totalAllocated = items.reduce((sum, i) => {
      const avail = this.checkItemAvailability(i.item_id, "2026-11-01", "2026-11-07");
      return sum + avail.allocated_stock;
    }, 0);
    const utilPct = totalStock > 0 ? Math.min(100, Math.round((totalAllocated / totalStock) * 100)) : 68;

    const pendingRequests = bookings.filter((b) => b.status === "pending").length;

    return [
      {
        label: "Bookings this month",
        value: `${confirmedCount + 120}`,
        delta: "+14.2%",
        direction: "up",
        helper: "vs. last month",
      },
      {
        label: "Rental revenue",
        value: `₹${((totalRev + 420000) / 100000).toFixed(2)}L`,
        delta: "+11.5%",
        direction: "up",
        helper: "recorded GMV",
      },
      {
        label: "Inventory utilisation",
        value: `${utilPct}%`,
        delta: "+5.1%",
        direction: "up",
        helper: "across active stock pools",
      },
      {
        label: "Pending requests",
        value: `${pendingRequests}`,
        delta: pendingRequests > 0 ? `${pendingRequests} need review` : "All clear",
        direction: pendingRequests > 0 ? "flat" : "up",
        helper: "vendor response required",
      },
    ];
  }
}

// Global Singleton Export
export const mockStore = new MockStore();
