import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { validateInput } from "@/lib/validate";
import { parseOps } from "@/lib/prompt";
import { limited } from "@/lib/rate";
import { admin, BUCKET, publicUrl, siteUrl } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 2_200_000; // each image; Vercel's request limit is 4.5 MB in total

function isJpeg(f) {
  return f && typeof f === "object" && typeof f.arrayBuffer === "function" && f.type === "image/jpeg" && f.size > 1000 && f.size <= MAX_BYTES;
}

export async function POST(req) {
  if (limited(req, "share", 15, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "rate" }, { status: 429 });
  }
  let fd;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }
  let meta;
  try {
    meta = JSON.parse(String(fd.get("meta") || "{}"));
  } catch {
    return NextResponse.json({ error: "bad" }, { status: 400 });
  }
  const input = validateInput(meta);
  const ops = parseOps(meta.ops);
  const poster = fd.get("poster");
  const card = fd.get("card");
  const why = !input ? "bad_answers" : !ops ? "bad_opinions" : !isJpeg(poster) ? "poster_file_invalid_or_too_big" : !isJpeg(card) ? "card_file_invalid_or_too_big" : "";
  if (why) {
    return NextResponse.json({ error: "bad", reason: why }, { status: 400 });
  }

  const id = crypto.randomBytes(6).toString("base64url");
  const posterPath = `${id}/poster.jpg`;
  const cardPath = `${id}/card.jpg`;
  try {
    const sb = admin();
    const up = async (path, file) => {
      const { error } = await sb.storage
        .from(BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });
      if (error) throw error;
    };
    await up(posterPath, poster);
    await up(cardPath, card);
    const { error } = await sb.from("biodatas").insert({
      id,
      gender: input.g,
      name: input.name,
      answers: input.sel,
      ops,
      theme: meta.th === 1 ? 1 : 0,
      poster_path: posterPath,
      card_path: cardPath,
    });
    if (error) throw error;
  } catch (e) {
    console.error("share failed", e.message || e);
    return NextResponse.json({ error: "store", reason: String(e.message || e).slice(0, 100) }, { status: 502 });
  }
  return NextResponse.json({ id, url: `${siteUrl()}/b/${id}`, card: publicUrl(cardPath) });
}
