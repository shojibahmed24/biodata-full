"use client";
import { useEffect, useState } from "react";

export default function ShareBox({ url, caption, title, files }) {
  const [mobile, setMobile] = useState(false);
  const [native, setNative] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => {
    setMobile(/Android|iPhone|iPad/i.test(navigator.userAgent));
    setNative(typeof navigator.share === "function");
  }, []);

  const enc = encodeURIComponent;
  const full = `${caption} ${url}`;

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const a = document.createElement("textarea");
      a.value = text;
      document.body.appendChild(a);
      a.select();
      document.execCommand("copy");
      a.remove();
    }
    setDone(key);
    setTimeout(() => setDone(""), 2200);
  }

  async function nativeShare() {
    try {
      if (files && files.length && navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({ files, title, text: full });
      } else {
        await navigator.share({ title, text: caption, url });
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div>
      <div className="sgrid">
        <a
          className="sbtn fbk"
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(caption)}`}
        >
          ফেসবুকে শেয়ার করুন
        </a>
        <a className="sbtn wa" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(full)}`}>
          হোয়াটসঅ্যাপ
        </a>
        {mobile ? (
          <a className="sbtn ms" href={`fb-messenger://share/?link=${enc(url)}`}>মেসেঞ্জার</a>
        ) : (
          <a className="sbtn tg" target="_blank" rel="noopener noreferrer" href={`https://t.me/share/url?url=${enc(url)}&text=${enc(caption)}`}>টেলিগ্রাম</a>
        )}
        {native && <button type="button" className="sbtn" onClick={nativeShare}>ছবিসহ শেয়ার (মোবাইল)</button>}
        <button type="button" className="sbtn" onClick={() => copy(url, "l")}>{done === "l" ? "লিংক কপি হয়েছে" : "লিংক কপি"}</button>
        <button type="button" className="sbtn" onClick={() => copy(full, "c")}>{done === "c" ? "ক্যাপশন কপি হয়েছে" : "ক্যাপশনসহ কপি"}</button>
      </div>
      <p className="priv">ফেসবুকে লিংক পোস্ট করলে ওপরের কার্ডটি প্রিভিউ হিসেবে দেখা যাবে। ক্যাপশন নিজে পেস্ট করে নিতে পারেন।</p>
    </div>
  );
}
