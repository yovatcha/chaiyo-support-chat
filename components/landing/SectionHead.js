'use client';

import { motion, useReducedMotion } from 'motion/react';

// "01 — WHAT WE DO" header used by every landing chapter. A red scan line
// sweeps across the rule the first time the heading scrolls into view.
export default function SectionHead({ idx, en, title, lead, align = 'left' }) {
  const reduce = useReducedMotion();
  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-15% 0px' },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <header className={'sec-head sec-head--' + align}>
      <div className="sec-rule">
        <span className="mono-label">
          <span className="sec-idx">{idx}</span> — {en}
        </span>
        <span className="sec-line">
          {!reduce && (
            <motion.span
              className="sec-scan"
              initial={{ scaleX: 0, opacity: 1 }}
              whileInView={{ scaleX: 1, opacity: [1, 1, 0.35] }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
            />
          )}
        </span>
      </div>
      <motion.h2 {...reveal}>{title}</motion.h2>
      {lead ? (
        <motion.p className="sec-lead" {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
          {lead}
        </motion.p>
      ) : null}
    </header>
  );
}
