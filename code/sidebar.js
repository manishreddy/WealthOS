/**
 * WealthOS Shared Sidebar — Design System Edition
 * Drop <aside id="sidebar-root"></aside> + <script src="sidebar.js"> into any page.
 */
(function () {
  const ICONS = {
    dashboard:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,
    monthly:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    savings:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
    portfolio:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
    goals:       `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    planned:     `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    planning:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    projections: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><polyline points="8 6 18 6 18 16"/></svg>`,
    wealthbot:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    settings:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    sun:         `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    moon:        `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    logout:      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    hamburger:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    close:       `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    demo:        `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    rupee:       `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="15" y1="21" x2="6" y2="8"/><path d="M6 3a5 5 0 0 1 0 10h2"/></svg>`,
    fire:        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    liabilities: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  };

  const NAV = [
    { href: 'dashboard.html',          icon: ICONS.dashboard,   label: 'Dashboard' },
    { href: 'monthly-tracker.html',    icon: ICONS.monthly,     label: 'Monthly Tracker' },
    { divider: true },
    { href: 'portfolio.html',          icon: ICONS.portfolio,   label: 'Portfolio' },
    { href: 'liabilities.html',        icon: ICONS.liabilities, label: 'Liabilities' },
    { href: 'goals.html',              icon: ICONS.goals,       label: 'Goals' },
    { href: 'fire.html',               icon: ICONS.fire,        label: 'Retirement Planning' },
    { href: 'projections.html',        icon: ICONS.planned,     label: 'Projections' },
    { href: 'financial-planning.html', icon: ICONS.planning,    label: 'Financial Planning' },
    { divider: true },
    { href: 'settings.html',           icon: ICONS.settings,    label: 'Settings' },
  ];

  // savings-plan.html is a sub-page of Monthly Tracker; treat it as such for active highlighting
  const _rawFile = window.location.pathname.split('/').pop() || 'dashboard.html';
  const currentFile = _rawFile === 'savings-plan.html' ? 'monthly-tracker.html' : _rawFile;

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const css = `
    /* ── Desktop sidebar ─────────────────────────────────────────────── */
    .wos-sidebar {
      width: 240px;
      min-width: 240px;
      background: var(--bg-sidebar, #111827);
      border-right: 1px solid var(--sidebar-border, rgba(255,255,255,0.06));
      padding: 24px 12px 20px;
      display: flex;
      flex-direction: column;
      gap: 0;
      height: 100vh;
      overflow: hidden;
      transition: background 180ms, border-color 180ms;
      z-index: 100;
      flex-shrink: 0;
    }

    /* Logo */
    .wos-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px;
      margin-bottom: 28px;
      text-decoration: none;
    }
    .wos-logo-mark {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: var(--text-primary, #111);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .wos-logo-mark svg { display: block; }
    .wos-logo-text {
      font-family: var(--font, 'Inter', sans-serif);
      font-size: 1.0625rem;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.04em;
    }
    .wos-logo-text em {
      font-style: normal;
      color: var(--accent, #8FE62C);
    }

    /* Nav */
    .wos-nav {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 1px;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
    }
    .wos-nav::-webkit-scrollbar { width: 0; }
    .wos-nav-divider {
      height: 1px;
      background: var(--sidebar-border, rgba(255,255,255,0.06));
      margin: 8px 4px;
    }
    .wos-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--sidebar-text, #94A3B8);
      text-decoration: none;
      cursor: pointer;
      transition: background 130ms, color 130ms;
      letter-spacing: -0.01em;
      position: relative;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: var(--font, 'Inter', sans-serif);
    }
    .wos-nav-item:hover {
      background: var(--sidebar-hover-bg, rgba(255,255,255,0.06));
      color: #fff;
    }
    .wos-nav-item.active {
      background: var(--sidebar-active-bg, rgba(143,230,44,0.12));
      color: var(--sidebar-active-text, #8FE62C);
      font-weight: 600;
      border-left: 3px solid var(--sidebar-active-text, #8FE62C);
      padding-left: 9px;
    }
    .wos-nav-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      opacity: 0.75;
    }
    .wos-nav-item.active .wos-nav-icon,
    .wos-nav-item:hover .wos-nav-icon { opacity: 1; }
    .wos-nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Bottom area — always pinned, never pushed off screen */
    .wos-sidebar-bottom {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex-shrink: 0;
    }


    /* Theme toggle */
    .wos-theme-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 130ms;
      color: var(--sidebar-text-muted, #64748B);
    }
    .wos-theme-row:hover {
      background: var(--sidebar-hover-bg, rgba(255,255,255,0.06));
      color: #fff;
    }
    .wos-theme-inner {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      font-weight: 500;
      font-family: var(--font, 'Inter', sans-serif);
      letter-spacing: -0.01em;
    }
    .wos-toggle {
      width: 36px;
      height: 20px;
      background: var(--sidebar-border, rgba(255,255,255,0.12));
      border-radius: 10px;
      position: relative;
      transition: background 0.25s;
      flex-shrink: 0;
    }
    .wos-toggle.on { background: var(--accent, #8FE62C); }
    .wos-toggle-knob {
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .wos-toggle.on .wos-toggle-knob { transform: translateX(16px); }


    /* ── Mobile top bar (hamburger header) ───────────────────────────── */
    .wos-mobile-bar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      /* Notched phones: push bar below status bar */
      padding-top: env(safe-area-inset-top, 0px);
      height: calc(56px + env(safe-area-inset-top, 0px));
      background: var(--bg-sidebar, #111827);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      align-items: center;
      justify-content: space-between;
      padding-left: max(16px, env(safe-area-inset-left, 16px));
      padding-right: max(16px, env(safe-area-inset-right, 16px));
      z-index: 200;
      transition: background 180ms;
      box-shadow: 0 1px 0 rgba(255,255,255,0.04);
    }
    .wos-mobile-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }
    .wos-mobile-logo-mark {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: var(--text-primary, #111);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .wos-mobile-logo-text {
      font-family: var(--font, 'Inter', sans-serif);
      font-size: 1rem;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.04em;
    }
    .wos-mobile-logo-text em { font-style: normal; color: var(--accent, #8FE62C); }
    .wos-hamburger {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: none;
      color: #fff;
      cursor: pointer;
      border-radius: 8px;
      transition: background 130ms;
      flex-shrink: 0;
    }
    .wos-hamburger:hover { background: var(--sidebar-hover-bg, rgba(255,255,255,0.06)); }
    .wos-mobile-greeting {
      flex: 1;
      margin-left: 10px;
      font-family: var(--font, 'Inter', sans-serif);
      font-size: 0.9375rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.025em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .wos-mobile-greeting em {
      font-style: normal;
      color: var(--accent, #8FE62C);
    }

    /* ── Overlay ─────────────────────────────────────────────────────── */
    .wos-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
      z-index: 300;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .wos-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* View Demo button */
    .wos-demo-btn {
      display: flex; align-items: center; gap: 9px;
      padding: 8px 12px; border-radius: 10px;
      font-size: 0.8125rem; font-weight: 500;
      color: var(--sidebar-text-muted, #64748B);
      text-decoration: none;
      border: 1px solid var(--sidebar-border, rgba(255,255,255,0.06));
      transition: background 130ms, color 130ms, border-color 130ms;
      font-family: var(--font, 'Inter', sans-serif);
      letter-spacing: -0.01em;
    }
    .wos-demo-btn:hover {
      background: rgba(143,230,44,0.07);
      color: #fff;
      border-color: rgba(143,230,44,0.45);
    }
    [data-theme="dark"] .wos-demo-btn {
      border-color: rgba(255,255,255,0.1);
    }
    [data-theme="dark"] .wos-demo-btn:hover {
      border-color: rgba(143,230,44,0.4);
    }
    .wos-demo-badge {
      margin-left: auto;
      font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 2px 6px; border-radius: 5px;
      background: rgba(143,230,44,0.15);
      color: var(--accent-dark, #5FA518);
    }
    [data-theme="dark"] .wos-demo-badge {
      background: rgba(143,230,44,0.12);
      color: var(--accent, #8FE62C);
    }

    /* Bottom divider */
    .wos-bottom-divider {
      height: 1px;
      background: var(--sidebar-border, rgba(255,255,255,0.06));
      margin: 6px 0;
    }

    /* Profile row */
    .wos-profile-row {
      display: flex; align-items: center; gap: 9px;
      padding: 9px 10px; border-radius: 10px;
      text-decoration: none;
      transition: background 130ms;
      cursor: pointer;
    }
    .wos-profile-row:hover { background: var(--sidebar-hover-bg, rgba(255,255,255,0.06)); }
    .wos-profile-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.75rem;
      color: #fff;
      flex-shrink: 0; letter-spacing: 0.02em;
      font-family: var(--font, 'Inter', sans-serif);
      transition: background 180ms;
    }
    [data-theme="dark"] .wos-profile-avatar { background: #fff; color: #111; }
    .wos-profile-info { flex: 1; min-width: 0; }
    .wos-profile-name {
      font-size: 0.8125rem; font-weight: 600;
      color: var(--sidebar-text, #94A3B8); letter-spacing: -0.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-family: var(--font, 'Inter', sans-serif);
    }
    .wos-profile-email {
      font-size: 0.65rem; color: var(--sidebar-text-muted, #64748B);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-family: var(--font, 'Inter', sans-serif);
      margin-top: 1px;
    }

    /* Separate logout button */
    .wos-logout-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 10px;
      font-size: 0.8125rem; font-weight: 500;
      color: var(--sidebar-text-muted, #64748B);
      cursor: pointer; border: none; background: none;
      width: 100%; text-align: left;
      font-family: var(--font, 'Inter', sans-serif);
      letter-spacing: -0.01em;
      transition: color 130ms, background 130ms;
    }
    .wos-logout-btn:hover {
      color: var(--negative, #FF3B3B);
      background: rgba(255,59,59,0.06);
    }
    .wos-logout-btn-icon {
      width: 20px; height: 20px; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; opacity: 0.75;
    }
    .wos-logout-btn:hover .wos-logout-btn-icon { opacity: 1; }

    /* ── Shared layout collapse ──────────────────────────────────────── */
    @media (max-width: 768px) {
      /* app-container collapses to single column and reverts to scrolling body */
      .app-container {
        grid-template-columns: 1fr !important;
        height: auto !important;
        min-height: 100vh !important;
        overflow: visible !important;
      }

      /* Push content below the fixed mobile bar (safe-area aware) */
      .main-content {
        margin-top: calc(56px + env(safe-area-inset-top, 0px)) !important;
        overflow-x: hidden;
        max-width: 100%;
      }

      /* Show mobile bar */
      .wos-mobile-bar {
        display: flex;
      }

      /* Drawer mode for sidebar */
      .wos-sidebar {
        position: fixed !important;
        top: 0;
        left: 0;
        /* iOS Safari: 100vh includes browser chrome; use dvh or fill-available */
        height: 100vh;
        height: -webkit-fill-available;
        height: 100dvh;
        width: 280px !important;
        min-width: 0 !important;
        padding-top: max(24px, env(safe-area-inset-top, 24px));
        padding-left: max(12px, env(safe-area-inset-left, 12px));
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), background 180ms;
        z-index: 400;
        box-shadow: 8px 0 32px rgba(0,0,0,0.25);
        overflow-y: auto;
      }
      .wos-sidebar.open {
        transform: translateX(0);
      }
      /* On mobile, pin the bottom section so it always anchors above the browser chrome */
      .wos-sidebar-bottom {
        position: sticky;
        bottom: 0;
        background: var(--bg-sidebar, #111827);
        padding-bottom: max(8px, env(safe-area-inset-bottom, 8px));
        margin-top: auto;
      }

      /* Show overlay when open */
      .wos-overlay {
        display: block;
      }
    }
  `;

  // Inject CSS
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Render HTML ──────────────────────────────────────────────────────────────
  function buildSidebar(root) {
    root.className = 'wos-sidebar';
    root.innerHTML = '';

    // Logo
    const logo = document.createElement('a');
    logo.href = 'dashboard.html';
    logo.className = 'wos-logo';
    logo.innerHTML = `
      <div class="wos-logo-mark">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
      </div>
      <div class="wos-logo-text">Wealth<em>OS</em></div>
    `;
    root.appendChild(logo);

    // Nav
    const nav = document.createElement('nav');
    nav.className = 'wos-nav';

    NAV.forEach(item => {
      if (item.divider) {
        const hr = document.createElement('div');
        hr.className = 'wos-nav-divider';
        nav.appendChild(hr);
        return;
      }
      const a = document.createElement('a');
      a.href = item.href;
      a.className = 'wos-nav-item' + (item.href === currentFile ? ' active' : '');
      a.innerHTML = `
        <span class="wos-nav-icon">${item.icon}</span>
        <span class="wos-nav-label">${item.label}</span>
      `;
      // PJAX nav: intercept click, swap content without full reload
      a.addEventListener('click', (e) => {
        e.preventDefault();
        closeDrawer();
        _pjaxNavigate(item.href);
      });
      nav.appendChild(a);
    });

    root.appendChild(nav);

    // Bottom
    const bottom = document.createElement('div');
    bottom.className = 'wos-sidebar-bottom';

    // View Demo button removed

    // Logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'wos-logout-btn';
    logoutBtn.id = 'wosProfileLogout';
    logoutBtn.innerHTML = `<span class="wos-logout-btn-icon">${ICONS.logout}</span><span>Log out</span>`;
    bottom.appendChild(logoutBtn);

    root.appendChild(bottom);
  }

  // ── Mobile bar & overlay ─────────────────────────────────────────────────────
  function buildMobileBar() {
    // Top bar
    const bar = document.createElement('div');
    bar.className = 'wos-mobile-bar';
    bar.id = 'wosMobileBar';
    bar.innerHTML = `
      <button class="wos-hamburger" id="wosHamburger" aria-label="Open menu">
        ${ICONS.hamburger}
      </button>
      <div class="wos-mobile-greeting" id="wosMobileGreeting">Welcome</div>
      <a href="dashboard.html" class="wos-mobile-logo">
        <div class="wos-mobile-logo-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
        <div class="wos-mobile-logo-text">Wealth<em>OS</em></div>
      </a>
    `;
    document.body.insertBefore(bar, document.body.firstChild);

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'wos-overlay';
    overlay.id = 'wosOverlay';
    document.body.appendChild(overlay);

    // Event listeners
    document.getElementById('wosHamburger').addEventListener('click', openDrawer);
    overlay.addEventListener('click', closeDrawer);
  }

  function openDrawer() {
    const sidebar = document.querySelector('.wos-sidebar');
    const overlay = document.getElementById('wosOverlay');
    const hamburger = document.getElementById('wosHamburger');
    if (!sidebar || !overlay) return;
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    if (hamburger) hamburger.innerHTML = ICONS.close;
  }

  function closeDrawer() {
    const sidebar = document.querySelector('.wos-sidebar');
    const overlay = document.getElementById('wosOverlay');
    const hamburger = document.getElementById('wosHamburger');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    if (hamburger) hamburger.innerHTML = ICONS.hamburger;
  }

  // ── Theme helpers ────────────────────────────────────────────────────────────
  function getSavedTheme() {
    return localStorage.getItem('wealthos_theme') || localStorage.getItem('theme') || 'light';
  }
  function saveTheme(val) {
    localStorage.setItem('wealthos_theme', val);
    localStorage.setItem('theme', val);
  }
  function applyThemeUI(val) {
    const isDark = val === 'dark';
    const tog = document.getElementById('wosToggle');
    const lbl = document.getElementById('wosThemeLabel');
    const ico = document.getElementById('wosThemeIcon');
    if (tog) tog.classList.toggle('on', isDark);
    if (lbl) lbl.textContent = isDark ? 'Light mode' : 'Dark mode';
    if (ico) ico.innerHTML = isDark ? ICONS.sun : ICONS.moon;
    const legacy = document.getElementById('themeToggle');
    if (legacy) legacy.classList.toggle('active', isDark);
  }
  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    saveTheme(next);
    applyThemeUI(next);
  }
  window.toggleTheme = toggleTheme;

  // ── User profile ─────────────────────────────────────────────────────────────
  function applyUserProfile(user) {
    let name = '', email = '', initial = '?', firstName = '';
    if (user) {
      const fullName = user.name || user.fullName || '';
      firstName = fullName ? fullName.split(' ')[0] : '';
      const familyName = user.familyName || '';
      const displayName = familyName && familyName !== 'My Family'
        ? familyName
        : fullName || (user.email || '').split('@')[0];
      name    = displayName || user.email || '';
      email   = user.email  || '';
      initial = name  ? name.charAt(0).toUpperCase()
              : email ? email.charAt(0).toUpperCase() : '?';
    }
    const avatarEl    = document.getElementById('wosProfileAvatar');
    const nameEl      = document.getElementById('wosProfileName');
    const emailEl     = document.getElementById('wosProfileEmail');
    const logoutBtn   = document.getElementById('wosProfileLogout');
    const greetingEl  = document.getElementById('wosMobileGreeting');
    if (avatarEl)  avatarEl.textContent  = initial;
    if (nameEl)    nameEl.textContent    = name  || 'My Account';
    if (emailEl)   emailEl.textContent   = email;
    if (greetingEl) {
      const greetName = firstName || name;
      greetingEl.innerHTML = greetName
        ? 'Welcome, <em>' + greetName + '</em>'
        : 'Welcome';
    }
    if (logoutBtn && !logoutBtn._bound) {
      logoutBtn._bound = true;
      logoutBtn.addEventListener('click', async () => {
        try { const s = await getSupabase(); await s.auth.signOut(); } catch (e) {}
        window.location.href = '/login';
      });
    }
  }

  function loadUserProfile() {
    if (window.WealthAPI && WealthAPI.auth && WealthAPI.auth.getUser) {
      WealthAPI.auth.getUser().then(applyUserProfile).catch(() => applyUserProfile(null));
    } else {
      applyUserProfile(null);
    }
  }

  // ── Portfolio value ──────────────────────────────────────────────────────────
  function loadPortfolioTotal() {
    const now = new Date();
    getSupabase().then(sb => sb.auth.getSession()).then(({ data: { session } }) => {
      return fetch(`/api/portfolio/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
        headers: session ? { 'Authorization': 'Bearer ' + session.access_token } : {}
      });
    })
      .then(r => r.ok ? r.json() : [])
      .then(memberData => {
        let total = 0;
        (memberData || []).forEach(mp => {
          (mp.assets || []).forEach(a => { total += a.currentValue || 0; });
        });
        const el = document.getElementById('wosSidebarTotal');
        if (el && window.WealthAPI) el.textContent = WealthAPI.formatCurrency(total);
        else if (el) el.textContent = '₹' + (total / 100000).toFixed(1) + 'L';
      })
      .catch(() => {});
  }

  // ── PJAX Navigation Engine ────────────────────────────────────────────────────
  // Intercepts sidebar nav clicks and swaps <main> content without a full page reload,
  // eliminating the white-flash "scraping" effect during navigation.

  const _pjaxNavHrefs = new Set(NAV.filter(i => i.href).map(i => i.href));
  let   _pjaxBusy     = false;

  async function _pjaxNavigate(href) {
    // Normalise to filename only (strips leading path & query for lookup)
    const file = href.split('?')[0].split('/').pop();

    // Only PJAX for known sidebar pages; fall through to full nav otherwise
    if (!_pjaxNavHrefs.has(file)) {
      window.location.href = href;
      return;
    }
    if (_pjaxBusy) return;
    _pjaxBusy = true;

    try {
      // ── 1. Fade out current content (quick, 80ms) ────────────────────────────
      const main = document.querySelector('main.main-content');
      if (main) {
        main.style.transition = 'opacity 80ms ease';
        main.style.opacity    = '0';
      }

      // ── 2. Fetch target page (in parallel with the fade-out) ─────────────────
      const res = await fetch(href, { cache: 'default' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      const newDoc = (new DOMParser()).parseFromString(html, 'text/html');

      // ── 3. Bail early if target is a stub/redirect (no main content) ─────────
      const newMain = newDoc.querySelector('main.main-content');
      if (!newMain) throw new Error('Fetched page has no main.main-content');

      // ── 4. Update document title ─────────────────────────────────────────────
      document.title = newDoc.title;

      // ── 5. Inject missing <link rel="stylesheet"> tags (dedup by href) ────────
      const pendingLinks = [];
      newDoc.querySelectorAll('head link[rel="stylesheet"]').forEach(link => {
        const h    = link.getAttribute('href');
        if (!h) return;
        const norm = h.replace(/^\.\//, '').replace(/^\//, '');
        if (document.querySelector(`link[href="${h}"], link[href="${norm}"], link[href="/${norm}"]`)) return;
        const el = document.createElement('link');
        el.rel  = 'stylesheet';
        el.href = h;
        pendingLinks.push(new Promise(r => { el.onload = el.onerror = r; }));
        document.head.appendChild(el);
      });
      // Await new CSS so the swapped content is styled before it becomes visible
      if (pendingLinks.length) await Promise.all(pendingLinks);

      // ── 6. Swap page-specific inline <style> blocks ──────────────────────────
      // Remove previous PJAX-injected styles, then inject every style from the
      // new page (no content-based dedup — duplicate rules are harmless).
      document.querySelectorAll('style[data-pjax]').forEach(s => s.remove());
      newDoc.querySelectorAll('style').forEach(s => {
        const el = document.createElement('style');
        el.setAttribute('data-pjax', '1');
        el.textContent = s.textContent;
        document.head.appendChild(el);
      });

      // ── 7. Load <head> external scripts not yet on page (e.g. Chart.js CDN) ──
      const pendingHeadScripts = [];
      newDoc.querySelectorAll('head script[src]').forEach(oldScript => {
        const src  = oldScript.getAttribute('src');
        if (!src) return;
        const norm = src.replace(/^\.\//, '').replace(/^\//, '');
        if (document.querySelector(
          `script[src="${src}"], script[src="${norm}"], script[src="/${norm}"]`
        )) return; // already loaded
        pendingHeadScripts.push(new Promise(resolve => {
          const s  = document.createElement('script');
          s.src    = src;
          s.onload = s.onerror = resolve;
          document.head.appendChild(s);
        }));
      });
      if (pendingHeadScripts.length) await Promise.all(pendingHeadScripts);

      // ── 8. Swap <main> content ────────────────────────────────────────────────
      if (main) {
        main.innerHTML = newMain.innerHTML;
        main.className = newMain.className;
      }

      // ── 9. Swap body-level modals / overlays (elements outside <main>) ────────
      document.querySelectorAll('[data-pjax-body]').forEach(el => el.remove());
      const firstBodyScript = document.body.querySelector('script');
      Array.from(newDoc.body.children).forEach(el => {
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'aside') return;
        if (el.classList.contains('app-container') || el.id === 'sidebar-root') return;
        const clone = document.importNode(el, true);
        clone.setAttribute('data-pjax-body', '1');
        document.body.insertBefore(clone, firstBodyScript || null);
      });

      // ── 10. Inject page scripts; capture DOMContentLoaded callbacks ───────────
      // Intercept document.addEventListener so DCL callbacks from new page scripts
      // can be captured and fired manually (DOMContentLoaded won't re-fire natively).
      const _origAEL = document.addEventListener.bind(document);
      const _dcl     = [];
      document.addEventListener = function(type, fn, opts) {
        if (type === 'DOMContentLoaded') { _dcl.push(fn); return; }
        _origAEL(type, fn, opts);
      };

      const bodyScripts = Array.from(newDoc.querySelectorAll('body script'));
      for (const oldScript of bodyScripts) {
        if (oldScript.src) {
          const src  = oldScript.getAttribute('src');
          if (!src) continue;
          const norm = src.replace(/^\.\//, '').replace(/^\//, '');
          // Skip already-loaded external scripts (api.js, sidebar.js, user-menu.js …)
          if (document.querySelector(
            `script[src="${src}"], script[src="${norm}"], script[src="/${norm}"]`
          )) continue;
          await new Promise(resolve => {
            const s  = document.createElement('script');
            s.src    = src;
            s.onload = s.onerror = resolve;
            document.body.appendChild(s);
          });
        } else {
          const code = oldScript.textContent.trim();
          if (!code) continue;
          const s = document.createElement('script');
          s.textContent = code;
          document.body.appendChild(s);
        }
      }

      // Restore real addEventListener (before any callbacks run)
      document.addEventListener = _origAEL;

      // ── 11. Update URL & sidebar active state ────────────────────────────────
      history.pushState({ pjax: true, href }, document.title, href);

      const activeFile = file === 'savings-plan.html' ? 'monthly-tracker.html' : file;
      document.querySelectorAll('.wos-nav-item').forEach(item => {
        const ih = (item.getAttribute('href') || '').split('/').pop().split('?')[0];
        item.classList.toggle('active', ih === activeFile);
      });

      // ── 12. Fade IN — force reflow then transition from opacity:0 ────────────
      // Using void offsetHeight to commit the opacity:0 starting state so the
      // browser correctly transitions to opacity:1 rather than snapping.
      if (main) main.scrollTop = 0; else window.scrollTo(0, 0);
      _pjaxBusy = false; // unblock before DCL callbacks in case they navigate
      if (main) {
        main.style.transition = '';       // clear any stale transition
        main.style.opacity    = '0';      // start point
        main.style.transform  = 'translateY(6px)';
        void main.offsetHeight;           // force layout commit (registers opacity:0)
        main.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
        main.style.opacity    = '1';
        main.style.transform  = 'translateY(0)';
        main.addEventListener('transitionend', () => main.removeAttribute('style'), { once: true });
      }

      // ── 13. Fire DCL callbacks async — data loads while page is already visible
      (async () => {
        for (const fn of _dcl) {
          try { await fn(); } catch (e) { console.error('[PJAX] init error:', e); }
        }
      })();

    } catch (err) {
      console.warn('[PJAX] Navigation failed, falling back to full load:', err);
      window.location.href = href;
    } finally {
      // Ensure _pjaxBusy is cleared even on error
      _pjaxBusy = false;
    }
  }

  // Handle browser back / forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.pjax) _pjaxNavigate(e.state.href);
  });

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    const savedTheme = getSavedTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    const root = document.getElementById('sidebar-root');
    if (!root) return;
    buildSidebar(root);
    buildMobileBar();
    applyThemeUI(savedTheme);
    setTimeout(loadUserProfile, 100);
    setTimeout(loadPortfolioTotal, 300);
    // Stamp initial history entry so popstate back to first page also uses PJAX
    if (!history.state || !history.state.pjax) {
      history.replaceState(
        { pjax: true, href: window.location.href },
        document.title,
        window.location.href
      );
    }
    // Mark page-specific body-level elements (modals, overlays outside <main>) so
    // PJAX cleans them up when navigating away from the initial page load.
    // Exclude sidebar-generated elements — they must persist across PJAX navigations.
    Array.from(document.body.children).forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style' || tag === 'aside') return;
      if (el.classList.contains('app-container') || el.id === 'sidebar-root') return;
      if (el.classList.contains('wos-mobile-bar') || el.classList.contains('wos-overlay')) return;
      el.setAttribute('data-pjax-body', '1');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
