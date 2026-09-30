'use client';

import { useEffect, useState } from 'react';

type Side = 'auto' | 'open' | 'closed';

const STORAGE_KEY = 'cf_sidebar';
const DESKTOP = '(min-width: 901px)';

/**
 * The application frame: a collapsible sidebar plus the content area.
 *
 * Only ONE hamburger button exists. It sits in the top-left corner, above both
 * the sidebar and the content, so it stays reachable whether the sidebar is
 * showing or hidden.
 *
 * Which state applies is written to `data-side` and decided by CSS, so the very
 * first paint is already right on both desktop and phone — no flicker while
 * JavaScript wakes up.
 */
export default function Shell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [side, setSide] = useState<Side>('auto');
  const [isDesktop, setIsDesktop] = useState(true);

  // Remember the visitor's choice, and track the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'open' || saved === 'closed') setSide(saved);
    } catch {
      /* private mode — the default is fine */
    }

    return () => mq.removeEventListener('change', sync);
  }, []);

  const visible = side === 'open' || (side === 'auto' && isDesktop);

  function apply(next: Side) {
    setSide(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  const toggle = () => apply(visible ? 'closed' : 'open');

  // Escape closes the overlay on small screens.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && visible && !isDesktop) apply('closed');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, isDesktop]);

  return (
    <div className="shell" data-side={side}>
      <aside
        className="sidebar"
        // Tapping a menu entry on a phone should close the overlay.
        onClick={(e) => {
          if (!isDesktop && (e.target as HTMLElement).closest('a')) apply('closed');
        }}
      >
        {sidebar}
      </aside>

      {side === 'open' ? (
        <div className="sidebar-backdrop" onClick={toggle} aria-hidden="true" />
      ) : null}

      <button
        type="button"
        className="menu-toggle"
        onClick={toggle}
        aria-label={visible ? 'Hide menu' : 'Show menu'}
        aria-expanded={visible}
        title={visible ? 'Hide menu' : 'Show menu'}
      >
        <span className="menu-toggle-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div className="main">{children}</div>
    </div>
  );
}
