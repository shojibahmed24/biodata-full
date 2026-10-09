"use client";
import { useEffect, useRef, useState } from "react";

export function pickLabels(Q, sel, k) {
  const q = Q.find((x) => x.k === k);
  return q && sel[k] ? sel[k].map((j) => q.O[j][1]) : [];
}

const WORDS = ["না রাজি", "ভাবছে", "রাজি", "কবুল!"];
const COLORS = ["#b3121f", "#b36b00", "#1f7a8c", "#1b7a3a"];
const TILT = [-6, 5, -4];

function Seals({ g, ops }) {
  const labels = [g === "m" ? "বউ" : "বর", "শ্বশুর", "শাশুড়ি"];
  return (
    <div className="sls">
      {["w", "f", "m"].map((k, i) => {
        const v = ops ? ops[k].v : -1;
        return (
          <div className="sl" key={k}>
            <div className="rg" style={{ "--c": v < 0 ? "#8a8a8a" : COLORS[v], transform: `rotate(${TILT[i]}deg)` }}>
              {v < 0 ? "…" : WORDS[v]}
            </div>
            <b>{labels[i]}</b>
          </div>
        );
      })}
    </div>
  );
}

function Photo({ ph }) {
  return ph ? <img src={ph} alt="" /> : <>ছবি<br />নেই</>;
}

function subline(Q, sel) {
  const a = pickLabels(Q, sel, "age")[0] || "";
  const j = pickLabels(Q, sel, "job")[0];
  return a + (j ? " · " + j : "");
}

export function Poster({ g, name, ph, Q, sel, ops, th }) {
  const m = g === "m";
  const nm = name || (m ? "রহিম" : "রুমা");
  const T = (k) => (ops ? ops[k].t : "ঘটক কাকা লিখছেন…");
  return (
    <div className="poster" id="poster" data-t={th}>
      <div className="fr">
        <div className="hz">
          <div className="hd">
            <small>॥ শুভ বিবাহের প্রস্তাব ॥</small>
            <h1>{m ? "পাত্রী চাই" : "পাত্র চাই"}</h1>
          </div>
          <div className="orn">✦ ✦ ✦</div>
          <div className="id">
            <div className="ph"><Photo ph={ph} /></div>
            <div>
              <div className="nm">{nm}</div>
              <div className="sb">{m ? "পাত্র" : "পাত্রী"}</div>
              <div className="sb">{subline(Q, sel)}</div>
            </div>
          </div>
          <div className="jt">তিন বিচারকের রায়</div>
          <Seals g={g} ops={ops} />
          <div className="hl">{ops ? "“" + ops.h + "”" : "ঘটক কাকা রায় লিখছেন…"}</div>
          <div className="rb">শ্বশুর-শাশুড়ি পুরো কী বললেন? লিংকে ক্লিক করুন</div>
        </div>
        <dl>
          {Q.map((q) => {
            const p = pickLabels(Q, sel, q.k);
            return p.length ? (
              <div className="rw" key={q.k}>
                <dt>{q.l}</dt>
                <dd>{p.join(", ")}</dd>
              </div>
            ) : null;
          })}
        </dl>
        <div className="op"><h3>{m ? "বউয়ের" : "বরের"} মতামত</h3><div className="bb">{T("w")}</div></div>
        <div className="op"><h3>শ্বশুরের মতামত</h3><div className="bb">{T("f")}</div></div>
        <div className="op"><h3>শাশুড়ির মতামত</h3><div className="bb">{T("m")}</div></div>
        <div className="ft">
          জরুরি যোগাযোগ: ০১XXX-XXXXXX (ঘটক করিম চাচা)
          <div>এই বায়োডাটার সত্যতার ১০০% গ্যারান্টি দেওয়া হয় না।</div>
        </div>
        <div className="mk"><span>তুমিও বানাও, বন্ধুকে ট্যাগ করো</span><b>আমার বিয়ের বায়োডাটা</b></div>
      </div>
    </div>
  );
}

export function Card({ g, name, ph, Q, sel, ops, th }) {
  const m = g === "m";
  const nm = name || (m ? "রহিম" : "রুমা");
  return (
    <div className="cardp" id="cardp" data-t={th}>
      <div className="cp-top">
        <div className="cp-l">
          <div className="cp-ph"><Photo ph={ph} /></div>
          <div className="cp-nm">{nm}</div>
        </div>
        <div className="cp-r">
          <div className="cp-t">{m ? "পাত্রী চাই" : "পাত্র চাই"}</div>
          <div className="cp-m">{subline(Q, sel)}</div>
          <Seals g={g} ops={ops} />
        </div>
      </div>
      <div className="cp-h">{ops ? "“" + ops.h + "”" : "ঘটক কাকা রায় লিখছেন…"}</div>
      <div className="cp-b">শ্বশুর-শাশুড়ি কী বললেন? ক্লিক করে দেখুন</div>
    </div>
  );
}

// Scales a fixed-width poster down to fit narrow screens. Exports read the real size via offsetHeight.
export function Scaled({ w, children }) {
  const box = useRef(null);
  const inner = useRef(null);
  const [sc, setSc] = useState(1);
  const [h, setH] = useState(0);
  useEffect(() => {
    const f = () => {
      if (!box.current || !inner.current) return;
      const s = Math.min(1, box.current.clientWidth / w);
      setSc(s);
      setH(inner.current.offsetHeight * s);
    };
    f();
    const ro = new ResizeObserver(f);
    ro.observe(box.current);
    ro.observe(inner.current);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={box} style={{ width: "100%" }}>
      <div style={{ width: w * sc, height: h || undefined, margin: "0 auto", overflow: "hidden" }}>
        <div ref={inner} style={{ width: w, transform: `scale(${sc})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
