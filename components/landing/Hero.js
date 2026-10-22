'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

// Scripted conversation played in the hero console. Each turn is shown in
// order, then the log clears and the loop starts over.
const SCRIPT = [
  { who: 'user', text: 'ร้านเปิดกี่โมงครับ' },
  { who: 'bot', text: 'เปิดทุกวัน 09:00–20:00 น. ครับ วันหยุดนักขัตฤกษ์ก็เปิดตามปกติ' },
  { who: 'user', text: 'ส่งของต่างจังหวัดไหม' },
  { who: 'bot', text: 'ส่งทั่วประเทศครับ 2–3 วันทำการ สั่งครบ 990 บาทส่งฟรี' },
  { who: 'user', text: 'ขอคุยกับเจ้าหน้าที่' },
  { who: 'bot', text: 'ได้เลยครับ ติดต่อทีมงานได้ที่ LINE @yo-shop หรือโทร 02-123-4567' },
];

const ease = [0.22, 1, 0.36, 1];

function Console() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? SCRIPT.length : 0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (reduce) {
      setShown(SCRIPT.length);
      return;
    }
    let t;
    if (shown >= SCRIPT.length) {
      t = setTimeout(() => setShown(0), 3600);
    } else if (SCRIPT[shown].who === 'bot') {
      setTyping(true);
      t = setTimeout(() => {
        setTyping(false);
        setShown((n) => n + 1);
      }, 1300);
    } else {
      t = setTimeout(() => setShown((n) => n + 1), shown === 0 ? 700 : 1100);
    }
    return () => clearTimeout(t);
  }, [shown, reduce]);

  return (
    <div className="console frame">
      <div className="console-bar">
        <span className="console-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="mono-label">yo-bot · live session</span>
        <span className="console-status"><span className="pulse" /> ONLINE</span>
      </div>
      <div className="console-log" aria-label="ตัวอย่างบทสนทนา">
        <AnimatePresence initial={false}>
          {SCRIPT.slice(0, shown).map((m, i) => (
            <motion.div
              key={i}
              className={'c-msg c-msg--' + m.who}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.45, ease }}
            >
              <span className="c-who">{m.who === 'bot' ? 'BOT' : 'USER'}</span>
              {m.text}
            </motion.div>
          ))}
          {typing && (
            <motion.div
              key="typing"
              className="c-msg c-msg--bot c-typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="c-who">BOT</span>
              <span className="dots"><i /><i /><i /></span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="console-foot">
        <span className="mono-label">model</span> gpt-oss-120b
        <span className="sep">/</span>
        <span className="mono-label">latency</span> ~0.4s
        <span className="sep">/</span>
        <span className="mono-label">source</span> knowledge.txt
      </div>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const up = (d) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease, delay: d },
        };

  return (
    <section className="hero" id="top" data-hud="00|START">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-copy">
          <motion.span className="mono-label hero-kicker" {...up(0.05)}>
            <span className="tick" /> AI SUPPORT CHAT · v1
          </motion.span>
          <motion.h1 {...up(0.12)}>
            <span className="nowrap">แชทซัพพอร์ต AI</span>
            <br />
            ที่ตอบได้<span className="hl">จริง</span>
          </motion.h1>
          <motion.p className="hero-lead" {...up(0.22)}>
            ใส่ความรู้ของธุรกิจคุณ ตั้งบุคลิกให้บอท แล้วติดตั้งบนเว็บไซต์ด้วย
            <span className="mono-inline">&lt;script&gt;</span> บรรทัดเดียว
            บอทจะตอบลูกค้าตลอด 24 ชั่วโมง และตอบเฉพาะสิ่งที่คุณสอนเท่านั้น
          </motion.p>
          <motion.div className="hero-cta" {...up(0.32)}>
            <Link href="/signup" className="btn big">
              เริ่มสร้างบอท <span aria-hidden="true">→</span>
            </Link>
            <a href="#how" className="btn ghost big">ดูวิธีทำงาน</a>
          </motion.div>
          <motion.dl className="hero-specs" {...up(0.42)}>
            <div><dt>SETUP</dt><dd>~5 นาที</dd></div>
            <div><dt>EMBED</dt><dd>1 บรรทัด</dd></div>
            <div><dt>UPTIME</dt><dd>24/7</dd></div>
          </motion.dl>
        </div>

        <motion.div
          className="hero-visual"
          {...(reduce
            ? {}
            : {
                initial: { opacity: 0, scale: 0.96, y: 30 },
                animate: { opacity: 1, scale: 1, y: 0 },
                transition: { duration: 1.1, ease, delay: 0.25 },
              })}
        >
          <Console />
        </motion.div>
      </div>

      <a href="#what" className="scroll-cue">
        <span className="mono-label">SCROLL TO DIVE IN</span>
        <span className="scroll-cue-line" aria-hidden="true" />
      </a>
    </section>
  );
}
