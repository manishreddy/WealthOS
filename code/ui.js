/**
 * WealthOS UI Utilities
 * Provides WOS.toast() and WOS.confirm() — replacements for browser alert/confirm.
 * Load this script on every page (after design-system.css).
 */
(function (global) {
  'use strict';

  // ── Toast ──────────────────────────────────────────────────────────────────
  // WOS.toast(message, type?)   type: 'success' | 'error' | 'info'
  //   Shows a non-blocking bottom-right notification that auto-dismisses.

  function getToastContainer() {
    let el = document.getElementById('wos-toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wos-toast-container';
      el.className = 'ds-toast-container';
      document.body.appendChild(el);
    }
    return el;
  }

  const TOAST_ICONS = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  };

  function toast(message, type) {
    type = type || 'success';
    const container = getToastContainer();
    const el = document.createElement('div');
    el.className = 'ds-toast ' + type;
    el.innerHTML = (TOAST_ICONS[type] || '') + '<span>' + message + '</span>';
    container.appendChild(el);

    // Auto-remove after 3.5s
    const remove = () => {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    };
    const timer = setTimeout(remove, 3500);
    el.addEventListener('click', () => { clearTimeout(timer); remove(); });
  }

  // ── Confirm Dialog ─────────────────────────────────────────────────────────
  // WOS.confirm(options) → Promise<boolean>
  //   options: { title, message, confirmText, cancelText, danger }
  //
  // Usage:
  //   const yes = await WOS.confirm({ title: 'Delete asset?', message: '...', danger: true });
  //   if (!yes) return;

  function confirm(options) {
    options = options || {};
    const title       = options.title       || 'Are you sure?';
    const message     = options.message     || 'This action cannot be undone.';
    const confirmText = options.confirmText || 'Confirm';
    const cancelText  = options.cancelText  || 'Cancel';
    const danger      = options.danger      !== false ? !!options.danger : false;

    return new Promise(function (resolve) {
      // Backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'ds-modal-backdrop';
      backdrop.style.zIndex = '9990';

      // Icon
      const iconSvg = danger
        ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
        : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

      backdrop.innerHTML = `
        <div class="ds-modal" style="max-width:400px;padding:28px 28px 24px;">
          <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:20px;">
            <div style="flex-shrink:0;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${danger ? 'rgba(239,68,68,0.1)' : 'rgba(143,230,44,0.1)'};color:${danger ? '#ef4444' : 'var(--accent)'};">
              ${iconSvg}
            </div>
            <div>
              <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-bottom:6px;">${title}</div>
              <div style="font-size:0.875rem;color:var(--text-secondary);line-height:1.5;">${message}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button id="wos-confirm-cancel" style="height:38px;padding:0 18px;border-radius:8px;border:1.5px solid var(--border-strong);background:transparent;color:var(--text-primary);font-size:0.875rem;font-weight:600;cursor:pointer;">
              ${cancelText}
            </button>
            <button id="wos-confirm-ok" style="height:38px;padding:0 18px;border-radius:8px;border:none;background:${danger ? '#ef4444' : 'var(--cta-bg,#8FE62C)'};color:${danger ? '#fff' : 'var(--cta-text,#111)'};font-size:0.875rem;font-weight:700;cursor:pointer;">
              ${confirmText}
            </button>
          </div>
        </div>`;

      document.body.appendChild(backdrop);

      function close(result) {
        backdrop.style.transition = 'opacity 0.2s';
        backdrop.style.opacity = '0';
        setTimeout(function () { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }, 220);
        resolve(result);
      }

      backdrop.querySelector('#wos-confirm-ok').addEventListener('click',     function () { close(true);  });
      backdrop.querySelector('#wos-confirm-cancel').addEventListener('click',  function () { close(false); });
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(false); });
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') { close(false); document.removeEventListener('keydown', handler); }
        if (e.key === 'Enter')  { close(true);  document.removeEventListener('keydown', handler); }
      });
    });
  }

  // ── Alert Modal ────────────────────────────────────────────────────────────
  // WOS.alert(message, type?) → Promise<void>   type: 'success' | 'error' | 'info'
  // Use for important messages that need acknowledgement (not just a toast).

  function alertModal(message, type) {
    type = type || 'info';
    const iconSvg = TOAST_ICONS[type] || TOAST_ICONS.info;
    const color   = type === 'error' ? '#ef4444' : type === 'success' ? 'var(--accent)' : 'var(--accent)';
    const bg      = type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(143,230,44,0.1)';

    return new Promise(function (resolve) {
      const backdrop = document.createElement('div');
      backdrop.className = 'ds-modal-backdrop';
      backdrop.style.zIndex = '9990';
      backdrop.innerHTML = `
        <div class="ds-modal" style="max-width:400px;padding:28px 28px 24px;">
          <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:20px;">
            <div style="flex-shrink:0;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${bg};color:${color};">
              ${iconSvg}
            </div>
            <div style="font-size:0.875rem;color:var(--text-secondary);line-height:1.5;padding-top:8px;">${message}</div>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <button id="wos-alert-ok" style="height:38px;padding:0 22px;border-radius:8px;border:none;background:var(--cta-bg,#8FE62C);color:var(--cta-text,#111);font-size:0.875rem;font-weight:700;cursor:pointer;">OK</button>
          </div>
        </div>`;

      document.body.appendChild(backdrop);

      function close() {
        backdrop.style.transition = 'opacity 0.2s';
        backdrop.style.opacity = '0';
        setTimeout(function () { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }, 220);
        resolve();
      }

      backdrop.querySelector('#wos-alert-ok').addEventListener('click', close);
      backdrop.addEventListener('click', function (e) { if (e.target === backdrop) close(); });
      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape' || e.key === 'Enter') { close(); document.removeEventListener('keydown', handler); }
      });
    });
  }

  // ── Expose ─────────────────────────────────────────────────────────────────
  global.WOS = global.WOS || {};
  global.WOS.toast   = toast;
  global.WOS.confirm = confirm;
  global.WOS.alert   = alertModal;

})(window);
