import "@fontsource/hind-siliguri/bengali-400.css";
import "@fontsource/hind-siliguri/bengali-500.css";
import "@fontsource/hind-siliguri/bengali-600.css";
import "@fontsource/hind-siliguri/bengali-700.css";
import "@fontsource/hind-siliguri/latin-400.css";
import "@fontsource/hind-siliguri/latin-600.css";
import "@fontsource/hind-siliguri/latin-700.css";
import "@fontsource/noto-serif-bengali/bengali-600.css";
import "@fontsource/noto-serif-bengali/bengali-800.css";
import "@fontsource/noto-serif-bengali/latin-600.css";
import "@fontsource/noto-serif-bengali/latin-800.css";
import "./globals.css";
import { siteUrl } from "@/lib/store";

const title = "আমার বিয়ের বায়োডাটা: শ্বশুর-শাশুড়ি কী বলবেন?";
const description =
  "কয়েকটা ট্যাপ করুন, আর দেখুন আপনার বর/বউ, শ্বশুর আর শাশুড়ি আপনার বায়োডাটা নিয়ে কী মজার রায় দেন। বন্ধুদের সাথে শেয়ার করুন।";

export const metadata = {
  metadataBase: new URL(siteUrl()),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "bn_BD", siteName: "আমার বিয়ের বায়োডাটা" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#8a1428" };

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
