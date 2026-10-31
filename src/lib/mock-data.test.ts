import { describe, expect, it } from "vitest";
import { inventoryPreview, recentBookings, summaryMetrics } from "@/lib/mock-data";

describe("demo fixtures", () => {
  it("contains unique booking identifiers", () => {
    const ids = recentBookings.map((booking) => booking.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never has negative free stock in the dashboard fixture", () => {
    expect(inventoryPreview.every((item) => item.stock >= item.reserved && item.reserved >= 0)).toBe(true);
  });

  it("has the expected overview metric count", () => {
    expect(summaryMetrics).toHaveLength(4);
  });
});
