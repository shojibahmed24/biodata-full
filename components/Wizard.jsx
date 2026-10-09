"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { QM, QF } from "@/lib/questions";
import { Poster, Card, Scaled } from "./Poster";
import ShareBox from "./ShareBox";

const bn = (n) => String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

function fallbackOps(Q, sel, g) {
  const pk = (k, d) => {
    const q = Q.find((x) => x.k === k);
    const a = sel[k] || [];
    return q && a.length ? q.O[a[Math.floor(Math.random() * a.length)]][1] : d;
  };
  const job = pk("job", "চাকরি"), age = pk("age", "এই বয়স"), dosh = pk("dosh", "দেরি করা");
  const food = pk("food", "রান্না"), phone = pk("phone", "ফোন"), gun = pk("gun", "গুণ");
  const oth = g === "m" ? "মেয়ে" : "ছেলে";
  const inlaw = g === "m" ? "জামাই" : "বউমা";
  const sets = [
    { h: `“${job}” শুনে বাবা হাসলেন, “${dosh}” শুনে চুপ`,
      w: { v: 2, t: `${job} শুনে ভালোই লাগল। কিন্তু “${dosh}” শুনে বুঝলাম, কবুল বলার আগে একটা অ্যালার্ম ঘড়ি উপহার দিতে হবে।` },
      f: { v: 1, t: `${age} বয়স আর ${job}, শুনতে ভালো। তবে “${dosh}” শুনে আমার প্রেসার উঠে গেছে। আগে এটা ঠিক করে এসো, তারপর চায়ের নিমন্ত্রণ।` },
      m: { v: 2, t: `“${food}” পারো শুনে রাজি, কিন্তু আমার সামনে একদিন রেঁধে দেখাতে হবে। ফেল করলে বিয়ে না, শুধু চা।` } },
    { h: `“${food}” দিয়ে বিয়ে? শাশুড়ি সাহস দেখে অবাক`,
      w: { v: 1, t: `“${phone}” শুনে আমার চোখ কপালে। আমি সতিন মানতে রাজি, কিন্তু ফোনকে না। আগে চার্জারটা আমার হাতে দাও।` },
      f: { v: 0, t: `${job} দিয়ে আমার ${oth}কে বিয়ে করবে? ${age} বয়সে এত আত্মবিশ্বাস ভালো, কিন্তু বিয়েটা হবে না, দরজা ওইদিকে।` },
      m: { v: 1, t: `“${food}” দিয়ে সংসার চলবে? আমি বলছি না চলবে না, শুধু বলছি আমার রান্নাঘর সামনের শুক্রবারে তোমাকে ডাকছে।` } },
    { h: `“${gun}” আছে বলে রক্ষা, “${dosh}” শুনে আবার ভাবনা`,
      w: { v: 3, t: `“${gun}” শুনেই মন গলে গেল। “${dosh}” নিয়ে একটু ঝগড়া হবে, কিন্তু কবুল বলতে দেরি করব না। কাজি ডাকো!` },
      f: { v: 2, t: `“${gun}” আছে মানে মানুষ ভালো। ${job} আছে মানে সংসার চলে যাবে। শুধু “${dosh}” বাদে বাকি সব রাজি, তবে বিয়ের দিন দেরি করো না।` },
      m: { v: 3, t: `“${food}” জানো শুনে আমার মন ভরে গেছে। তুমি আমার ${inlaw} হবে, ঈদের দিন প্রথম নিমন্ত্রণ আমার বাড়ি।` } },
    { h: `${age} আর ${job}, ঘটক বললেন: “ভরসা আছে”`,
      w: { v: 2, t: `${age} আর ${job}, মন্দ না। শুধু “${phone}” ঠিক করলে বিয়েতে হ্যাঁ বলার কথা ভাবব, নইলে ফোনকে সতিন বানাব।` },
      f: { v: 1, t: `আমার ${oth}র জন্য ${job}? ভাবছি। কিন্তু “${dosh}” চালিয়ে গেলে শ্বশুরবাড়ির দরজা পর্যন্ত পৌঁছাতে পারবে না।` },
      m: { v: 2, t: `“${food}” আর “${gun}”, দুটোই ভালো। তবে “${dosh}” শুনে আমার ঘুম আসছে না, রাতে একটু ভেবে বলব।` } },
    { h: `তিন বিচারক একমত: “${dosh}” নিয়ে কিছু একটা করতে হবে`,
      w: { v: 1, t: `সবই ভালো ছিল, কিন্তু “${dosh}” শুনে মনে হলো বিয়ের পর আমাকেই ঘড়ি হতে হবে। এক বছর সময় দিলাম।` },
      f: { v: 0, t: `${job} আর “${dosh}”, দুটো একসাথে সহ্য করা আমার প্রেসারের কম্ম না। আমার ${oth}র বিয়ে এখনই না।` },
      m: { v: 2, t: `“${food}” দিয়ে শুরু করো, একদিন আমার কাছে শিখে এসো। শিখে এলে আমি শাশুড়ি হিসেবে সবচেয়ে খুশি হব।` } },
  ];
  return sets[Math.floor(Math.random() * sets.length)];
}

