// Fetches a page (and optionally a few same-site pages it links to) and turns
// the readable content into markdown for a bot's knowledge field. Server-only:
// it resolves DNS so it can refuse private addresses (SSRF guard).

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';

export const MAX_PAGES = 20;

const USER_AGENT = 'ChaiyoSupportBot/1.0 (+https://supportchat.chaiyoyo.com)';
const PAGE_TIMEOUT_MS = 8000;
const TOTAL_TIMEOUT_MS = 25000;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const CONCURRENCY = 3;
const MIN_CONTENT_CHARS = 80;
const FILE_EXT = /\.(pdf|zip|rar|7z|gz|tar|png|jpe?g|gif|webp|svg|ico|mp3|mp4|mov|avi|webm|docx?|xlsx?|pptx?|exe|dmg|apk|css|js|json|xml)$/i;
const STRIP = 'script, style, noscript, nav, footer, header, form, iframe, svg, canvas, template';

// Errors whose message is safe (and meant) to show the bot owner.
export class CrawlError extends Error {}

// ── URL + address checks ────────────────────────────────────────────────────

function isPrivateV4(ip) {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIp(ip) {
  if (isIP(ip) === 4) return isPrivateV4(ip);
  const v6 = ip.toLowerCase();
  if (v6 === '::' || v6 === '::1') return true;
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return /^(fc|fd|fe[89ab]|ff)/.test(v6);
}

// Throws unless the URL is a plain http(s) URL whose host resolves only to
// public addresses.
async function assertPublicUrl(url) {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new CrawlError('รองรับเฉพาะลิงก์ http และ https');
  }
  if (url.username || url.password) throw new CrawlError('URL ต้องไม่มีชื่อผู้ใช้หรือรหัสผ่าน');
  if (url.port && !['80', '443', '8080', '8443'].includes(url.port)) {
    throw new CrawlError('ไม่รองรับพอร์ตนี้');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new CrawlError('ไม่อนุญาตให้ดึงข้อมูลจากที่อยู่ภายใน');
  }
  let addrs;
  try {
    addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new CrawlError('ไม่พบเว็บไซต์นี้ ตรวจสอบ URL อีกครั้ง');
  }
  if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) {
    throw new CrawlError('ไม่อนุญาตให้ดึงข้อมูลจากที่อยู่ภายใน');
  }
}

// ── fetching ────────────────────────────────────────────────────────────────

async function readCapped(res) {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

// Follows redirects by hand so every hop goes through assertPublicUrl.
async function safeFetch(startUrl, signal, accept = 'text/html,text/plain;q=0.9') {
  let url = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(url);
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': USER_AGENT, Accept: accept, 'Accept-Language': 'th,en;q=0.8' },
      signal: AbortSignal.any([signal, AbortSignal.timeout(PAGE_TIMEOUT_MS)]),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      res.body?.cancel().catch(() => {});
      url = new URL(res.headers.get('location'), url);
      continue;
    }
    return { res, url };
  }
  throw new CrawlError('เว็บไซต์ redirect หลายครั้งเกินไป');
}

// Disallow prefixes for `User-agent: *` (or our own agent) from robots.txt.
async function robotsRules(origin, signal) {
  try {
    const { res } = await safeFetch(new URL('/robots.txt', origin), signal, 'text/plain');
    if (!res.ok) return [];
    const text = await readCapped(res);
    const rules = [];
    let applies = false;
    let inAgents = false;
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.replace(/#.*/, '').trim();
      const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
      if (!m) continue;
      const key = m[1].toLowerCase();
      const value = m[2].trim();
      if (key === 'user-agent') {
        if (!inAgents) applies = false;
        inAgents = true;
        if (value === '*' || /chaiyosupportbot/i.test(value)) applies = true;
      } else {
        inAgents = false;
        if (applies && key === 'disallow' && value) rules.push(value.replace(/\*.*$/, ''));
      }
    }
    return rules.filter(Boolean);
  } catch {
    return [];
  }
}

// ── extraction ──────────────────────────────────────────────────────────────

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
turndown.remove(['img', 'picture', 'video', 'audio', 'button', 'input', 'select']);

