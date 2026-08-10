import { describe, it, expect } from "vitest";
import { nf, shannonDiversity, calcTrustScore, checkGates, TOKEN_GATES } from "./scoring";

describe("nf", () => {
  it("leaves numbers under 1,000 unformatted", () => {
    expect(nf(999)).toBe("999");
  });

  it("formats thousands with a K suffix", () => {
    expect(nf(1500)).toBe("1.5K");
  });

  it("formats millions with an M suffix", () => {
    expect(nf(2500000)).toBe("2.5M");
  });
});

describe("TOKEN_GATES", () => {
  it("exposes the expected threshold values", () => {
    expect(TOKEN_GATES).toEqual({
      upvotes: 10000,
      validations: 2500,
      diversity: 0.72,
      trustScore: 0.88,
    });
  });
});

describe("shannonDiversity", () => {
  it("returns 0 when there are no votes", () => {
    expect(shannonDiversity({})).toBe(0);
  });

  it("returns close to 1 when votes are spread evenly across all 8 clusters", () => {
    const even = { scientific:10, civil:10, independent:10, tech:10, grassroots:10, academic:10, journalism:10, legal:10 };
    expect(shannonDiversity(even)).toBeCloseTo(1, 5);
  });

  it("returns 0 when all votes come from a single cluster", () => {
    expect(shannonDiversity({ scientific: 500 })).toBe(0);
  });
});

describe("calcTrustScore", () => {
  it("returns 0 when there are no votes or disputes", () => {
    expect(calcTrustScore({}, {})).toBe(0);
  });

  it("scores evenly-spread validations higher than single-cluster validations at the same volume", () => {
    const spread = { scientific:625, civil:625, independent:625, tech:625, grassroots:625, academic:625, journalism:625, legal:625 };
    const concentrated = { scientific: 5000 };
    expect(calcTrustScore(spread, {})).toBeGreaterThan(calcTrustScore(concentrated, {}));
  });

  it("lowers the score as disputes make up a larger share of total votes", () => {
    const votes = { scientific: 100 };
    const noDisputes = calcTrustScore(votes, {});
    const someDisputes = calcTrustScore(votes, { civil: 100 });
    expect(someDisputes).toBeLessThan(noDisputes);
  });
});

describe("checkGates", () => {
  it("reports allMet: false when no gates are satisfied", () => {
    const result = checkGates({ up: 0 }, {}, {});
    expect(result.allMet).toBe(false);
    expect(result.metCount).toBe(0);
  });

  it("reports allMet: true when every gate threshold is reached", () => {
    const post = { up: 20000 };
    const passingVotes = { scientific:400, civil:400, independent:400, tech:400, grassroots:400, academic:400, journalism:400, legal:400 };
    const result = checkGates(post, passingVotes, {});
    expect(result.allMet).toBe(true);
    expect(result.metCount).toBe(4);
  });

  it("reports a partial pass when only some gate thresholds are reached, with correctly shaped items", () => {
    const post = { up: 20000 };
    const votes = { scientific: 100 };
    const result = checkGates(post, votes, {});

    expect(result.metCount).toBe(1);
    expect(result.allMet).toBe(false);

    const byKey = Object.fromEntries(result.items.map(i => [i.key, i]));
    expect(Object.keys(byKey).sort()).toEqual(
      ["diversity", "trustScore", "upvotes", "validations"].sort()
    );

    expect(byKey.upvotes).toMatchObject({ label: "UPVOTES", val: 20000, req: 10000 });
    expect(byKey.validations).toMatchObject({ label: "CROSS-CLUSTER VALIDATIONS", val: 100, req: 2500 });
    expect(byKey.diversity).toMatchObject({ label: "DIVERSITY INDEX", val: 0, req: 0.72 });
    expect(byKey.trustScore).toMatchObject({ label: "TRUST SCORE", val: 0.65, req: 0.88 });

    expect(byKey.upvotes.fmt(byKey.upvotes.val)).toBe("20.0K");
    expect(byKey.validations.fmt(byKey.validations.val)).toBe("100");
    expect(byKey.diversity.fmt(byKey.diversity.val)).toBe("0.0%");
    expect(byKey.trustScore.fmt(byKey.trustScore.val)).toBe("65.0%");
  });
});
