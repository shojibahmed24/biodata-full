import { cache } from "react";
import { notFound } from "next/navigation";
import ShareBox from "@/components/ShareBox";
import { getBio, publicUrl, siteUrl } from "@/lib/store";

export const dynamic = "force-dynamic";

const load = cache(getBio);

export async function generateMetadata({ params }) {
  const b = await load(params.id);
  if (!b) return { title: "পাওয়া যায়নি" };
  const name = b.name || (b.gender === "m" ? "পাত্র" : "পাত্রী");
  const title = `${name}-এর বিয়ের বায়োডাটা: শ্বশুর-শাশুড়ি কী বললেন?`;
  const description = b.ops.h;
  const url = `${siteUrl()}/b/${b.id}`;
  const image = publicUrl(b.card_path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "bn_BD",
      siteName: "আমার বিয়ের বায়োডাটা",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function BioPage({ params }) {
  const b = await load(params.id);
  if (!b) notFound();
  const url = `${siteUrl()}/b/${b.id}`;
  const caption = "আমার বায়োডাটায় শ্বশুর-শাশুড়ি কী বললেন দেখুন 😂 তুমিও বানাও:";
  return (
    <main className="shp">
      <img src={publicUrl(b.poster_path)} alt={`${b.name} এর বিয়ের বায়োডাটা`} width="1080" />
      <ShareBox url={url} caption={caption} title="আমার বিয়ের বায়োডাটা" />
      <div className="nv">
        <div>
          <a className="sbtn fbk cta-bar" href="/">তুমিও তোমার বায়োডাটা বানাও</a>
        </div>
      </div>
    </main>
  );
}
