'use client';

import { useState, useTransition } from 'react';
import { importFromUrl } from '@/app/dashboard/crawl-actions';
import { LIMITS } from '@/lib/bot-limits';

// The knowledge textarea plus an "import from website" row that crawls a URL
// on the server and appends the extracted text for the owner to review.
export default function KnowledgeField({ defaultValue = '' }) {
  const [text, setText] = useState(defaultValue);
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState('1');
  const [status, setStatus] = useState(null);
  const [pending, startTransition] = useTransition();

  function runImport() {
    if (!url.trim() || pending) return;
    setStatus(null);
    startTransition(async () => {
      const res = await importFromUrl({ url, maxPages: Number(maxPages), currentLength: text.length });
      if (!res.ok) {
        setStatus({ error: res.error });
        return;
      }
      setText((prev) => {
        const joined = prev.trim() ? `${prev.trimEnd()}\n\n${res.markdown}` : res.markdown;
        return joined.slice(0, LIMITS.knowledge);
      });
      setStatus({ pages: res.pages, truncated: res.truncated });
      setUrl('');
    });
  }

  return (
    <>
      <div className="field kb-import">
        <span className="field-label">นำเข้าจากเว็บไซต์ — ดึงเนื้อหาจากหน้าเว็บมาเติมในช่องความรู้ด้านล่าง</span>
        <div className="kb-import-row">
          <input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                runImport();
              }
            }}
            placeholder="https://acme.com/faq"
            aria-label="URL ของหน้าเว็บ"
          />
          <select value={maxPages} onChange={(e) => setMaxPages(e.target.value)} aria-label="จำนวนหน้า">
            <option value="1">หน้านี้หน้าเดียว</option>
            <option value="5">สูงสุด 5 หน้า</option>
            <option value="10">สูงสุด 10 หน้า</option>
          </select>
          <button type="button" className="btn secondary" onClick={runImport} disabled={pending || !url.trim()} aria-busy={pending}>
            {pending ? 'กำลังดึงข้อมูล…' : 'นำเข้า'}
          </button>
        </div>
        {status?.error && <p className="kb-import-status error" role="alert">{status.error}</p>}
        {status?.pages && (
          <div className="kb-import-status" role="status">
            นำเข้า {status.pages.length} หน้าแล้ว ตรวจทานข้อความก่อนบันทึก
            {status.truncated && ' (ตัดบางส่วนออกเพราะเกินจำนวนตัวอักษรสูงสุด)'}
            <ul>
              {status.pages.map((p) => (
                <li key={p.url}>
                  <a href={p.url} target="_blank" rel="noreferrer">{p.title}</a>{' '}
                  <span className="muted">· {p.chars.toLocaleString('th-TH')} ตัวอักษร</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <label>
        สิ่งที่บอทควรรู้ ({text.length.toLocaleString('th-TH')} / {LIMITS.knowledge.toLocaleString('th-TH')} ตัวอักษร)
        <textarea
          name="knowledge"
          rows={14}
          required
          maxLength={LIMITS.knowledge}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="วาง FAQ เอกสาร รายละเอียดสินค้า เวลาเปิด หรือนโยบายต่าง ๆ ใช้ข้อความธรรมดาได้"
        />
      </label>
    </>
  );
}
