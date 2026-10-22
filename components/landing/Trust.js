'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

const STATS = [
  { value: 10, unit: '/นาที', label: 'ข้อความต่อผู้ใช้หนึ่งคน', code: 'RATE.IP' },
  { value: 120, unit: '/นาที', label: 'ข้อความต่อบอทหนึ่งตัว', code: 'RATE.BOT' },
  { value: 500, unit: 'ตัวอักษร', label: 'ความยาวสูงสุดต่อข้อความ', code: 'MSG.MAX' },
  { value: 100, unit: '%', label: 'ข้อมูลแยกตามเจ้าของด้วย Row Level Security', code: 'DB.RLS' },
];

function Count({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to, reduce]);

  return <span ref={ref}>{n}</span>;
}

export default function Trust() {
  return (
    <section className="trust" data-hud="04|TRUST">
      <div className="wrap">
        <div className="trust-label"><span className="mono-label">04 — GUARDRAILS</span><h3>ปลอดภัยตั้งแต่ค่าเริ่มต้น</h3></div>
        <div className="trust-grid">
          {STATS.map((s) => (
            <div className="trust-cell" key={s.code}>
              <span className="mono-label">{s.code}</span>
              <div className="trust-num">
                <Count to={s.value} />
                <small>{s.unit}</small>
              </div>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
