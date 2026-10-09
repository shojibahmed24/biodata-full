// Server-side prompt builder. Question banks live in questions.js (shared with the client).
import { bankFor } from "./questions.js";

const PS=["নাটকের শাশুড়ি","ঢালিউড সিনেমার ভিলেন","গ্রামের চায়ের দোকানের মুরুব্বি","পাড়ার ঘটক","ক্রিকেট কমেন্টেটর","বিসিএস পরীক্ষার্থীর মা","সিরিয়ালের কুচক্রী পিসি","পাড়ার খালা","সংবাদ পাঠক"];
const TR=["অতিরঞ্জন","বাংলাদেশি জিনিসের সাথে তুলনা (লোডশেডিং, ফুচকা, রিকশা ভাড়া, ঈদের বাজার, ফুডপান্ডা)","বানানো পরিসংখ্যান (৭৩% সম্ভাবনা)","আগের কথার প্রতিধ্বনি","নাটকীয় হুমকি","ঘটকের মতো হিসাব","উপদেশের ছদ্মবেশে খোঁচা"];

function shuf(a){return a.slice().sort(function(){return Math.random()-.5})}
function pick(st,k){var q=st.Q.filter(function(x){return x.k===k})[0];return q&&st.sel[k]?st.sel[k].map(function(j){return q.O[j][1]}):[]}

export function buildPrompt(input){
  var st={g:input.g,n:input.name,sel:input.sel,Q:bankFor(input.g)};
  function lines(t){return st.Q.filter(function(q){return q.j.indexOf(t)>-1&&st.sel[q.k]&&st.sel[q.k].length}).map(function(q){return q.l+": "+pick(st,q.k).join(", ")}).join("\n")}
  var m=st.g==="m",oth=m?"bride":"groom",p=shuf(PS),t=shuf(TR);
  var pr="You are a stand-up comedy writer for Bangladeshi Facebook humour (Bangla natok, Dhallywood, tea-stall adda, family group chats). Write in Bangla script, natural spoken Bangla.\nBiodata owner: "+(m?"groom":"bride")+(st.n?" named "+st.n:"")+".\n\nThree judges react. Each judge reacts mostly to the answers listed for them.\nSPOUSE (the "+oth+", persona: "+p[0]+", comedy trick: "+t[0]+"):\n"+lines("w")+"\nFATHER of the "+oth+" (persona: "+p[1]+", comedy trick: "+t[1]+"; cares about age, profession, money, family):\n"+lines("f")+"\nMOTHER of the "+oth+" (persona: "+p[2]+", comedy trick: "+t[2]+"; cares about food, habits, flaws, family):\n"+lines("m")+
  "\n\nCOMEDY RULES:\n- Every reaction is a mini-joke: a setup that quotes 2 or 3 SPECIFIC answers (age and profession count), then a punchline that twists them. The LAST sentence is the punchline.\n- Use exaggeration, absurd precise numbers, a Bangladeshi reference (load-shedding, fuchka, rickshaw fare, Eid market, Foodpanda, BCS, tea stall, bKash, Wi-Fi, CNG, traffic jam, coaching centre, family Facebook group), a mock-serious threat, or a callback. Rule of three works well.\n- The three judges must sound completely different from each other, each in the voice of their persona. Be theatrical, confident and dramatic. Never polite, vague or generic. Never write safe lines like 'I will think about it'.\n- Roast with affection, never cruelty.\n- For each judge write 3 draft versions in d, then put the sharpest, funniest one (tightened) in t. t is max 260 characters, 3 or 4 short punchy sentences, first person, no label like father: or mother: at the start. Build it up and land the biggest laugh in the last sentence.\n- h = one meme-style punchline headline for the whole poster, max 70 characters, about the funniest answer.\n- v = verdict: 0 firm no, 1 undecided, 2 yes with a funny condition, 3 delighted. Choose it from the answers and vary it between judges. If the father says no he plainly says he will not marry his "+(m?"daughter to this groom":"son to this bride")+".\n\nReturn ONLY JSON: {\"h\":\"...\",\"w\":{\"v\":0,\"d\":[\"\",\"\",\"\"],\"t\":\"...\"},\"f\":{\"v\":0,\"d\":[\"\",\"\",\"\"],\"t\":\"...\"},\"m\":{\"v\":0,\"d\":[\"\",\"\",\"\"],\"t\":\"...\"}}\n\nStyle examples (style only, never copy):\n1. \"ডাক্তার হয়ে এগারোটায় ঘুম থেকে ওঠো? রোগী তো মরার আগেই ছুটি নিয়ে নেবে। আগে অ্যালার্মের সাথে সন্ধি করো, তারপর আমার মেয়ের সাথে।\"\n2. \"রান্না বলতে ডিম সিদ্ধ আর ম্যাগি! আমার ছেলে কি বিয়ে করে বিজ্ঞাপনে অভিনয় করবে? আগে ভাতটা ফুটতে শেখো, তারপর বউমা ডাকব।\"\n3. \"আট ঘণ্টা ফোন, তার সাত ঘণ্টাই রিলস। সতিন মানতে রাজি, কিন্তু রিলসকে না। কবুল বলব, তবে চার্জারটা থাকবে আমার হাতে।\"\n4. \"বত্রিশ বছর বয়স, এখনো চাকরি খুঁজছ? আমি জামাই খুঁজছি, ঘরজামাই না। বিসিএসের ফল নিয়ে এসো, তারপর চায়ের নিমন্ত্রণ।\"\nBe different every time (seed "+Math.random().toString(36).slice(2)+"). Never joke about skin colour, body weight, religion, caste or dowry. No abuse.";
  return pr;
}

export function strip(t){return String(t).replace(/^\s*(বাবা|মা|বউ|বর|শ্বশুর|শাশুড়ি)\s*[:：]\s*/,"").replace(/^[‘'"“]+|[’'"”]+$/g,"").trim()}

// Validates the model's JSON and returns a clean ops object, or null.
export function parseOps(r){
  function ok(x){return x&&typeof x.t==="string"&&x.t.trim()&&typeof x.v==="number"}
  if(!r||typeof r.h!=="string"||!ok(r.w)||!ok(r.f)||!ok(r.m))return null;
  function fx(x){return{v:Math.max(0,Math.min(3,Math.round(x.v))),t:strip(x.t).slice(0,400)}}
  return{h:strip(r.h).slice(0,200),w:fx(r.w),f:fx(r.f),m:fx(r.m)};
}
