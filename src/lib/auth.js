import { supabase } from "./supabaseClient";

// Creates a new Supabase Auth user and attaches profile fields as
// user_metadata; the `handle_new_user` trigger turns that into a real
// `profiles` row immediately (even before the email is confirmed).
export async function signUp({ email, password, username, cluster, field, credentials }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, cluster, field, credentials: credentials || [] },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, field, cluster, credentials, joined_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

// Total registered users, for the "EXPERTS"/"CONTRIBUTORS" stat displays
// (previously `accounts.length` against the fake local accounts array).
export async function fetchProfileCount() {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count || 0;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Subscribes to sign-in/sign-out/token-refresh events. Returns an
// unsubscribe function.
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}

// Shapes a Supabase session + profiles row into the flat `user` object
// the rest of App.jsx already expects (same shape the old localStorage
// account objects had), so downstream components don't need to change.
export function toAppUser(session, profile) {
  return {
    id: profile.id,
    email: session.user.email,
    username: profile.username,
    cluster: profile.cluster,
    field: profile.field,
    credentials: profile.credentials || [],
    joined: new Date(profile.joined_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    pohMethod: null, // Proof of Humanity is deferred to a later phase.
  };
}
