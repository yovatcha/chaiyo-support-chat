'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Brand from '@/components/Brand';

const LINKS = [
  { href: '#what', idx: '01', label: 'สิ่งที่เราทำ' },
  { href: '#how', idx: '02', label: 'ทำงานอย่างไร' },
  { href: '#use', idx: '03', label: 'วิธีใช้' },
];

// Marketing nav: transparent over the hero, frosted once the page scrolls.
export default function SiteNav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={'sitenav' + (solid ? ' sitenav--solid' : '')}>
      <Brand href="/" />
      <ul className="sitenav-links">
        {LINKS.map((l) => (
          <li key={l.href}>
            <a href={l.href}>
              <span className="mono-idx">{l.idx}</span>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="sitenav-cta">
        <Link href="/login" className="btn ghost">เข้าสู่ระบบ</Link>
        <Link href="/signup" className="btn">เริ่มสร้างบอท</Link>
      </div>
    </nav>
  );
}
