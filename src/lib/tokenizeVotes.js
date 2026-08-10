import { supabase } from "./supabaseClient";

export async function fetchTokenizeVotes() {
  const { data, error } = await supabase
    .from("tokenize_votes")
    .select("id, post_id, user_id, vote, created_at");
  if (error) throw error;
  return data;
}

export async function castTokenizeVote({ postId, userId, vote }) {
  const { data, error } = await supabase
    .from("tokenize_votes")
    .insert({ post_id: postId, user_id: userId, vote })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates a flat tokenize_votes array (as returned by
// fetchTokenizeVotes) into:
//   yesCounts: { [postId]: number }
//   noCounts:  { [postId]: number }
//   userVotes: { [postId]: 'yes' | 'no' }  (for the given userId)
export function aggregateTokenizeVotes(votes, userId) {
  const yesCounts = {};
  const noCounts = {};
  const userVotes = {};
  for (const v of votes) {
    const bucket = v.vote === "yes" ? yesCounts : noCounts;
    bucket[v.post_id] = (bucket[v.post_id] || 0) + 1;
    if (userId && v.user_id === userId) {
      userVotes[v.post_id] = v.vote;
    }
  }
  return { yesCounts, noCounts, userVotes };
}
