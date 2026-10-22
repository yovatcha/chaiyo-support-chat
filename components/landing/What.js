'use client';

import { motion, useReducedMotion } from 'motion/react';
import SectionHead from './SectionHead';

const PAINS = [
  'ลูกค้าทักมาตอนตีสอง แต่ทีมตอบได้ตอนเก้าโมง',
  'คำถามเดิมซ้ำทุกวัน — เวลาเปิด ค่าส่ง วิธีชำระเงิน',
  'แชทบอททั่วไปตอบมั่ว ออกนอกเรื่อง และทำให้แบรนด์เสียความน่าเชื่อถือ',
];

const CAPS = [
  {
    code: 'CAP.01',
    title: 'ตอบจากความรู้ของคุณเท่านั้น',
    body: 'วาง FAQ เอกสาร นโยบาย หรือรายละเอียดสินค้า แล้วกำหนดขอบเขตคำตอบได้เอง เรื่องที่ตอบไม่ได้ บอทจะแนะนำช่องทางติดต่อทีมของคุณแทนการเดา',
    spec: 'persona + scope + knowledge → system prompt',
  },
  {
    code: 'CAP.02',
    title: 'ติดตั้งด้วยสคริปต์บรรทัดเดียว',
    body: 'ไม่ต้องใช้เฟรมเวิร์ก ไม่ต้อง build — ใช้ได้กับ WordPress, Shopify, Wix หรือ HTML ธรรมดา วางแท็กเดียว ปุ่มแชทก็พร้อมใช้งาน',
    spec: '<script src="…/yo-bot.js" data-bot="…">',
  },
  {
    code: 'CAP.03',
    title: 'หน้าตาเป็นแบรนด์ของคุณ',
    body: 'เลือกสี ชื่อ คำทักทาย และข้อความในช่องพิมพ์ พร้อมดูตัวอย่างก่อนบันทึก ภาษา UI ไทยหรืออังกฤษจะปรับตามเบราว์เซอร์',
    spec: 'accent · bg · font · th / en',
  },
];

const ease = [0.22, 1, 0.36, 1];

export default function What() {
  const reduce = useReducedMotion();

  return (
    <section className="chapter" id="what" data-hud="01|WHAT">
      <div className="wrap">
        <SectionHead
          idx="01"
          en="WHAT WE DO"
          title={<>สิ่งที่เราทำ: ให้เว็บไซต์ของคุณ<br />มีทีมซัพพอร์ตที่ไม่เคยหลับ</>}
          lead="Yo-bot คือแพลตฟอร์มแชทซัพพอร์ต AI — คุณกำหนดความรู้ น้ำเสียง และหน้าตาบนเว็บไซต์ได้เอง"
        />

        <div className="pain">
          <span className="mono-label pain-label">{'// ปัญหาที่เราแก้'}</span>
          <ul>
            {PAINS.map((p, i) => (
              <motion.li
                key={p}
                {...(reduce
                  ? {}
                  : {
                      initial: { opacity: 0, x: -16 },
                      whileInView: { opacity: 1, x: 0 },
                      viewport: { once: true, margin: '-10% 0px' },
                      transition: { duration: 0.6, ease, delay: i * 0.1 },
                    })}
              >
                <span className="pain-x" aria-hidden="true">×</span>
                {p}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="caps">
          {CAPS.map((c, i) => (
            <motion.article
              key={c.code}
              className="cap frame"
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 40 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: '-10% 0px' },
                    transition: { duration: 0.8, ease, delay: i * 0.12 },
                  })}
            >
              <span className="mono-label cap-code">{c.code}</span>
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <code className="cap-spec">{c.spec}</code>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
