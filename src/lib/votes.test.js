import { describe, it, expect } from "vitest";
import { aggregateVotes } from "./votes";

describe("aggregateVotes", () => {
  const rows = [
    { post_id: "p1", user_id: "u1", cluster: "scientific", type: "up" },
    { post_id: "p1", user_id: "u2", cluster: "civil", type: "up" },
    { post_id: "p1", user_id: "u3", cluster: "tech", type: "dispute" },
    { post_id: "p2", user_id: "u1", cluster: "academic", type: "up" },
  ];

  it("buckets up-votes into postVotes by post and cluster", () => {
    const { postVotes } = aggregateVotes(rows, null);
    expect(postVotes.p1).toEqual({ scientific: 1, civil: 1 });
    expect(postVotes.p2).toEqual({ academic: 1 });
  });

  it("buckets disputes into postDisputes by post and cluster", () => {
    const { postDisputes } = aggregateVotes(rows, null);
    expect(postDisputes.p1).toEqual({ tech: 1 });
    expect(postDisputes.p2).toBeUndefined();
  });

  it("counts total up-votes per post", () => {
    const { upCounts } = aggregateVotes(rows, null);
    expect(upCounts.p1).toBe(2);
    expect(upCounts.p2).toBe(1);
  });

  it("reports the given user's own vote per post in userVotes", () => {
    const { userVotes } = aggregateVotes(rows, "u1");
    expect(userVotes.p1).toBe("up");
    expect(userVotes.p2).toBe("up");
  });

  it("omits posts the given user hasn't voted on from userVotes", () => {
    const { userVotes } = aggregateVotes(rows, "u2");
    expect(userVotes.p2).toBeUndefined();
  });
});
