export default function manifest() {
  return {
    name: "আমার বিয়ের বায়োডাটা",
    short_name: "বিয়ের বায়োডাটা",
    description: "মজার বিয়ের বায়োডাটা বানান, শ্বশুর-শাশুড়ির রায় দেখুন, বন্ধুদের সাথে শেয়ার করুন।",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f3ebdd",
    theme_color: "#8a1428",
    lang: "bn",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
