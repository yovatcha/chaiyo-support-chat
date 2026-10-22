'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Brand from '@/components/Brand';

const NAV = [
  { href: '/dashboard', idx: '01', label: 'บอท', exact: true },
  { href: '/dashboard/bots/new', idx: '02', label: 'สร้างบอท', exact: true },
];

// Dashboard sidebar. On narrow screens it collapses into a top bar whose
// menu button slides the rail in.
export default function DashNav({ email, signOut }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  const isActive = (n) =>
    n.exact ? path === n.href : path.startsWith(n.href);
  const editing = path.startsWith('/dashboard/bots/') && path !== '/dashboard/bots/new';

  return (
    <>
      <header className="dash-mobilebar">
        <Brand href="/dashboard" />
        <button
          type="button"
          className="dash-menu"
          aria-expanded={open}
          aria-controls="dash-rail"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="mono-label">{open ? 'CLOSE' : 'MENU'}</span>
        </button>
      </header>

      <aside id="dash-rail" className={'dash-rail' + (open ? ' is-open' : '')}>
        <Brand href="/dashboard" />
        <span className="mono-label dash-rail-label">CONSOLE</span>
        <nav>
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={'dash-link' + (isActive(n) ? ' is-active' : '')}>
                  <span className="mono-idx">{n.idx}</span>
                  {n.label}
                </Link>
              </li>
            ))}
            {editing ? (
              <li>
                <span className="dash-link is-active">
                  <span className="mono-idx">↳</span>
                  แก้ไขบอท
                </span>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="dash-rail-foot">
          <span className="mono-label">SIGNED IN</span>
          <span className="dash-email" title={email}>{email}</span>
          <form action={signOut}>
            <button className="btn ghost full">ออกจากระบบ</button>
          </form>
        </div>
      </aside>
      {open ? <button type="button" className="dash-scrim" aria-label="ปิดเมนู" onClick={() => setOpen(false)} /> : null}
    </>
  );
}
