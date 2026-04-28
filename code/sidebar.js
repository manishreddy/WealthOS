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
  };

  const NAV = [
    { href: 'dashboard.html',          icon: ICONS.dashboard,   label: 'Dashboard' },
    { href: 'monthly-tracker.html',    icon: ICONS.monthly,     label: 'Monthly Tracker' },
    { href: 'savings-plan.html',       icon: ICONS.savings,     label: 'Monthly Investments' },
    { divider: true },
    { href: 'portfolio.html',          icon: ICONS.portfolio,   label: 'Portfolio' },
    { href: 'goals.html',              icon: ICONS.goals,       label: 'Goals' },
    { href: 'planned.html',            icon: ICONS.planned,     label: 'Planned' },
    { href: 'financial-planning.html', icon: ICONS.planning,    label: 'Financial Planning' },
    { href: 'proj-vs-actuals.html',    icon: ICONS.projections, label: 'Proj vs Actuals' },
    { divider: true },
    { href: 'wealthbot.html',          icon: ICONS.wealthbot,   label: 'WealthBot' },
    { href: 'settings.html',           icon: ICONS.settings,    label: 'Settings' },
  ];

  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const css = `
    /* ── Desktop sidebar ─────────────────────────────────────────────── */
    .wos-sidebar {
      width: 240px;
      min-width: 240px;
      background: var(--bg-sidebar, #F5F5F5);
      border-right: 1px solid var(--sidebar-border, rgba(0,0,0,0.07));
      padding: 24px 12px 20px;
      display: flex;
      flex-direction: column;
      gap: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow: hidden;
      transition: background 180ms, border-color 180ms;
      z-index: 100;
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
      color: var(--text-primary, #111);
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
      background: var(--sidebar-border, rgba(0,0,0,0.07));
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
      color: var(--sidebar-text-muted, #888);
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
      background: var(--sidebar-hover-bg, rgba(0,0,0,0.05));
      color: var(--sidebar-text, #111);
    }
    .wos-nav-item.active {
      background: var(--sidebar-active-bg, #111);
      color: var(--sidebar-active-text, #fff);
      font-weight: 600;
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
      color: var(--sidebar-text-muted, #888);
    }
    .wos-theme-row:hover {
      background: var(--sidebar-hover-bg, rgba(0,0,0,0.05));
      color: var(--sidebar-text, #111);
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
      background: var(--border, rgba(0,0,0,0.12));
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
      background: var(--bg-sidebar, #F5F5F5);
      border-bottom: 1px solid var(--sidebar-border, rgba(0,0,0,0.07));
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 200;
      transition: background 180ms, border-color 180ms;
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
      color: var(--text-primary, #111);
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
      color: var(--text-primary, #111);
      cursor: pointer;
      border-radius: 8px;
      transition: background 130ms;
      flex-shrink: 0;
    }
    .wos-hamburger:hover { background: var(--sidebar-hover-bg, rgba(0,0,0,0.06)); }
    .wos-mobile-greeting {
      flex: 1;
      margin-left: 10px;
      font-family: var(--font, 'Inter', sans-serif);
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary, #111);
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
      background: rgba(0,0,0,0.4);
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
      color: var(--sidebar-text-muted, #888);
      text-decoration: none;
      border: 1px solid var(--sidebar-border, rgba(0,0,0,0.08));
      transition: background 130ms, color 130ms, border-color 130ms;
      font-family: var(--font, 'Inter', sans-serif);
      letter-spacing: -0.01em;
    }
    .wos-demo-btn:hover {
      background: rgba(143,230,44,0.07);
      color: var(--sidebar-text, #111);
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
      background: var(--sidebar-border, rgba(0,0,0,0.07));
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
    .wos-profile-row:hover { background: var(--sidebar-hover-bg, rgba(0,0,0,0.05)); }
    .wos-profile-avatar {
      width: 30px; height: 30px; border-radius: 50%;
      background: var(--text-primary, #111);
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 0.75rem;
      color: var(--bg, #EBEBEB);
      flex-shrink: 0; letter-spacing: 0.02em;
      font-family: var(--font, 'Inter', sans-serif);
      transition: background 180ms;
    }
    [data-theme="dark"] .wos-profile-avatar { background: #fff; color: #111; }
    .wos-profile-info { flex: 1; min-width: 0; }
    .wos-profile-name {
      font-size: 0.8125rem; font-weight: 600;
      color: var(--sidebar-text, #111); letter-spacing: -0.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-family: var(--font, 'Inter', sans-serif);
    }
    .wos-profile-email {
      font-size: 0.65rem; color: var(--sidebar-text-muted, #888);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-family: var(--font, 'Inter', sans-serif);
      margin-top: 1px;
    }

    /* Separate logout button */
    .wos-logout-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; border-radius: 10px;
      font-size: 0.8125rem; font-weight: 500;
      color: var(--sidebar-text-muted, #888);
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
      /* app-container collapses to single column */
      .app-container {
        grid-template-columns: 1fr !important;
      }

      /* Push content below the fixed mobile bar + ensure consistent padding */
      .main-content {
        margin-top: 56px !important;
        padding: 16px;
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
        height: 100vh;
        width: 260px !important;
        min-width: 0 !important;
        transform: translateX(-100%);
        transition: transform 0.28s cubic-bezier(0.16,1,0.3,1), background 180ms;
        z-index: 400;
        box-shadow: 4px 0 24px rgba(0,0,0,0.15);
      }
      .wos-sidebar.open {
        transform: translateX(0);
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
      // Close drawer on nav click (mobile)
      a.addEventListener('click', closeDrawer);
      nav.appendChild(a);
    });

    root.appendChild(nav);

    // Bottom
    const bottom = document.createElement('div');
    bottom.className = 'wos-sidebar-bottom';

    // View Demo button (distinct outlined style)
    const demoLink = document.createElement('a');
    demoLink.href = 'demo-account.html';
    demoLink.target = '_blank';
    demoLink.rel = 'noopener';
    demoLink.className = 'wos-demo-btn';
    demoLink.innerHTML = `<span class="wos-nav-icon">${ICONS.demo}</span><span>View Demo</span><span class="wos-demo-badge">Preview</span>`;
    demoLink.addEventListener('click', closeDrawer);
    bottom.appendChild(demoLink);

    // Theme toggle
    const isDark = getSavedTheme() === 'dark';
    const themeRow = document.createElement('div');
    themeRow.className = 'wos-theme-row';
    themeRow.innerHTML = `
      <div class="wos-theme-inner">
        <span id="wosThemeIcon">${isDark ? ICONS.sun : ICONS.moon}</span>
        <span id="wosThemeLabel">${isDark ? 'Light mode' : 'Dark mode'}</span>
      </div>
      <div class="wos-toggle${isDark ? ' on' : ''}" id="wosToggle">
        <div class="wos-toggle-knob"></div>
      </div>
    `;
    themeRow.addEventListener('click', toggleTheme);
    bottom.appendChild(themeRow);

    // Divider above profile
    const divider = document.createElement('div');
    divider.className = 'wos-bottom-divider';
    bottom.appendChild(divider);

    // Profile row (avatar + name + email → links to settings)
    const profileRow = document.createElement('a');
    profileRow.href = 'settings.html';
    profileRow.className = 'wos-profile-row';
    profileRow.innerHTML = `
      <div class="wos-profile-avatar" id="wosProfileAvatar">?</div>
      <div class="wos-profile-info">
        <div class="wos-profile-name" id="wosProfileName">My Account</div>
        <div class="wos-profile-email" id="wosProfileEmail"></div>
      </div>
    `;
    profileRow.addEventListener('click', closeDrawer);
    bottom.appendChild(profileRow);

    // Separate logout button
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
      logoutBtn.addEventListener('click', () => {
        window.location.href = '/api/logout';
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
    fetch(`/api/portfolio/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, {
      credentials: 'same-origin'
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
