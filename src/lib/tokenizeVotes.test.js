import { describe, it, expect } from "vitest";
import { aggregateTokenizeVotes } from "./tokenizeVotes";

describe("aggregateTokenizeVotes", () => {
  const rows = [
    { post_id: "p1", user_id: "u1", vote: "yes" },
    { post_id: "p1", user_id: "u2", vote: "yes" },
    { post_id: "p1", user_id: "u3", vote: "no" },
    { post_id: "p2", user_id: "u1", vote: "no" },
  ];

  it("counts yes votes per post", () => {
    const { yesCounts } = aggregateTokenizeVotes(rows, null);
    expect(yesCounts.p1).toBe(2);
    expect(yesCounts.p2).toBeUndefined();
  });

  it("counts no votes per post", () => {
    const { noCounts } = aggregateTokenizeVotes(rows, null);
    expect(noCounts.p1).toBe(1);
    expect(noCounts.p2).toBe(1);
  });

  it("reports the given user's own vote per post", () => {
    const { userVotes } = aggregateTokenizeVotes(rows, "u1");
    expect(userVotes.p1).toBe("yes");
    expect(userVotes.p2).toBe("no");
  });

  it("omits posts the given user hasn't voted on", () => {
    const { userVotes } = aggregateTokenizeVotes(rows, "u2");
    expect(userVotes.p2).toBeUndefined();
  });
});
