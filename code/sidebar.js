/**
 * WealthOS Shared Sidebar
 * Drop <aside id="sidebar-root"></aside> + <script src="sidebar.js"> into any page.
 * Active item is detected automatically from the current URL filename.
 */
(function () {
  const NAV = [
    { group: true },
    { href: 'dashboard.html',          icon: '📊', label: 'Dashboard' },
    { href: 'monthly-tracker.html',    icon: '📅', label: 'Monthly Tracker' },
    { href: 'savings-plan.html',       icon: '💰', label: 'Monthly Investments' },
    { divider: true },
    { href: 'portfolio.html',          icon: '💼', label: 'Portfolio' },
    { href: 'goals.html',              icon: '🎯', label: 'Goals' },
    { href: 'financial-planning.html', icon: '📈', label: 'Financial Planning' },
    { href: 'planned.html',            icon: '🗓️', label: 'Planned' },
    { href: 'proj-vs-actuals.html',    icon: '⚖️', label: 'Proj vs Actuals' },
    { divider: true },
    { href: 'wealthbot.html',          icon: '🤖', label: 'WealthBot' },
    { href: 'settings.html',           icon: '⚙️', label: 'Settings' },
  ];

  const currentFile = window.location.pathname.split('/').pop() || 'dashboard.html';

  // ── CSS ────────────────────────────────────────────────────────────────────
  const css = `
    .wos-sidebar {
      width: 252px;
      min-width: 252px;
      background: var(--sidebar-bg, var(--bg-secondary));
      border-right: 1px solid var(--border-color);
      padding: 28px 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      transition: background 0.3s, border-color 0.3s;
    }

    /* hide scrollbar but allow scroll */
    .wos-sidebar::-webkit-scrollbar { width: 0; }

    /* ── Logo ── */
    .wos-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px;
      margin-bottom: 32px;
      text-decoration: none;
    }
    .wos-logo-mark {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,102,255,0.25);
    }
    .wos-logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
    }
    .wos-logo-text em {
      font-style: normal;
      background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* ── Nav list ── */
    .wos-nav {
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 2px;
    }

    .wos-nav-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 8px 8px;
    }

    .wos-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px 9px 12px;
      border-radius: 9px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      letter-spacing: -0.01em;
      position: relative;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: 'DM Sans', sans-serif;
    }
    .wos-nav-item:hover {
      background: var(--hover-bg);
      color: var(--text-primary);
    }
    .wos-nav-item:hover .wos-nav-icon {
      opacity: 1;
    }
    .wos-nav-item.active {
      background: linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,212,255,0.07) 100%);
      color: var(--accent-primary);
      font-weight: 600;
    }
    .wos-nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    }
    .wos-nav-item.active .wos-nav-icon {
      opacity: 1;
    }

    .wos-nav-icon {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      font-size: 15px;
      flex-shrink: 0;
      opacity: 0.75;
      transition: opacity 0.15s;
    }
    .wos-nav-item.active .wos-nav-icon {
      background: rgba(0,102,255,0.1);
    }
    .wos-nav-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Bottom area ── */
    .wos-sidebar-bottom {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Portfolio value */
    .wos-portfolio-card {
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(0,102,255,0.07) 0%, rgba(0,212,255,0.05) 100%);
      border: 1px solid rgba(0,102,255,0.15);
      border-radius: 12px;
    }
    .wos-portfolio-label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--text-tertiary);
      margin-bottom: 4px;
    }
    .wos-portfolio-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    /* Theme toggle row */
    .wos-theme-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 9px;
      cursor: pointer;
      transition: background 0.15s;
      border: 1px solid var(--border-color);
      background: var(--bg-elevated);
    }
    .wos-theme-row:hover { background: var(--hover-bg); }
    .wos-theme-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .wos-toggle {
      width: 40px;
      height: 22px;
      background: var(--border-color);
      border-radius: 11px;
      position: relative;
      transition: background 0.3s;
      flex-shrink: 0;
    }
    .wos-toggle.on {
      background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
    }
    .wos-toggle-knob {
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.25s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .wos-toggle.on .wos-toggle-knob {
      transform: translateX(18px);
    }

    /* Logout */
    .wos-logout {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 12px;
      border-radius: 9px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-tertiary);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-family: 'DM Sans', sans-serif;
    }
    .wos-logout:hover {
      color: var(--error);
      background: rgba(255,59,48,0.06);
    }
  `;

  // ── Inject CSS ──────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Render HTML ────────────────────────────────────────────────────────────
  function buildSidebar(root) {
    root.className = 'wos-sidebar';
    root.innerHTML = '';

    // Logo
    const logo = document.createElement('a');
    logo.href = 'dashboard.html';
    logo.className = 'wos-logo';
    logo.innerHTML = `
      <div class="wos-logo-mark">💎</div>
      <div class="wos-logo-text">Wealth<em>OS</em></div>
    `;
    root.appendChild(logo);

    // Nav
    const nav = document.createElement('nav');
    nav.className = 'wos-nav';

    NAV.forEach(item => {
      if (item.group) return;
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
      nav.appendChild(a);
    });

    root.appendChild(nav);

    // Bottom
    const bottom = document.createElement('div');
    bottom.className = 'wos-sidebar-bottom';

    // Portfolio card
    const card = document.createElement('div');
    card.className = 'wos-portfolio-card';
    card.innerHTML = `
      <div class="wos-portfolio-label">Total Portfolio</div>
      <div class="wos-portfolio-value" id="wosSidebarTotal">—</div>
    `;
    bottom.appendChild(card);

    // Theme toggle
    const isDark = getSavedTheme() === 'dark';
    const themeRow = document.createElement('div');
    themeRow.className = 'wos-theme-row';
    themeRow.innerHTML = `
      <span class="wos-theme-label">${isDark ? '☀️' : '🌙'} Dark Mode</span>
      <div class="wos-toggle${isDark ? ' on' : ''}" id="wosToggle">
        <div class="wos-toggle-knob"></div>
      </div>
    `;
    themeRow.addEventListener('click', toggleTheme);
    bottom.appendChild(themeRow);

    // Logout
    const logout = document.createElement('button');
    logout.className = 'wos-logout';
    logout.innerHTML = `<span>→</span><span>Log Out</span>`;
    logout.addEventListener('click', () => {
      if (window.WealthAPI && WealthAPI.auth) WealthAPI.auth.logout();
      else { localStorage.removeItem('wealthos_jwt'); window.location.href = 'login.html'; }
    });
    bottom.appendChild(logout);

    root.appendChild(bottom);
  }

  // ── Theme helpers ─────────────────────────────────────────────────────────
  function getSavedTheme() {
    // Support both storage keys so all pages stay in sync
    return localStorage.getItem('wealthos_theme') || localStorage.getItem('theme') || 'light';
  }

  function saveTheme(val) {
    localStorage.setItem('wealthos_theme', val);
    localStorage.setItem('theme', val);  // keep legacy pages in sync
  }

  function applyThemeUI(val) {
    const isDark = val === 'dark';
    const tog = document.getElementById('wosToggle');
    const lbl = tog && tog.previousElementSibling;
    if (tog) tog.classList.toggle('on', isDark);
    if (lbl) lbl.textContent = isDark ? '☀️ Dark Mode' : '🌙 Dark Mode';
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

  // Expose so legacy onclick="toggleTheme()" still works
  window.toggleTheme = toggleTheme;

  // ── Portfolio value ────────────────────────────────────────────────────────
  function loadPortfolioTotal() {
    const token = localStorage.getItem('wealthos_jwt');
    if (!token) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    fetch(`/api/portfolio/?year=${year}&month=${month}`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.ok ? r.json() : [])
      .then(memberData => {
        // API returns [{memberId, memberName, assets:[]}]
        let total = 0;
        (memberData || []).forEach(mp => {
          (mp.assets || []).forEach(a => { total += a.currentValue || 0; });
        });
        const el = document.getElementById('wosSidebarTotal');
        if (el && window.WealthAPI) el.textContent = WealthAPI.formatCurrency(total);
        else if (el) el.textContent = '₹' + (total / 100000).toFixed(1) + 'L';
        const legacy = document.getElementById('sidebarTotal');
        if (legacy && el) legacy.textContent = el.textContent;
      })
      .catch(() => {});
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    // Apply saved theme first to prevent flash
    const savedTheme = getSavedTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    const root = document.getElementById('sidebar-root');
    if (!root) return;
    buildSidebar(root);
    applyThemeUI(savedTheme);
    // Load portfolio total after a short delay to not block render
    setTimeout(loadPortfolioTotal, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
