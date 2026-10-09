import { bankFor } from "./questions.js";

export function cleanName(n) {
  return String(n || "")
    .replace(/[\r\n\t<>"`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

// Accepts only known option indexes; the server never trusts free text except the name.
export function validateInput(b) {
  if (!b || typeof b !== "object") return null;
  const Q = bankFor(b.g);
  if (!Q) return null;
  const raw = b.sel && typeof b.sel === "object" ? b.sel : {};
  const sel = {};
  for (const q of Q) {
    const arr = Array.isArray(raw[q.k]) ? raw[q.k] : [];
    const seen = new Set();
    const out = [];
    for (const v of arr) {
      if (Number.isInteger(v) && v >= 0 && v < q.O.length && !seen.has(v)) {
        seen.add(v);
        out.push(v);
      }
    }
    sel[q.k] = out.slice(0, q.s ? 1 : 5);
    if (q.q && !sel[q.k].length) return null;
  }
  return { g: b.g, name: cleanName(b.name), sel };
}
