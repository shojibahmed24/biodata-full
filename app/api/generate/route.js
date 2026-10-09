import { NextResponse } from "next/server";
import { validateInput } from "@/lib/validate";
import { buildPrompt, parseOps } from "@/lib/prompt";
import { limited } from "@/lib/rate";
import { siteUrl } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

class AiError extends Error {
  constructor(reason) {
    super(reason);
    this.reason = reason;
  }
}

// OpenRouter speaks the OpenAI chat-completions format.
// The model comes from the OPENROUTER_MODEL env var. If it is not set, the free NVIDIA Nemotron 3 Ultra model is used.
const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
async function callModel(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  if (!key) throw new AiError("no_key");
  const base = (process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
  let r;
  try {
    r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + key,
        "HTTP-Referer": siteUrl(),
        "X-Title": "Amar Biyer Biodata",
      },
      body: JSON.stringify({
        model,
        max_tokens: 8000, // reasoning models spend part of this on thinking before the JSON
        temperature: 1,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(55000),
    });
  } catch {
    throw new AiError("timeout_or_network");
  }
  if (!r.ok) {
    let m = "";
    try {
      m = (await r.json())?.error?.message || "";
    } catch {}
    console.error("OpenRouter error", r.status, m);
    throw new AiError("http_" + r.status);
  }
  const d = await r.json();
  const c = d?.choices?.[0]?.message?.content;
  const text = Array.isArray(c) ? c.map((p) => (typeof p === "string" ? p : p?.text || "")).join("") : String(c || "");
  const a = text.indexOf("{");
  const b = text.lastIndexOf("}");
  if (a < 0 || b < a) throw new AiError("no_json");
  try {
    return JSON.parse(text.slice(a, b + 1));
  } catch {
    throw new AiError("bad_json");
  }
}

export async function POST(req) {
  if (limited(req, "gen", 12, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }
  const input = validateInput(body);
  if (!input) return NextResponse.json({ error: "bad" }, { status: 400 });

  let reason = "unknown";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ops = parseOps(await callModel(buildPrompt(input)));
      if (ops) return NextResponse.json({ ops });
      reason = "bad_shape";
    } catch (e) {
      reason = e.reason || "parse";
      console.error("generate failed", e.message);
      if (["no_key", "http_401", "http_402", "http_404"].includes(reason)) break;
    }
  }
  return NextResponse.json({ error: "ai", reason }, { status: 502 });
}
