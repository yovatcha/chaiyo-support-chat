'use client';

import { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react';
import SectionHead from './SectionHead';

// The real request path of POST /api/chat (app/api/chat/route.js), in order.
const STAGES = [
  {
    key: 'INTAKE',
    title: 'รับข้อความและตรวจรูปแบบ',
    body: 'ผู้ใช้พิมพ์ในหน้าต่างแชทบนเว็บของคุณ วิดเจ็ตส่งข้อความพร้อมประวัติสนทนาสั้นๆ มาที่ API ระบบจะตรวจขนาดและรูปแบบก่อนทำอะไรต่อ',
    chips: ['≤ 500 ตัวอักษร/ข้อความ', '8 เทิร์นล่าสุด', 'body ≤ 16KB'],
    log: ['POST /api/chat', 'body 1.2KB · 3 turns', 'schema ✓'],
  },
  {
    key: 'RATE LIMIT',
    title: 'กันสแปมและกันโควตารั่ว',
    body: 'จำกัดจำนวนข้อความต่อผู้ใช้หนึ่งคนและต่อบอทหนึ่งตัว ถ้ามีคนเอา bot id ไปยิงรัวๆ ก็จะไม่กินโควตาของทั้งระบบ',
    chips: ['10 ข้อความ/นาที/IP', '120 ข้อความ/นาที/บอท', '429 + Retry-After'],
    log: ['ip 203.0.113.7 → 3/10', 'bot_7f2a → 41/120', 'pass ✓'],
  },
  {
    key: 'ORIGIN GUARD',
    title: 'ตรวจว่าเว็บนี้มีสิทธิ์ใช้บอท',
    body: 'โหลดการตั้งค่าบอท (แคชไว้ 60 วินาทีเพื่อความเร็ว) แล้วเทียบโดเมนที่เรียกมากับรายการ allowed origins ที่คุณตั้งไว้ เว็บอื่นจะเอาบอทของคุณไปใช้ไม่ได้',
    chips: ['allowed_origins', 'cache 60s', 'Supabase RLS'],
    log: ['load bot_7f2a (cache hit)', 'origin https://acme.co', 'allowed ✓'],
  },
  {
    key: 'CONTEXT',
    title: 'ประกอบบริบทจากความรู้ของคุณ',
    body: 'นำบุคลิก (persona) ขอบเขต (scope) ช่องทางติดต่อสำรอง และความรู้ที่คุณใส่ไว้ มาประกอบเป็นคำสั่งระบบ บอทจึงตอบเฉพาะเรื่องของคุณและส่งต่อเมื่อไม่แน่ใจ',
    chips: ['<persona>', '<knowledge>', 'fallback contact'],
    log: ['persona 312 chars', 'knowledge 18,402 chars', 'prompt ready ✓'],
  },
  {
    key: 'INFERENCE',
    title: 'ให้โมเดลภาษาคิดคำตอบ',
    body: 'ส่งไปยังโมเดล gpt-oss-120b บน Groq ที่ตอบเร็วระดับเสี้ยววินาที ถ้าโควตาเต็มหรือโมเดลถูกปลด ระบบจะสลับไปใช้ gpt-oss-20b ให้อัตโนมัติ',
    chips: ['gpt-oss-120b', 'fallback → 20b', 'temperature 0.5'],
    log: ['groq · openai/gpt-oss-120b', 'tokens 214 · 380ms', '200 OK ✓'],
  },
  {
    key: 'REPLY',
    title: 'ส่งคำตอบกลับถึงลูกค้า',
    body: 'คำตอบกลับไปแสดงในวิดเจ็ตบนเว็บของคุณ พร้อมสีและข้อความตามแบรนด์ ลูกค้าได้คำตอบทันที ทีมของคุณไม่ต้องตอบคำถามเดิมซ้ำ',
    chips: ['CORS per origin', 'th / en', 'ตอบได้ 24/7'],
    log: ['→ widget', 'render reply', 'done · 0.41s'],
  },
];

const N = STAGES.length;
const ease = [0.22, 1, 0.36, 1];

function StageDetail({ s, i }) {
  return (
    <>
      <div className="stage-top">
        <span className="stage-num">{String(i + 1).padStart(2, '0')}</span>
        <span className="mono-label">STAGE · {s.key}</span>
      </div>
      <h3>{s.title}</h3>
      <p>{s.body}</p>
      <ul className="chips">
        {s.chips.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <pre className="stage-log">
        {s.log.map((l, j) => (
          <span key={j}><b>&gt;</b> {l}{'\n'}</span>
        ))}
      </pre>
    </>
  );
}

export default function How() {
  const reduce = useReducedMotion();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const rail = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setActive((cur) => (cur === next ? cur : next));
  });

  // Jump the page so stage i sits in the middle of its scroll slot.
  function jump(i) {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + run * ((i + 0.5) / N), behavior: reduce ? 'auto' : 'smooth' });
  }

  const s = STAGES[active];

  return (
    <section className="chapter chapter--how" id="how" data-hud="02|HOW">
      <div className="wrap">
        <SectionHead
          idx="02"
          en="HOW IT WORKS"
          title={<>วิธีที่เราทำ: ทุกข้อความผ่าน<br />6 ขั้นตอนก่อนถึงมือลูกค้า</>}
          lead="นี่คือเส้นทางจริงของหนึ่งข้อความในระบบ เลื่อนลงเพื่อตามดูทีละขั้น หรือคลิกที่ชื่อขั้นตอนเพื่อข้ามไปดู"
        />
      </div>

      {/* Desktop: pinned, scroll-scrubbed pipeline. */}
      <div className="how-track" ref={trackRef} style={{ height: `${N * 90 + 60}vh` }}>
        <div className="how-sticky">
          <div className="wrap how-grid">
            <ol className="stage-list" aria-label="ขั้นตอนการทำงาน">
              <motion.span className="stage-rail" style={{ scaleY: rail }} aria-hidden="true" />
              {STAGES.map((st, i) => (
                <li key={st.key}>
                  <button
                    type="button"
                    className={'stage-btn' + (i === active ? ' is-active' : '') + (i < active ? ' is-done' : '')}
                    onClick={() => jump(i)}
                    aria-current={i === active ? 'step' : undefined}
                  >
                    <span className="stage-dot" aria-hidden="true" />
                    <span className="mono-label">{String(i + 1).padStart(2, '0')} · {st.key}</span>
                    <span className="stage-btn-title">{st.title}</span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="stage-stage">
              {/* Pipeline strip — the packet hops node to node. */}
              <div className="pipe" aria-hidden="true">
                <div className="pipe-line" />
                <motion.div
                  className="pipe-fill"
                  animate={{ scaleX: active / (N - 1) }}
                  transition={reduce ? { duration: 0 } : { duration: 0.6, ease }}
                />
                {STAGES.map((st, i) => (
                  <span
                    key={st.key}
                    className={'pipe-node' + (i <= active ? ' on' : '')}
                    style={{ left: `${(i / (N - 1)) * 100}%` }}
                  />
                ))}
                <motion.span
                  className="pipe-packet"
                  animate={{ left: `${(active / (N - 1)) * 100}%` }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 18 }}
                />
                <span className="pipe-end pipe-end--l mono-label">WIDGET</span>
                <span className="pipe-end pipe-end--r mono-label">WIDGET</span>
              </div>

              <div className="stage-card frame">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={reduce ? false : { opacity: 0, y: 18, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={reduce ? { opacity: 1 } : { opacity: 0, y: -12, filter: 'blur(4px)' }}
                    transition={{ duration: reduce ? 0 : 0.4, ease }}
                  >
                    <StageDetail s={s} i={active} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: a plain stepper that reveals as you scroll. */}
      <ol className="wrap how-mobile">
        {STAGES.map((st, i) => (
          <motion.li
            key={st.key}
            className="frame"
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true, margin: '-10% 0px' },
                  transition: { duration: 0.6, ease },
                })}
          >
            <StageDetail s={st} i={i} />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
