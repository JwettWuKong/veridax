import { describe, it, expect } from "vitest";
import { aggregateMarket } from "./market";

describe("aggregateMarket", () => {
  const tokens = [{ post_id: "p1", created_at: "2026-01-01T00:00:00Z" }];
  const purchases = [
    { post_id: "p1", user_id: "u1", qty: 10 },
    { post_id: "p1", user_id: "u2", qty: 5 },
  ];

  it("reports which posts are tokenized", () => {
    const { tokenizedPostIds } = aggregateMarket(tokens, purchases, null);
    expect(tokenizedPostIds.has("p1")).toBe(true);
    expect(tokenizedPostIds.has("p2")).toBe(false);
  });

  it("sums total quantity purchased per post across all users", () => {
    const { supplyAddByPost } = aggregateMarket(tokens, purchases, null);
    expect(supplyAddByPost.p1).toBe(15);
  });

  it("sums quantity purchased by a specific user per post", () => {
    const { myPurchasesByPost } = aggregateMarket(tokens, purchases, "u1");
    expect(myPurchasesByPost.p1).toBe(10);
  });

  it("omits posts the given user hasn't purchased", () => {
    const { myPurchasesByPost } = aggregateMarket(tokens, [], "u1");
    expect(myPurchasesByPost.p1).toBeUndefined();
  });

  it("returns an empty set when no posts are tokenized", () => {
    const { tokenizedPostIds } = aggregateMarket([], [], null);
    expect(tokenizedPostIds.size).toBe(0);
  });
});
