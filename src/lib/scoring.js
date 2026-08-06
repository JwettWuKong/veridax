export const nf = n => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;

export function shannonDiversity(counts) {
  const vals = Object.values(counts);
  const total = vals.reduce((s, v) => s + v, 0);
  if (total === 0) return 0;
  const H = vals.filter(v => v > 0).reduce((s, v) => { const p = v / total; return s - p * Math.log2(p); }, 0);
  return H / Math.log2(8);
}

export function calcTrustScore(ups, disps) {
  const totalUp = Object.values(ups).reduce((s, v) => s + v, 0);
  const totalDisp = Object.values(disps).reduce((s, v) => s + v, 0);
  const total = totalUp + totalDisp;
  if (total === 0) return 0;
  return 0.65 * (totalUp / total) + 0.35 * shannonDiversity(ups);
}

export const TOKEN_GATES = { upvotes:10000, citations:200, validations:2500, diversity:0.72, trustScore:0.88 };

export function checkGates(post, votes, disputes) {
  const trust      = calcTrustScore(votes, disputes);
  const diversity  = shannonDiversity(votes);
  const validCount = Object.values(votes).reduce((s, v) => s + v, 0);
  const items = [
    { key:"upvotes",     label:"UPVOTES",                    val:post.up,    req:TOKEN_GATES.upvotes,     fmt:v => nf(v) },
    { key:"citations",   label:"PEER CITATIONS",             val:post.cite,  req:TOKEN_GATES.citations,   fmt:v => v.toLocaleString() },
    { key:"validations", label:"CROSS-CLUSTER VALIDATIONS",  val:validCount, req:TOKEN_GATES.validations, fmt:v => nf(v) },
    { key:"diversity",   label:"DIVERSITY INDEX",            val:diversity,  req:TOKEN_GATES.diversity,   fmt:v => `${(v*100).toFixed(1)}%` },
    { key:"trustScore",  label:"TRUST SCORE",                val:trust,      req:TOKEN_GATES.trustScore,  fmt:v => `${(v*100).toFixed(1)}%` },
  ];
  const metCount = items.filter(g => g.val >= g.req).length;
  return { items, metCount, allMet: metCount === 5 };
}
