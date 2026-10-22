'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import SectionHead from './SectionHead';
import { ACCENT_PRESETS, BG_PRESETS } from '@/lib/appearance-presets';
import { widgetTheme, readableOn, luminance } from '@/lib/color';

const STEPS = [
  { key: 'SIGN UP', title: 'สมัครบัญชี', time: '30 วินาที' },
  { key: 'TEACH', title: 'สร้างบอท + ใส่ความรู้', time: '3 นาที' },
  { key: 'STYLE', title: 'ปรับหน้าตา', time: '1 นาที' },
  { key: 'EMBED', title: 'วางสคริปต์บนเว็บ', time: '10 วินาที' },
];

const ROTATE_MS = 6500;
const ease = [0.22, 1, 0.36, 1];

// Types `text` out character by character while mounted.
function useTyped(text, speed = 28, start = 250) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  useEffect(() => {
    if (reduce) return;
    let i = 0;
    let iv;
    const t = setTimeout(() => {
      iv = setInterval(() => {
        i += 1;
        setN(i);
        if (i >= text.length) clearInterval(iv);
      }, speed);
    }, start);
    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, [text, speed, start, reduce]);
  return text.slice(0, n);
}

function MockSignup() {
  const email = useTyped('owner@acme.co', 55);
  return (
    <div className="mock mock-auth">
      <span className="mono-label">/signup</span>
      <h4>สร้างบัญชี Yo-bot</h4>
      <div className="mock-field"><span>Email</span><div className="mock-input">{email}<i className="caret" /></div></div>
      <div className="mock-field"><span>Password</span><div className="mock-input">••••••••••</div></div>
      <div className="mock-btn">Create account</div>
      <p className="mock-note">ยืนยันอีเมล แล้วเข้าสู่แดชบอร์ดได้ทันที</p>
    </div>
  );
}

function MockTeach() {
  const persona = useTyped('คุณคือผู้ช่วยของร้าน Acme ตอบสุภาพ เป็นกันเอง', 30);
  const knowledge = useTyped(
    'เวลาเปิด: ทุกวัน 09:00–20:00\nค่าส่ง: 50 บาท ฟรีเมื่อครบ 990\nคืนสินค้า: ภายใน 7 วัน',
    22,
    1400
  );
  return (
    <div className="mock mock-form">
      <span className="mono-label">/dashboard/bots/new</span>
      <div className="mock-field"><span>Bot name</span><div className="mock-input">Acme Support</div></div>
      <div className="mock-field"><span>Persona</span><div className="mock-input">{persona}</div></div>
      <div className="mock-field">
        <span>Knowledge</span>
        <div className="mock-input mock-area">{knowledge}<i className="caret" /></div>
      </div>
      <div className="mock-field"><span>Fallback contact</span><div className="mock-input">LINE @acme</div></div>
    </div>
  );
}

function MockStyle({ onTouch }) {
  const [accent, setAccent] = useState('#cc2b22');
  const [bg, setBg] = useState('#0a0c14');
  const font = luminance(bg) > 0.6 ? '#1a1b1e' : '#eef1f8';
  const t = widgetTheme(accent, bg, font);
  const grad = `linear-gradient(135deg, ${t.accent}, ${t.accent2})`;

  return (
    <div className="mock mock-style">
      <div className="mock-style-controls">
        <span className="mono-label">ACCENT</span>
        <div className="swatches">
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={'swatch' + (p.value === accent ? ' active' : '')}
              style={{ background: p.value }}
              aria-label={p.name}
              aria-pressed={p.value === accent}
              onClick={() => { setAccent(p.value); onTouch(); }}
            />
          ))}
        </div>
        <span className="mono-label">BACKGROUND</span>
        <div className="swatches">
          {BG_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={'swatch' + (p.value === bg ? ' active' : '')}
              style={{ background: p.value }}
              aria-label={p.name}
              aria-pressed={p.value === bg}
              onClick={() => { setBg(p.value); onTouch(); }}
            />
          ))}
        </div>
        <p className="mock-note">ลองกดเลือกสีดู ตัวอย่างด้านขวาเปลี่ยนตามทันที เหมือนในแดชบอร์ดจริง</p>
      </div>

      <div className="cp-panel" style={{ background: t.bg, color: t.font, borderColor: t.border }}>
        <div className="cp-head" style={{ borderColor: t.border }}>
          <span className="cp-dot" style={{ background: t.accent2, boxShadow: `0 0 8px ${t.accent2}` }} />
          <div>
            <div className="cp-title">Acme Support</div>
            <div className="cp-sub" style={{ color: t.muted }}>ผู้ช่วย AI · ถามได้เลย</div>
          </div>
        </div>
        <div className="cp-log">
          <div className="cp-msg cp-msg--bot" style={{ background: t.card, borderColor: t.border }}>
            สวัสดีครับ มีอะไรให้ช่วยไหมครับ
          </div>
          <div className="cp-msg cp-msg--user" style={{ background: grad, color: t.accentFg }}>
            ค่าส่งเท่าไหร่ครับ
          </div>
          <div className="cp-msg cp-msg--bot" style={{ background: t.card, borderColor: t.border }}>
            50 บาทครับ สั่งครบ 990 ส่งฟรี
          </div>
        </div>
        <div className="cp-form" style={{ borderColor: t.border }}>
          <span className="cp-input" style={{ background: t.card, borderColor: t.border, color: t.muted }}>
            พิมพ์ข้อความ…
          </span>
          <span className="cp-send" style={{ background: grad, color: readableOn(accent) }}>ส่ง</span>
        </div>
      </div>
    </div>
  );
}