function tidy(md) {
  return md
    .replace(/\[\s*\]\([^)]*\)/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extract(html, url) {
  const { document } = parseHTML(html);
  const links = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  const title = (document.querySelector('title')?.textContent || '').trim();

  document.querySelectorAll(STRIP).forEach((el) => el.remove());

  let contentHtml = '';
  try {
    const article = new Readability(document.cloneNode(true)).parse();
    if (article?.content && (article.textContent || '').trim().length >= MIN_CONTENT_CHARS) {
      contentHtml = article.content;
    }
  } catch {
    // fall through to <main>/<body>
  }
  if (!contentHtml) {
    contentHtml = (document.querySelector('main') || document.querySelector('[role=main]') || document.body)?.innerHTML || '';
  }

  return { title: title || url.pathname, markdown: tidy(turndown.turndown(contentHtml)), links };
}

function normalise(href, base) {
  try {
    const url = new URL(href, base);
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

// ── crawl ───────────────────────────────────────────────────────────────────

export async function crawl(startUrl, { maxPages = 1, charBudget = Infinity } = {}) {
  const limit = Math.min(Math.max(1, maxPages | 0), MAX_PAGES);
  const signal = AbortSignal.timeout(TOTAL_TIMEOUT_MS);
  const start = normalise(startUrl.href, startUrl);
  await assertPublicUrl(start);

  const disallow = await robotsRules(start.origin, signal);
  const allowed = (url) => !disallow.some((prefix) => url.pathname.startsWith(prefix));
  if (!allowed(start)) throw new CrawlError('เว็บไซต์นี้ไม่อนุญาตให้ดึงข้อมูลหน้านี้ (robots.txt)');

  const queue = [start];
  const seen = new Set([start.href]);
  const pages = [];
  const sections = [];
  let used = 0;
  let truncated = false;
  let skipped = 0;
  let firstError = null;

  async function visit(url) {
    const { res, url: finalUrl } = await safeFetch(url, signal);
    if (!res.ok) {
      res.body?.cancel().catch(() => {});
      throw new CrawlError(`เปิดหน้าเว็บไม่สำเร็จ (HTTP ${res.status})`);
    }
    const type = res.headers.get('content-type') || '';
    if (!/text\/(html|plain)|application\/xhtml/i.test(type)) {
      res.body?.cancel().catch(() => {});
      throw new CrawlError('ลิงก์นี้ไม่ใช่หน้าเว็บ');
    }
    const body = await readCapped(res);
    if (/text\/plain/i.test(type)) return { url: finalUrl, title: finalUrl.pathname, markdown: tidy(body), links: [] };
    return { url: finalUrl, ...extract(body, finalUrl) };
  }

  while (queue.length && pages.length < limit && !truncated && !signal.aborted) {
    const batch = queue.splice(0, Math.min(CONCURRENCY, limit - pages.length));
    const results = await Promise.allSettled(batch.map(visit));

    for (const result of results) {
      if (result.status === 'rejected') {
        skipped++;
        firstError ??= result.reason;
        continue;
      }
      const page = result.value;

      if (pages.length + queue.length < limit * 3) {
        for (const href of page.links) {
          const next = normalise(href, page.url);
          if (!next || next.origin !== start.origin || seen.has(next.href)) continue;
          if (FILE_EXT.test(next.pathname) || !allowed(next)) continue;
          seen.add(next.href);
          queue.push(next);
        }
      }

      if (page.markdown.length < MIN_CONTENT_CHARS || pages.length >= limit) {
        skipped++;
        continue;
      }
      let section = `## ${page.title}\nที่มา: ${page.url.href}\n\n${page.markdown}`;
      const room = charBudget - used - (sections.length ? 2 : 0);
      if (room <= MIN_CONTENT_CHARS) {
        truncated = true;
        break;
      }
      if (section.length > room) {
        section = section.slice(0, room).replace(/\s+\S*$/, '');
        truncated = true;
      }
      sections.push(section);
      used += section.length + (sections.length > 1 ? 2 : 0);
      pages.push({ url: page.url.href, title: page.title, chars: section.length });
    }
  }

  if (!pages.length) {
    if (firstError instanceof CrawlError) throw firstError;
    if (firstError?.name === 'TimeoutError' || signal.aborted) throw new CrawlError('หมดเวลาในการดึงข้อมูล ลองใหม่อีกครั้ง');
    if (firstError) throw new CrawlError('เชื่อมต่อเว็บไซต์ไม่สำเร็จ');
    throw new CrawlError('ไม่พบเนื้อหาในหน้านี้ (เว็บอาจสร้างเนื้อหาด้วย JavaScript) ลองคัดลอกข้อความมาวางเอง');
  }

  return { markdown: sections.join('\n\n'), pages, truncated, skipped };
}
