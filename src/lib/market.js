import { supabase } from "./supabaseClient";

export async function fetchTokens() {
  const { data, error } = await supabase
    .from("tokens")
    .select("post_id, created_at");
  if (error) throw error;
  return data;
}

export async function fetchPurchases() {
  const { data, error } = await supabase
    .from("token_purchases")
    .select("id, post_id, user_id, qty, cost, created_at");
  if (error) throw error;
  return data;
}

export async function buyToken({ postId, userId, qty, cost, commission }) {
  const { data, error } = await supabase
    .from("token_purchases")
    .insert({ post_id: postId, user_id: userId, qty, cost, commission })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates raw tokens + token_purchases rows into:
//   tokenizedPostIds:  Set<postId>
//   supplyAddByPost:   { [postId]: number }  (total qty purchased across everyone)
//   myPurchasesByPost: { [postId]: number }  (total qty purchased by the given userId)
export function aggregateMarket(tokens, purchases, userId) {
  const tokenizedPostIds = new Set(tokens.map(t => t.post_id));
  const supplyAddByPost = {};
  const myPurchasesByPost = {};
  for (const p of purchases) {
    supplyAddByPost[p.post_id] = (supplyAddByPost[p.post_id] || 0) + p.qty;
    if (userId && p.user_id === userId) {
      myPurchasesByPost[p.post_id] = (myPurchasesByPost[p.post_id] || 0) + p.qty;
    }
  }
  return { tokenizedPostIds, supplyAddByPost, myPurchasesByPost };
}
