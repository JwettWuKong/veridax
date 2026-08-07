import { supabase } from "./supabaseClient";

const SELECT_COLUMNS = "id, author_id, cat, title, body, summary, evidence_links, flagship, created_at, profiles(username, field)";

export async function fetchPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createPost({ authorId, cat, title, body, summary, evidenceLinks, flagship }) {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: authorId,
      cat,
      title,
      body,
      summary,
      evidence_links: evidenceLinks || [],
      flagship: !!flagship,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}