function MockEmbed({ onTouch }) {
  const [copied, setCopied] = useState(false);
  const snippet =
    '<script src="https://supportchat.chaiyoyo.com/yo-bot.js"\n        data-bot="bot_7f2a91c04e" defer></script>';

  async function copy() {
    onTouch();
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — the text is still selectable
    }
  }

  return (
    <div className="mock mock-embed">
      <span className="mono-label">index.html</span>
      <pre className="code-strip">
        <span className="tok-dim">&lt;body&gt;{'\n'}  …{'\n'}</span>
        {'  '}<span className="tok-tag">&lt;script</span> <span className="tok-attr">src</span>=<span className="tok-str">&quot;https://supportchat.chaiyoyo.com/yo-bot.js&quot;</span>{'\n'}
        {'          '}<span className="tok-attr">data-bot</span>=<span className="tok-str">&quot;bot_7f2a91c04e&quot;</span> <span className="tok-attr">defer</span><span className="tok-tag">&gt;&lt;/script&gt;</span>{'\n'}
        <span className="tok-dim">&lt;/body&gt;</span>
      </pre>
      <div className="mock-embed-row">
        <button type="button" className="btn" onClick={copy}>{copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกโค้ด'}</button>
        <p className="mock-note">วางก่อนปิดแท็ก &lt;/body&gt; เสร็จแล้ว ปุ่มแชทจะขึ้นที่มุมขวาล่าง — แบบเดียวกับที่มุมจอนี้</p>
      </div>
    </div>
  );
}

export default function HowToUse() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const tabsRef = useRef(null);

  // On narrow screens the tabs are a horizontal strip — keep the active one
  // visible without scrolling the page itself.
  useEffect(() => {
    const list = tabsRef.current;
    const tab = list?.children[step];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: tab.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
  }, [step, reduce]);

  useEffect(() => {
    if (!auto || reduce) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), ROTATE_MS);
    return () => clearTimeout(t);
  }, [step, auto, reduce]);

  const stop = () => setAuto(false);

  return (
    <section className="chapter" id="use" data-hud="03|USE">
      <div className="wrap">
        <SectionHead
          idx="03"
          en="HOW TO USE"
          title={<>วิธีใช้: จากศูนย์จนบอทออนไลน์<br />ใน 4 ขั้นตอน</>}
          lead="ไม่ต้องเขียนโค้ด ไม่ต้องตั้งเซิร์ฟเวอร์ ทุกอย่างทำในแดชบอร์ด แล้วคัดลอกโค้ดบรรทัดเดียวไปวาง"
        />

        <div className="use">
          <div className="use-tabs" ref={tabsRef} role="tablist" aria-label="ขั้นตอนการใช้งาน">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                id={'use-tab-' + i}
                aria-selected={i === step}
                aria-controls="use-panel"
                className={'use-tab' + (i === step ? ' is-active' : '')}
                onClick={() => { setStep(i); stop(); }}
              >
                <span className="use-tab-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="use-tab-body">
                  <span className="mono-label">{s.key} · {s.time}</span>
                  <span className="use-tab-title">{s.title}</span>
                </span>
                {i === step && auto && !reduce ? (
                  <motion.span
                    key={'bar' + step}
                    className="use-tab-bar"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <div className="use-panel frame" id="use-panel" role="tabpanel" aria-labelledby={'use-tab-' + step} onPointerDown={stop}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 1 } : { opacity: 0, x: -24 }}
                transition={{ duration: reduce ? 0 : 0.35, ease }}
              >
                {step === 0 && <MockSignup />}
                {step === 1 && <MockTeach />}
                {step === 2 && <MockStyle onTouch={stop} />}
                {step === 3 && <MockEmbed onTouch={stop} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="use-foot">
          <Link href="/signup" className="btn big">เริ่มขั้นตอนที่ 01 เลย <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