const dataToBlob = (d) => fetch(d).then((r) => r.blob());

// Re-exports at lower JPEG quality until the file fits under the server limit.
async function jpgUnder(id, w, max) {
  let warm = true;
  for (const q of [0.88, 0.78, 0.68, 0.58]) {
    const b = await exportImage(id, w, "jpg", q, warm);
    warm = false;
    if (b.size <= max) return b;
  }
  throw new Error("image_too_big");
}

async function exportImage(id, w, kind, quality = 0.9, warm = true) {
  const { toJpeg, toPng } = await import("html-to-image"); // loaded only when exporting, keeps the first load light
  const n = document.getElementById(id);
  const o = {
    pixelRatio: 2,
    width: w,
    height: n.offsetHeight,
    style: { transform: "none", margin: "0" },
    quality,
  };
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  if (kind === "png") return dataToBlob(await toPng(n, o));
  if (warm) await toJpeg(n, o); // warm-up pass, Safari drops fonts on the first render
  return dataToBlob(await toJpeg(n, o));
}

export default function Wizard() {
  const [i, setI] = useState(0);
  const [g, setG] = useState("");
  const [name, setName] = useState("");
  const [ph, setPh] = useState("");
  const [sel, setSel] = useState({});
  const [more, setMore] = useState({});
  const [th, setTh] = useState(0);
  const [ops, setOps] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [share, setShare] = useState(null);
  const [sBusy, setSBusy] = useState(false);
  const started = useRef(false);
  const [viewer, setViewer] = useState(null);
  const [typing, setTyping] = useState(false);
  const [exporting, setExporting] = useState(false);

  const Q = g === "m" ? QM : g === "f" ? QF : [];
  const N = Q.length;

  const gen = useCallback(async () => {
    setBusy(true);
    setOps(null);
    setMsg("");
    setShare(null);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ g, name, sel }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ops) throw new Error(d.error === "rate" ? "rate" : "ai:" + (d.reason || r.status));
      setOps(d.ops);
    } catch (e) {
      setOps(fallbackOps(Q, sel, g));
      setMsg(
        e.message === "rate"
          ? "অনেক বেশি চেষ্টা করেছেন। কয়েক মিনিট পরে ‘নতুন মতামত লেখাও’ চাপুন।"
          : e.message.includes("http_429")
          ? "ফ্রি এআই মডেলের লিমিট এই মুহূর্তে শেষ। একটু পরে ‘নতুন মতামত লেখাও’ চাপুন। এখন নমুনা মতামত দেখানো হচ্ছে।"
          : `এআই মতামত লেখা গেল না (${e.message}), তাই নমুনা মতামত দেখানো হচ্ছে। ‘নতুন মতামত লেখাও’ চাপুন।`
      );
    } finally {
      setBusy(false);
    }
  }, [g, name, sel]);

  useEffect(() => {
    if (i === N + 1 && N > 0 && !started.current) {
      started.current = true;
      setTh(Math.floor(Math.random() * 2));
      gen();
    }
  }, [i, N, gen]);

  function choose(q, j) {
    setSel((s) => {
      const cur = s[q.k] || [];
      if (q.s) return { ...s, [q.k]: [j] };
      if (cur.includes(j)) return { ...s, [q.k]: cur.filter((x) => x !== j) };
      if (cur.length >= 5) return s;
      return { ...s, [q.k]: [...cur, j] };
    });
  }

  function pickGender(v) {
    if (v !== g) {
      setG(v);
      setSel({});
      setMore({});
    }
  }

  function onPhoto(file) {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas");
        const s = Math.min(1, 600 / Math.max(im.width, im.height));
        c.width = im.width * s;
        c.height = im.height * s;
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        setPh(c.toDataURL("image/jpeg", 0.85));
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }

  // Desktop: normal download. Phones and in-app browsers (Facebook, Messenger) often block downloads,
  // so we show the image full screen with a share/save button and a long-press hint.
  async function download(id, w, fn) {
    if (exporting) return;
    setExporting(true);
    try {
      const b = await exportImage(id, w, "png");
      const url = URL.createObjectURL(b);
      const file = new File([b], fn, { type: "image/png" });
      const phone = /Android|iPhone|iPad|iPod|FBAN|FBAV|Instagram/i.test(navigator.userAgent) || ("ontouchstart" in window && window.innerWidth < 820);
      if (phone) {
        setViewer({ url, name: fn, file, can: !!(navigator.canShare && navigator.canShare({ files: [file] })) });
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fn;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch {
      alert("ছবি সেভ করা গেল না, আবার চেষ্টা করুন।");
    } finally {
      setExporting(false);
    }
  }

  function closeViewer() {
    if (viewer) URL.revokeObjectURL(viewer.url);
    setViewer(null);
  }

  async function shareViewer() {
    try {
      await navigator.share({ files: [viewer.file], title: "আমার বিয়ের বায়োডাটা" });
    } catch {
      /* cancelled */
    }
  }

  async function createShare() {
    if (!ops || busy) return;
    setSBusy(true);
    try {
      const pb = await jpgUnder("poster", 540, 1_900_000);
      const cb = await jpgUnder("cardp", 600, 1_900_000);
      const fd = new FormData();
      fd.append("meta", JSON.stringify({ g, name, sel, ops, th }));
      fd.append("poster", pb, "poster.jpg");
      fd.append("card", cb, "card.jpg");
      const r = await fetch("/api/share", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) throw new Error(d.reason || d.error || "store");
      setShare({
        url: d.url,
        files: [new File([pb], "amar-biodata.jpg", { type: "image/jpeg" })],
      });
    } catch (e) {
      alert(e.message === "rate" ? "অনেক বেশি শেয়ার করেছেন, কিছুক্ষণ পরে চেষ্টা করুন।" : "শেয়ার লিংক বানানো গেল না (" + e.message + ")। /api/health খুলে দেখুন কী ঠিক নেই।");
    } finally {
      setSBusy(false);
    }
  }

  function restart() {
    started.current = false;
    setI(0); setG(""); setName(""); setPh(""); setSel({}); setMore({}); setOps(null); setShare(null); setMsg("");
  }

  const inResult = i > N && N > 0;
  const q = i >= 1 && i <= N ? Q[i - 1] : null;
  const cur = q ? sel[q.k] || [] : [];
  const full = q && !q.s && cur.length >= 5;
  const nextDisabled = i === 0 ? !g : q && q.q ? !cur.length : false;
  const props = { g, name, ph, Q, sel, ops, th };
  const caption = "আমার বায়োডাটায় শ্বশুর-শাশুড়ি কী বললেন দেখুন 😂 তুমিও বানাও:";

  return (
    <>
      <div className="wrap">
        <span className="logo">আমার বিয়ের বায়োডাটা</span>
        <div className="pg"><div id="bar" style={{ width: N ? `${(i / (N + 1)) * 100}%` : "0%" }} /></div>
        <main>
          {i === 0 && (
            <>
              <h2>কে বায়োডাটা দিচ্ছে?</h2>
              <p className="h">একটা বাছুন। পাত্র আর পাত্রীর প্রশ্ন আলাদা।</p>
              <div className="two">
                <button type="button" className={"big" + (g === "m" ? " on" : "")} onClick={() => pickGender("m")}>🤵<span>পাত্র (ছেলে)</span></button>
                <button type="button" className={"big" + (g === "f" ? " on" : "")} onClick={() => pickGender("f")}>👰<span>পাত্রী (মেয়ে)</span></button>
              </div>
              <label className="lb">
                নাম (শুধু এটাই লিখতে হবে)
                <input type="text" maxLength={20} placeholder="যেমন: রহিম" value={name} autoComplete="off" enterKeyHint="done" onChange={(e) => setName(e.target.value)} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
              </label>
              <div className="phr">
                <div className="pv">{ph ? <img src={ph} alt="" /> : "📷"}</div>
                <label className="pb">
                  {ph ? "ছবি বদলান" : "ছবি যোগ করুন (ইচ্ছা হলে)"}
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && onPhoto(e.target.files[0])} />
                </label>
              </div>
              <p className="priv">ছবি দিলে এবং শেয়ার করলে সেটি বায়োডাটার সাথে একটি পাবলিক লিংকে থাকবে। ছবি না দিলেও চলবে।</p>
            </>
          )}

          {q && (
            <>
              <p className="h">প্রশ্ন {bn(i)}/{bn(N)} · {q.s ? "একটি বাছুন" : "সর্বোচ্চ ৫টি বাছুন, যত বেশি তত মজা"}</p>
              <h2>{q.t}{!q.s && <span className="cnt">{bn(cur.length)}/৫</span>}</h2>
              <div className="grid">
                {q.O.map((o, j) => {
                  if (!more[q.k] && q.O.length > 10 && j >= 9) return null;
                  const on = cur.includes(j);
                  return (
                    <button type="button" key={j} className={"opt" + (on ? " on" : "")} disabled={full && !on} onClick={() => choose(q, j)}>
                      <i>{o[0]}</i>{o[1]}
                    </button>
                  );
                })}
              </div>
              {!more[q.k] && q.O.length > 10 && (
                <button type="button" className="more" onClick={() => setMore((m) => ({ ...m, [q.k]: 1 }))}>আরও {bn(q.O.length - 9)}টি দেখুন ↓</button>
              )}
            </>
          )}

          {inResult && (
            <>
              <h2>আপনার বায়োডাটা তৈরি!</h2>
              <p className="fb">ফেসবুক ফিডে ওপরের ছবি, নাম, তিন সিলমোহর আর হেডলাইন আগে দেখা যাবে। পুরো মতামত দেখতে লোকে লিংকে ক্লিক করবে।</p>
              <Scaled w={540}><Poster {...props} /></Scaled>
              {msg && <p className="fb">{msg}</p>}
              <div className="acts">
                <button type="button" disabled={busy} onClick={() => { setTh((t) => (t + 1) % 2); setShare(null); }}>🎨 আরেকটা ডিজাইন</button>
                <button type="button" disabled={busy} onClick={() => gen()}>🔄 নতুন মতামত লেখাও</button>
                <button type="button" className="pr" disabled={busy || exporting} onClick={() => download("poster", 540, "amar-biodata.png")}>{exporting ? "ছবি তৈরি হচ্ছে…" : "⬇ পোস্টার সেভ"}</button>
              </div>
              <p className="sub">ফেসবুক শেয়ার কার্ড (লিংকের প্রিভিউ)</p>
              <Scaled w={600}><Card {...props} /></Scaled>
              <div className="acts">
                <button type="button" className="pr" disabled={busy || exporting} onClick={() => download("cardp", 600, "amar-biodata-share-card.png")}>{exporting ? "ছবি তৈরি হচ্ছে…" : "⬇ শেয়ার কার্ড সেভ"}</button>
              </div>
              <p className="sub">শেয়ার করুন</p>
              {share ? (
                <ShareBox url={share.url} caption={caption} title="আমার বিয়ের বায়োডাটা" files={share.files} />
              ) : (
                <>
                  <button type="button" className="share-main" disabled={busy || sBusy || !ops} onClick={createShare}>
                    {sBusy ? "লিংক বানানো হচ্ছে…" : "🔗 শেয়ার লিংক বানাও"}
                  </button>
                  <p className="priv">লিংক বানালে বায়োডাটার ছবিসহ পোস্টার একটি পাবলিক লিংকে সেভ হবে।</p>
                </>
              )}
              <div className="acts"><button type="button" onClick={restart}>↺ নতুন করে শুরু</button></div>
            </>
          )}
        </main>
      </div>

      {!inResult && !typing && (
        <div className="nv">
          <div>
            <button type="button" id="bk" style={{ visibility: i === 0 ? "hidden" : "visible" }} onClick={() => setI((x) => Math.max(0, x - 1))}>পেছনে</button>
            <button type="button" id="nx" disabled={nextDisabled} onClick={() => { setI((x) => x + 1); window.scrollTo(0, 0); }}>
              {i === 0 ? "শুরু করি" : i === N ? "পোস্টার বানাও 🎉" : "পরেরটা"}
            </button>
          </div>
        </div>
      )}

      {inResult && (
        <div className="nv">
          <div>
            {share ? (
              <a className="sbtn fbk" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(share.url)}&quote=${encodeURIComponent(caption)}`}>
                ফেসবুকে শেয়ার করুন
              </a>
            ) : (
              <button type="button" className="share-main" disabled={busy || sBusy || !ops} onClick={createShare}>
                {sBusy ? "লিংক বানানো হচ্ছে…" : "🔗 শেয়ার লিংক বানাও"}
              </button>
            )}
          </div>
        </div>
      )}

      {viewer && (
        <div className="ov" role="dialog" aria-modal="true">
          <button type="button" className="ovx" onClick={closeViewer}>✕ বন্ধ করুন</button>
          <p>ছবির ওপর আঙুল চেপে ধরে <b>Save image</b> বা <b>ছবি সেভ</b> চাপুন। ফেসবুক বা মেসেঞ্জারের ভেতরের ব্রাউজারে ডাউনলোড না-ও হতে পারে, তাই এভাবে সেভ করুন।</p>
          <img src={viewer.url} alt="আমার বিয়ের বায়োডাটা" />
          {viewer.can && <button type="button" className="share-main" onClick={shareViewer}>📲 ছবি শেয়ার বা সেভ করুন</button>}
          <a className="sbtn" href={viewer.url} download={viewer.name}>⬇ ডাউনলোড করুন</a>
        </div>
      )}
    </>
  );
}
