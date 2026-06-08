#!/usr/bin/env node
// 서버사이드 RSS fetch → news.json 생성 (GitHub Actions에서 실행)
import https from "https";
import http from "http";
import { DOMParser } from "@xmldom/xmldom";

function dateAfter(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const SOURCES = [
  { id: "gn_lipitor_kr", name: "리피토·스타틴 (국내)", country: "KR", prod: "lipitor",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("리피토 OR 아토르바스타틴 OR 이상지질혈증 OR 고지혈증 OR 스타틴 OR 크레스토 OR 로수바스타틴 OR 에제티미브 OR PCSK9 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_statin_en", name: "Lipitor·Statin (Global)", country: "US", prod: "lipitor",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("atorvastatin OR lipitor OR statin OR rosuvastatin OR LDL cholesterol OR PCSK9 inhibitor OR evolocumab OR inclisiran after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
  { id: "gn_lipitorplus_kr", name: "리피토플러스·에제티미브 (국내)", country: "KR", prod: "lipitorplus",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("에제티미브 OR 이지트롤 OR 로수젯 OR 바이토린 OR 스타틴 에제티미브 OR 이상지질혈증 복합제 OR 콜레스테롤 복합 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_lipitorplus_en", name: "LipitorPlus·Ezetimibe (Global)", country: "US", prod: "lipitorplus",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("ezetimibe OR vytorin OR zetia OR ezetimibe atorvastatin OR statin ezetimibe combination OR lipitor plus OR LDL lowering combination after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
  { id: "gn_norvasc_kr", name: "노바스크·CCB (국내)", country: "KR", prod: "norvasc",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("노바스크 OR 암로디핀 OR 고혈압 OR 칼슘채널차단제 OR 협심증 OR ARB OR 발사르탄 OR 텔미사르탄 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_htn_en", name: "Norvasc·CCB (Global)", country: "US", prod: "norvasc",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("amlodipine OR norvasc OR hypertension treatment OR calcium channel blocker OR ARB antihypertensive OR blood pressure guideline after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
  { id: "gn_lyrica_kr", name: "리리카·신경통 (국내)", country: "KR", prod: "lyrica",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("리리카 OR 프레가발린 OR 신경병증성 통증 OR 섬유근육통 OR 뇌전증 OR 가바펜틴 OR 당뇨병성 신경병증 OR 대상포진 후 신경통 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_neuro_en", name: "Lyrica·Neuropathy (Global)", country: "US", prod: "lyrica",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("pregabalin OR lyrica OR gabapentin OR neuropathic pain OR fibromyalgia OR diabetic neuropathy OR postherpetic neuralgia after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
  { id: "gn_celebrex_kr", name: "쎄레브렉스·관절염 (국내)", country: "KR", prod: "celebrex",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("쎄레브렉스 OR 셀레콕시브 OR 골관절염 OR 류마티스관절염 OR COX-2 OR NSAID OR 에토리콕시브 OR 멜록시캄 OR TNF억제제 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_arthritis_en", name: "Celebrex·Arthritis (Global)", country: "US", prod: "celebrex",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("celecoxib OR celebrex OR osteoarthritis OR rheumatoid arthritis OR COX-2 inhibitor OR etoricoxib OR NSAID OR TNF inhibitor after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
  { id: "gn_caduet_kr", name: "카듀엣·복합제 (국내)", country: "KR", prod: "caduet",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("카듀엣 OR 암로디핀 아토르바스타틴 OR 고혈압 이상지질혈증 복합제 OR 고정용량복합제 OR 심혈관 복합 OR 듀카브 OR 로수바미브 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_caduet_en", name: "Caduet·Combo (Global)", country: "US", prod: "caduet",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("caduet OR amlodipine atorvastatin OR fixed dose combination statin CCB OR hypertension dyslipidemia combination OR cardiovascular polypill after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
  { id: "gn_policy_kr", name: "의약품 정책 (국내)", country: "KR", prod: "all",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("의약품 급여 OR 식약처 허가 OR 심평원 OR 약가 OR 보험급여 스타틴 OR 보험급여 고혈압 OR 보험급여 관절염 after:" + dateAfter(14))}&hl=ko&gl=KR&ceid=KR:ko` },
  { id: "gn_policy_en", name: "Drug Policy (Global)", country: "US", prod: "all",
    rss: `https://news.google.com/rss/search?q=${encodeURIComponent("FDA approval cardiovascular OR EMA approval statin OR drug pricing cholesterol OR reimbursement arthritis OR neuropathic pain guideline after:" + dateAfter(14))}&hl=en-US&gl=US&ceid=US:en` },
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function parseRss(xml, src) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  const items = [...doc.getElementsByTagName("item")].slice(0, 20);
  return items.map(item => {
    const g = tag => item.getElementsByTagName(tag)[0]?.textContent?.trim() ?? "";
    const title = g("title");
    const link = g("link");
    const desc = g("description").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
    const pubDate = g("pubDate");
    if (!title || !link) return null;
    return { title, link, desc, pubDate, sourceId: src.id, sourceName: src.name, country: src.country, prod: src.prod };
  }).filter(Boolean);
}

async function main() {
  const results = await Promise.allSettled(
    SOURCES.map(async src => {
      try {
        const xml = await fetchUrl(src.rss);
        return parseRss(xml, src);
      } catch (e) {
        process.stderr.write(`[FAIL] ${src.id}: ${e.message}\n`);
        return [];
      }
    })
  );

  const all = results.flatMap(r => r.status === "fulfilled" ? r.value : []);

  const seen = new Set();
  const uniq = all.filter(a => {
    if (seen.has(a.link)) return false;
    seen.add(a.link);
    return true;
  });

  uniq.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  const out = { updatedAt: new Date().toISOString(), articles: uniq };
  process.stdout.write(JSON.stringify(out, null, 2));
  process.stderr.write(`\n✅ ${uniq.length}개 기사 수집 완료\n`);
}

main().catch(e => { process.stderr.write(e.stack + "\n"); process.exit(1); });
