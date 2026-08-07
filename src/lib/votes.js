import { supabase } from "./supabaseClient";

export async function fetchVotes() {
  const { data, error } = await supabase
    .from("votes")
    .select("id, post_id, user_id, cluster, type, created_at");
  if (error) throw error;
  return data;
}

export async function castVote({ postId, userId, cluster, type }) {
  const { data, error } = await supabase
    .from("votes")
    .insert({ post_id: postId, user_id: userId, cluster, type })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates a flat votes array (as returned by fetchVotes) into the
// shapes the existing scoring functions and UI already expect:
//   postVotes:    { [postId]: { [clusterId]: count } }   (type === 'up')
//   postDisputes: { [postId]: { [clusterId]: count } }   (type === 'dispute')
//   userVotes:    { [postId]: 'up' | 'dispute' }          (for the given userId)
//   upCounts:     { [postId]: number }                    (total 'up' votes per post)
export function aggregateVotes(votes, userId) {
  const postVotes = {};
  const postDisputes = {};
  const userVotes = {};
  const upCounts = {};
  for (const v of votes) {
    const bucket = v.type === "up" ? postVotes : postDisputes;
    bucket[v.post_id] = bucket[v.post_id] || {};
    bucket[v.post_id][v.cluster] = (bucket[v.post_id][v.cluster] || 0) + 1;
    if (v.type === "up") {
      upCounts[v.post_id] = (upCounts[v.post_id] || 0) + 1;
    }
    if (userId && v.user_id === userId) {
      userVotes[v.post_id] = v.type;
    }
  }
  return { postVotes, postDisputes, userVotes, upCounts };
}
