// Best-effort in-memory rate limit. On Vercel each warm instance has its own memory,
// so this only slows abuse. For a hard limit use Upstash Redis or Vercel KV.
const hits = new Map();

export function limited(req, key, max, windowMs) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "anon";
  const k = key + ":" + ip;
  const now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    hits.set(k, arr);
    return true;
  }
  arr.push(now);
  hits.set(k, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}
