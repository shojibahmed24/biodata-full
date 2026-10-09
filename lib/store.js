import { createClient } from "@supabase/supabase-js";

export const BUCKET = process.env.SUPABASE_BUCKET || "biodata-images";

export function admin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars are missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function publicUrl(path) {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

export function siteUrl() {
  const u =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "") ||
    (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "") ||
    "http://localhost:3000";
  return u.replace(/\/$/, "");
}

export async function getBio(id) {
  if (!/^[A-Za-z0-9_-]{6,16}$/.test(id)) return null;
  try {
    const { data, error } = await admin().from("biodatas").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) {
    console.error("getBio failed:", e.message || e);
    return null;
  }
}
