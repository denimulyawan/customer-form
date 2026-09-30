'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = {
  href: string;
  label: string;
  icon: string;
};

/**
 * Every sign-in account is an administrator, so nothing here is filtered by
 * role. If a read-only role is ever brought back, this is where it would be
 * gated again.
 */
const MENU: Item[] = [
  { href: '/', label: 'Dashboard', icon: '▦' },
  { href: '/customers', label: 'Customer List', icon: '▤' },
  { href: '/users', label: 'User Management', icon: '◍' },
  { href: '/account', label: 'My Account', icon: '⌘' },
];

export default function NavLinks() {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="nav">
      {MENU.map((item) => {
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
