'use server';

import { createClient } from '@/lib/supabase/server';
import { LIMITS } from '@/lib/bot-limits';
import { crawl, CrawlError, MAX_PAGES } from '@/lib/crawler';

// Fetch a website and return its readable content as markdown, sized to fit
// what's left of the knowledge field. Nothing is saved here — the dashboard
// appends the text to the form and the owner saves it as usual.
export async function importFromUrl({ url, maxPages = 1, currentLength = 0 } = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'กรุณาเข้าสู่ระบบอีกครั้ง' };

  const raw = String(url || '').trim();
  let target;
  try {
    target = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!target.hostname.includes('.')) throw new Error();
  } catch {
    return { ok: false, error: 'URL ไม่ถูกต้อง' };
  }

  const charBudget = Math.max(0, LIMITS.knowledge - (Number(currentLength) || 0));
  if (charBudget < 200) {
    return { ok: false, error: 'ช่องความรู้เกือบเต็มแล้ว ลบข้อความบางส่วนก่อนนำเข้า' };
  }

  try {
    const pages = Math.min(Math.max(1, Number(maxPages) || 1), MAX_PAGES);
    const result = await crawl(target, { maxPages: pages, charBudget });
    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof CrawlError) return { ok: false, error: err.message };
    console.error('importFromUrl error', err);
    return { ok: false, error: 'ดึงข้อมูลจากเว็บไซต์ไม่สำเร็จ กรุณาลองอีกครั้ง' };
  }
}
