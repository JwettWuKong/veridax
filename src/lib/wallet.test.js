import { describe, it, expect } from "vitest";
import { aggregateWallet } from "./wallet";

describe("aggregateWallet", () => {
  it("sums deposits and commission credits as positive, withdrawals and buys as negative", () => {
    const transactions = [
      { type: "deposit", amount: 100 },
      { type: "buy", amount: -30 },
      { type: "commission", amount: 5 },
      { type: "withdraw", amount: -20 },
    ];
    const { balance } = aggregateWallet(transactions);
    expect(balance).toBe(55);
  });

  it("returns a balance of 0 for an empty transaction list", () => {
    const { balance } = aggregateWallet([]);
    expect(balance).toBe(0);
  });

  it("handles a single deposit", () => {
    const { balance } = aggregateWallet([{ type: "deposit", amount: 42.5 }]);
    expect(balance).toBe(42.5);
  });
});
