import { beforeEach, describe, expect, it } from "vitest";
import { mockStore } from "./mock-store";

describe("Rental Ledger Domain & Allocation Engine", () => {
  beforeEach(() => {
    mockStore.resetToDefault();
  });

  describe("Item Availability & Blackout Dates", () => {
    it("correctly computes available stock considering active reservations", () => {
      // Ivory Chiavari Chairs (Item #3) has total_stock = 350
      // In the seed data:
      // Booking 101 has 100 chairs reserved for 2026-11-02 to 2026-11-04
      // Booking 102 has 120 chairs held for 2026-11-04 to 2026-11-05
      // Booking 103 has 150 chairs reserved for 2026-11-06 to 2026-11-08

      // On 2026-11-03: only Booking 101 overlaps (100 allocated) -> 350 - 100 = 250 available
      const availNov3 = mockStore.checkItemAvailability(3, "2026-11-03", "2026-11-03");
      expect(availNov3.total_stock).toBe(350);
      expect(availNov3.allocated_stock).toBe(100);
      expect(availNov3.available_stock).toBe(250);
      expect(availNov3.is_blacked_out).toBe(false);

      // On 2026-11-04: both Booking 101 (100) and Booking 102 (120) overlap -> 220 allocated -> 130 available
      const availNov4 = mockStore.checkItemAvailability(3, "2026-11-04", "2026-11-04");
      expect(availNov4.allocated_stock).toBe(220);
      expect(availNov4.available_stock).toBe(130);

      // On 2026-11-10: no bookings overlap -> full 350 available
      const availNov10 = mockStore.checkItemAvailability(3, "2026-11-10", "2026-11-12");
      expect(availNov10.allocated_stock).toBe(0);
      expect(availNov10.available_stock).toBe(350);
    });

    it("enforces blackout dates rendering item unavailable with documented reason", () => {
      // Teakwood Mandap (Item #1) has a scheduled maintenance blackout 2026-11-14 to 2026-11-16
      const availBlackout = mockStore.checkItemAvailability(1, "2026-11-15", "2026-11-17");
      expect(availBlackout.is_blacked_out).toBe(true);
      expect(availBlackout.available_stock).toBe(0);
      expect(availBlackout.status).toBe("unavailable");
      expect(availBlackout.blackout_reason).toContain("maintenance");
    });
  });

  describe("Package Composition & Bottleneck Detection", () => {
    it("expands package into components and identifies the bottleneck item", () => {
      // Package #1: Royal Grand Heritage Mandap
      // Contains:
      // Item 1 (Teakwood Mandap): 1 unit (Total stock = 6)
      // Item 4 (Throne Chairs): 1 pair (Total stock = 12)
      // Item 3 (Chiavari Chairs): 150 units (Total stock = 350)
      // Item 6 (Round Tables): 15 units (Total stock = 45)
      // Item 10 (Fairy Lights): 20 sets (Total stock = 80)
      // Item 12 (Brass Samai): 2 pairs (Total stock = 15)

      const avail = mockStore.checkPackageAvailability(1, "2026-11-25", "2026-11-26", 1);
      expect(avail.is_fully_available).toBe(true);
      expect(avail.components.length).toBe(6);

      // Max packages constrained by chairs (350 / 150 = 2 packages) or tables (45 / 15 = 3)
      expect(avail.available_packages).toBe(2);
      expect(avail.components.find((c) => c.item_id === 3)?.is_bottleneck).toBe(true);
    });

    it("marks package as unavailable when any underlying component is blacked out", () => {
      // Item 1 is blacked out on 2026-11-14 to 2026-11-16. Package 1 requires Item 1.
      const avail = mockStore.checkPackageAvailability(1, "2026-11-14", "2026-11-15", 1);
      expect(avail.is_fully_available).toBe(false);
      expect(avail.available_packages).toBe(0);
      const teakwoodComp = avail.components.find((c) => c.item_id === 1);
      expect(teakwoodComp?.is_blacked_out).toBe(true);
    });
  });

  describe("Transaction-Safe Atomic Booking & Stock Contention", () => {
    it("creates allocations for each package component and prevents overbooking", () => {
      // Teakwood Mandap (Item 1) has 6 total stock.
      // Booking 103 already reserves 1 from Nov 6 to Nov 8.
      // So 5 are free.
      // Attempting to book 6 packages that each need 1 unit must fail atomically.
      expect(() => {
        mockStore.createBooking({
          customerId: 1,
          eventType: "wedding",
          startDate: "2026-11-06",
          endDate: "2026-11-08",
          lines: [{ packageId: 1, quantity: 6 }],
        });
      }).toThrow(/Inventory conflict/);

      // Booking 2 packages (needs 2 Mandaps and 300 chairs) succeeds:
      const result = mockStore.createBooking({
        customerId: 1,
        eventType: "wedding",
        startDate: "2026-11-06",
        endDate: "2026-11-08",
        lines: [{ packageId: 1, quantity: 1 }],
      });

      expect(result.booking.status).toBe("confirmed");
      expect(result.allocations.length).toBe(6);
      expect(result.allocations.every((a) => a.allocation_status === "reserved")).toBe(true);

      // Now Item 3 (Chiavari chairs) has 150 (from Booking 103) + 150 (new booking) = 300 allocated.
      // Only 50 chairs remain free for those dates.
      // A direct rental request for 60 chairs must now be rejected!
      expect(() => {
        mockStore.createBooking({
          customerId: 2,
          eventType: "reception",
          startDate: "2026-11-06",
          endDate: "2026-11-08",
          lines: [{ itemId: 3, quantity: 60 }],
        });
      }).toThrow(/requires 60 units, but only 50 are available/);

      // A direct rental request for 40 chairs succeeds:
      const chairBooking = mockStore.createBooking({
        customerId: 2,
        eventType: "reception",
        startDate: "2026-11-06",
        endDate: "2026-11-08",
        lines: [{ itemId: 3, quantity: 40 }],
      });
      expect(chairBooking.booking.status).toBe("confirmed");
    });

    it("rejects booking lines that specify both or neither of itemId and packageId", () => {
      expect(() => {
        mockStore.createBooking({
          customerId: 1,
          eventType: "wedding",
          startDate: "2026-12-01",
          endDate: "2026-12-02",
          lines: [{ itemId: 1, packageId: 1, quantity: 1 }],
        });
      }).toThrow(/must specify exactly one of item_id or package_id/);

      expect(() => {
        mockStore.createBooking({
          customerId: 1,
          eventType: "wedding",
          startDate: "2026-12-01",
          endDate: "2026-12-02",
          lines: [{ quantity: 1 }],
        });
      }).toThrow(/must specify exactly one of item_id or package_id/);
    });
  });

  describe("Cancellation & Inventory Release", () => {
    it("releases stock allocations and applies cancellation policy refunds", () => {
      // Booking 101 has 100 chairs reserved from Nov 2 to Nov 4.
      // On Nov 2 to Nov 3 (before Booking 102 starts on Nov 4), exactly 100 chairs are allocated.
      const initialAvail = mockStore.checkItemAvailability(3, "2026-11-02", "2026-11-03");
      expect(initialAvail.allocated_stock).toBe(100);

      // Cancel Booking 101
      const cancelRes = mockStore.cancelBooking(101, "customer", "Change of plans");
      expect(cancelRes.booking.status).toBe("cancelled");

      // Verify that Booking 101 allocations are now released (freeing all 100 chairs)
      const afterCancelAvail = mockStore.checkItemAvailability(3, "2026-11-02", "2026-11-03");
      expect(afterCancelAvail.allocated_stock).toBe(0);
      expect(afterCancelAvail.available_stock).toBe(350);

    });
  });

  describe("Vendor Same-Vendor Package Policy", () => {
    it("rejects package creation if an item belongs to a different vendor", () => {
      expect(() => {
        // Vendor 1 trying to include Item 13 (which belongs to Vendor 2)
        mockStore.createPackage({
          vendorId: 1,
          name: "Cross Vendor Test Package",
          description: "Illegal test",
          themeTags: "Test",
          comboPrice: 10000,
          components: [
            { itemId: 1, quantity: 1 },
            { itemId: 13, quantity: 1 }, // Vendor 2 item!
          ],
        });
      }).toThrow(/belongs to another vendor/);
    });
  });

  describe("Semantic Vector Search with Relational Validation", () => {
    it("ranks packages by semantic query and attaches live relational availability", () => {
      const results = mockStore.searchPackagesSemantically("royal rajasthani palace chanderlier", {
        startDate: "2026-11-20",
        endDate: "2026-11-22",
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].package.name).toContain("Rajasthani");
      expect(results[0].similarity_score).toBeGreaterThan(0.5);
      expect(results[0].availability.is_fully_available).toBe(true);
    });
  });
});
