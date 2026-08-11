import { supabase } from "./supabaseClient";

export async function fetchWalletTransactions() {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, user_id, type, amount, method, purchase_id, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function depositFunds({ userId, amount, method }) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .insert({ user_id: userId, type: "deposit", amount, method })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function withdrawFunds({ userId, amount }) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .insert({ user_id: userId, type: "withdraw", amount: -amount })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Aggregates a flat wallet_transactions array (as returned by
// fetchWalletTransactions) into the user's current balance — always the
// sum of every row's amount, never stored as a mutable counter.
export function aggregateWallet(transactions) {
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  return { balance };
}
