'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';

// Fixed console readout: page progress as 0.000 → 1.000 plus the chapter
// currently in view. Chapters opt in with data-hud="NN|NAME".
export default function ScrollHUD() {
  const { scrollYProgress } = useScroll();
  const [p, setP] = useState(0);
  const [stage, setStage] = useState(['00', 'START']);

  useMotionValueEvent(scrollYProgress, 'change', (v) => setP(v));

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-hud]'));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setStage(e.target.dataset.hud.split('|'));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.div className="hud-bar" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <div className="hud" aria-hidden="true">
        <div className="hud-row">
          <span className="hud-k">PROGRESS</span>
          <span className="hud-v">{p.toFixed(3)}</span>
        </div>
        <div className="hud-row">
          <span className="hud-k">STAGE {stage[0]}</span>
          <span className="hud-v hud-v--red">{stage[1]}</span>
        </div>
      </div>
    </>
  );
}
