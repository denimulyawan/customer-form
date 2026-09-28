'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/types';

type Menu = {
  href: string;
  label: string;
  ikon: string;
  adminSaja?: boolean;
};

const MENU: Menu[] = [
  { href: '/', label: 'Dashboard', ikon: '▦' },
  { href: '/akun', label: 'Daftar Akun', ikon: '▤' },
  { href: '/pengguna', label: 'Pengguna', ikon: '◍', adminSaja: true },
  { href: '/ganti-password', label: 'Ganti Password', ikon: '⌘' },
];

export default function NavLinks({ role }: { role: Role }) {
  const jalur = usePathname() ?? '/';

  return (
    <nav className="nav">
      {MENU.filter((m) => !m.adminSaja || role === 'admin').map((m) => {
        const aktif = m.href === '/' ? jalur === '/' : jalur.startsWith(m.href);
        return (
          <Link
            key={m.href}
            href={m.href}
            className={aktif ? 'nav-item aktif' : 'nav-item'}
          >
            <span className="ikon">{m.ikon}</span>
            {m.label}
          </Link>
        );
      })}
    </nav>
  );
}
