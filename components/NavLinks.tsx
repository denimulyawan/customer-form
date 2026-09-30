'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/lib/types';

type Item = {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

const MENU: Item[] = [
  { href: '/', label: 'Dashboard', icon: '▦' },
  { href: '/customers', label: 'Customer List', icon: '▤' },
  { href: '/users', label: 'User Management', icon: '◍', adminOnly: true },
  { href: '/account', label: 'My Account', icon: '⌘' },
];

export default function NavLinks({ role }: { role: Role }) {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="nav">
      {MENU.filter((item) => !item.adminOnly || role === 'admin').map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? 'nav-item active' : 'nav-item'}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
