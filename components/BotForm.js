// Reusable bot create/edit form. Server component — just renders fields bound
// to a server action passed in by the page.

import Appearance from '@/components/Appearance';
import SubmitButton from '@/components/SubmitButton';
import { LIMITS } from '@/lib/bot-limits';

export default function BotForm({ action, bot = {}, submitLabel, pendingLabel = 'กำลังบันทึก…' }) {
  return (
    <form action={action} className="botform">
      <div className="form-sec frame">
        <div className="form-sec-head"><span className="mono-idx">01</span><h2>ข้อมูลบอท</h2></div>
        <label>
          ชื่อบอท
          <input
            name="bot_name"
            defaultValue={bot.bot_name || ''}
            placeholder="บอทช่วยเหลือ Acme"
            maxLength={LIMITS.bot_name}
          />
        </label>

        <label>
          บุคลิกบอท — บอทเป็นใครและทำหน้าที่อะไร
          <textarea
            name="persona"
            rows={4}
            required
            maxLength={LIMITS.persona}
            defaultValue={bot.persona || ''}
            placeholder="คุณเป็นผู้ช่วยของร้าน Acme ตอบเรื่องสินค้า ราคา และการสั่งซื้อ ใช้น้ำเสียงเป็นกันเอง"
          />
        </label>

        <label>
          ขอบเขต — ตอบเรื่องอะไรได้บ้าง
          <input
            name="scope"
            required
            maxLength={LIMITS.scope}
            defaultValue={bot.scope || ''}
            placeholder="สินค้า ราคา การสั่งซื้อ และบริการของ Acme"
          />
        </label>

        <label>
          ช่องทางติดต่อสำรอง — เมื่อตอบไม่ได้ให้ลูกค้าติดต่อที่ไหน
          <input
            name="fallback_contact"
            required
            maxLength={LIMITS.fallback_contact}
            defaultValue={bot.fallback_contact || ''}
            placeholder="อีเมล support@acme.com หรือ LINE @acme"
          />
        </label>

      </div>

      <div className="form-sec frame">
        <div className="form-sec-head"><span className="mono-idx">02</span><h2>ความรู้</h2></div>
        <label>
          สิ่งที่บอทควรรู้ (สูงสุด {LIMITS.knowledge.toLocaleString('th-TH')} ตัวอักษร)
          <textarea
            name="knowledge"
            rows={14}
            required
            maxLength={LIMITS.knowledge}
            defaultValue={bot.knowledge || ''}
            placeholder="วาง FAQ เอกสาร รายละเอียดสินค้า เวลาเปิด หรือนโยบายต่าง ๆ ใช้ข้อความธรรมดาได้"
          />
        </label>

      </div>

      <div className="form-sec frame">
        <div className="form-sec-head"><span className="mono-idx">03</span><h2>การเข้าใช้</h2></div>
        <label>
          โดเมนเว็บที่อนุญาต — คั่นด้วยจุลภาค (เว้นว่างเพื่อใช้ได้ทุกเว็บไซต์)
          <input
            name="allowed_origins"
            defaultValue={(bot.allowed_origins || []).join(', ')}
            placeholder="https://acme.com, https://www.acme.com"
          />
        </label>

      </div>

      <Appearance bot={bot} />

      <div className="form-actions">
        <SubmitButton className="btn big" pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
