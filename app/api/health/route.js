import { NextResponse } from "next/server";
import { admin, BUCKET, siteUrl } from "@/lib/store";
import { limited } from "@/lib/rate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Open /api/health after deploying. It reports what is missing, without showing any secret values.
export async function GET(req) {
  if (limited(req, "health", 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }
  const out = {
    env: {
      OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL: !!process.env.OPENROUTER_MODEL, // optional, default is used when not set
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    },
    model: process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free",
    siteUrl: siteUrl(),
    ai: "not checked",
    supabaseBucket: "not checked",
    supabaseTable: "not checked",
  };

  if (out.env.OPENROUTER_API_KEY) {
    try {
      const base = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
      const r = await fetch(base + "/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + process.env.OPENROUTER_API_KEY },
        body: JSON.stringify({ model: out.model, max_tokens: 64, messages: [{ role: "user", content: "hi" }] }),
        signal: AbortSignal.timeout(20000),
      });
      if (r.ok) out.ai = "ok";
      else {
        let m = "";
        try { m = (await r.json())?.error?.message || ""; } catch {}
        out.ai = `FAIL http ${r.status}: ${m}`.slice(0, 200);
      }
    } catch (e) {
      out.ai = "FAIL network/timeout";
    }
  } else {
    out.ai = "FAIL OPENROUTER_API_KEY missing";
  }

  if (out.env.SUPABASE_URL && out.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = admin();
      const b = await sb.storage.getBucket(BUCKET);
      out.supabaseBucket = b.error ? `FAIL ${b.error.message}` : b.data?.public ? "ok (public)" : "FAIL bucket is not public";
      const t = await sb.from("biodatas").select("id", { head: true, count: "exact" }).limit(1);
      out.supabaseTable = t.error ? `FAIL ${t.error.message}` : "ok";
    } catch (e) {
      out.supabaseBucket = "FAIL " + String(e.message || e).slice(0, 120);
    }
  } else {
    out.supabaseBucket = "FAIL SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing";
  }

  out.allGood = out.ai === "ok" && out.supabaseBucket.startsWith("ok") && out.supabaseTable === "ok";
  return NextResponse.json(out);
}
