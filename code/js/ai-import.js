/**
 * WealthOS — Universal AI Import Widget
 * Supports: paste, screenshot upload, CSV/Excel upload
 * Usage:
 *   const imp = new AIImport(config);
 *   imp.open();
 *
 * config {
 *   title:        string   — modal heading
 *   description:  string   — sub-heading
 *   placeholder:  string   — textarea placeholder example
 *   buildPrompt:  fn()     — returns the system prompt string for Claude
 *   renderPreview:fn(data) — returns HTML string for the preview panel
 *   onImport:     async fn(data) — called with parsed data on confirm
 * }
 */
class AIImport {
  constructor(config) {
    this.config = config;
    this._data = null;
    this._modalEl = null;
    this._inject();
  }

  // ── Public ──────────────────────────────────────────────────────────────

  open() {
    this._reset();
    this._modalEl.style.display = 'flex';
    this._modalEl.querySelector('.ai-imp-textarea').focus();
  }

  close() {
    this._modalEl.style.display = 'none';
  }

  // ── Private ─────────────────────────────────────────────────────────────

  _inject() {
    if (document.getElementById('aiImpStyles')) return;

    // Styles
    const style = document.createElement('style');
    style.id = 'aiImpStyles';
    style.textContent = `
      .ai-imp-overlay {
        display: none; position: fixed; inset: 0;
        background: rgba(0,0,0,0.65); z-index: 99999;
        align-items: flex-start; justify-content: center;
        padding: 24px; overflow-y: auto;
        backdrop-filter: blur(2px);
      }
      .ai-imp-box {
        background: var(--bg-elevated, #fff);
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 20px; padding: 36px;
        max-width: 680px; width: 100%; margin: auto;
        box-shadow: 0 24px 60px rgba(0,0,0,0.28);
        font-family: 'DM Sans', -apple-system, sans-serif;
      }
      .ai-imp-header {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 6px;
      }
      .ai-imp-title {
        font-family: 'Space Grotesk', sans-serif;
        font-size: 1.375rem; font-weight: 700;
        color: var(--text-primary, #1a1a1a);
      }
      .ai-imp-desc {
        font-size: 0.875rem; color: var(--text-secondary, #666);
        margin-top: 4px; margin-bottom: 20px;
      }
      .ai-imp-close {
        background: none; border: none; font-size: 1.5rem;
        cursor: pointer; color: var(--text-secondary, #666);
        line-height: 1; padding: 4px; flex-shrink: 0;
      }
      .ai-imp-tabs {
        display: flex; gap: 6px; margin-bottom: 14px;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
        padding-bottom: 12px;
      }
      .ai-imp-tab {
        padding: 7px 16px; border-radius: 8px; font-size: 0.8125rem;
        font-weight: 600; cursor: pointer; border: 1px solid transparent;
        background: var(--bg-secondary, #f8f9fa);
        color: var(--text-secondary, #666);
        transition: all 0.15s ease;
      }
      .ai-imp-tab.active {
        background: linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,212,255,0.12));
        border-color: rgba(0,102,255,0.25);
        color: var(--accent-primary, #0066ff);
      }
      .ai-imp-panel { display: none; }
      .ai-imp-panel.active { display: block; }
      .ai-imp-textarea {
        width: 100%; min-height: 160px; padding: 14px;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 12px; resize: vertical; outline: none;
        font-size: 0.875rem; line-height: 1.6;
        font-family: 'DM Sans', monospace;
        background: var(--input-bg, #f8f9fa);
        color: var(--text-primary, #1a1a1a);
        transition: border-color 0.2s;
      }
      .ai-imp-textarea:focus { border-color: var(--accent-primary, #0066ff); }
      .ai-imp-dropzone {
        border: 2px dashed var(--border-color, #e5e7eb);
        border-radius: 14px; padding: 40px 20px;
        text-align: center; cursor: pointer;
        background: var(--bg-secondary, #f8f9fa);
        transition: all 0.2s ease;
      }
      .ai-imp-dropzone:hover, .ai-imp-dropzone.drag-over {
        border-color: var(--accent-primary, #0066ff);
        background: rgba(0,102,255,0.04);
      }
      .ai-imp-dropzone-icon { font-size: 2.5rem; margin-bottom: 10px; }
      .ai-imp-dropzone-title {
        font-size: 0.9375rem; font-weight: 600;
        color: var(--text-primary, #1a1a1a); margin-bottom: 4px;
      }
      .ai-imp-dropzone-hint { font-size: 0.8125rem; color: var(--text-tertiary, #999); }
      .ai-imp-file-chosen {
        display: none; align-items: center; gap: 12px;
        padding: 14px 18px; border-radius: 12px;
        background: rgba(0,102,255,0.06);
        border: 1px solid rgba(0,102,255,0.2);
      }
      .ai-imp-file-name { font-weight: 600; color: var(--text-primary, #1a1a1a); }
      .ai-imp-file-sub { font-size: 0.75rem; color: var(--text-secondary, #666); }
      .ai-imp-actions {
        display: flex; align-items: center; gap: 12px;
        margin-top: 18px; flex-wrap: wrap;
      }
      .ai-imp-btn-parse {
        display: flex; align-items: center; gap: 8px;
        padding: 11px 22px; border-radius: 10px; border: none;
        background: linear-gradient(135deg, var(--gradient-start, #0066ff), var(--gradient-end, #00d4ff));
        color: #fff; font-size: 0.9375rem; font-weight: 600;
        cursor: pointer; font-family: inherit; transition: opacity 0.2s;
      }
      .ai-imp-btn-parse:disabled { opacity: 0.6; cursor: not-allowed; }
      .ai-imp-status { font-size: 0.875rem; color: var(--text-secondary, #666); }
      .ai-imp-preview {
        margin-top: 20px; border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 14px; overflow: hidden; max-height: 380px;
        overflow-y: auto; display: none;
      }
      .ai-imp-footer {
        display: flex; gap: 10px; margin-top: 16px;
        align-items: center;
      }
      .ai-imp-btn-confirm {
        display: none; padding: 11px 28px; border-radius: 10px;
        border: none; background: linear-gradient(135deg,#00C805,#22c55e);
        color: #fff; font-size: 0.9375rem; font-weight: 600;
        cursor: pointer; font-family: inherit; transition: opacity 0.2s;
      }
      .ai-imp-btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
      .ai-imp-btn-cancel {
        padding: 11px 22px; border-radius: 10px;
        border: 1px solid var(--border-color, #e5e7eb);
        background: var(--bg-elevated, #fff);
        color: var(--text-primary, #1a1a1a);
        font-size: 0.875rem; font-weight: 600;
        cursor: pointer; font-family: inherit;
      }
      .ai-imp-tbl { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
      .ai-imp-tbl th {
        padding: 8px 12px; text-align: left;
        font-size: 0.6875rem; font-weight: 700;
        color: var(--text-tertiary, #999); text-transform: uppercase;
        letter-spacing: 0.05em;
        background: var(--bg-secondary, #f8f9fa);
        position: sticky; top: 0;
      }
      .ai-imp-tbl td {
        padding: 9px 12px; border-bottom: 1px solid var(--border-subtle, #f0f0f0);
        color: var(--text-primary, #1a1a1a);
      }
      .ai-imp-tbl tbody tr:last-child td { border-bottom: none; }
      .ai-imp-tbl tbody tr:hover { background: var(--hover-bg, #f8f9fa); }
      .ai-imp-sec { padding: 14px 16px; border-bottom: 1px solid var(--border-subtle, #f0f0f0); }
      .ai-imp-sec:last-child { border-bottom: none; }
      .ai-imp-sec-title {
        font-size: 0.8125rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.06em; color: var(--text-secondary, #666);
        margin-bottom: 10px; display: flex; align-items: center; gap: 8px;
      }
      .ai-imp-badge {
        background: rgba(0,102,255,0.1); color: var(--accent-primary, #0066ff);
        font-size: 0.625rem; padding: 2px 7px; border-radius: 20px;
        font-weight: 700;
      }
      .ai-imp-amount {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 700; color: var(--accent-primary, #0066ff);
      }
      .ai-imp-image-preview {
        max-width: 100%; max-height: 200px; border-radius: 10px;
        margin-top: 12px; display: none;
        border: 1px solid var(--border-color, #e5e7eb);
      }
      .ai-imp-member-assign {
        margin-top: 14px; border: 1px solid rgba(251,146,60,0.35);
        border-radius: 12px; overflow: hidden; background: rgba(251,146,60,0.04);
      }
      .ai-imp-member-assign-title {
        font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
        letter-spacing: 0.05em; color: #d97706; padding: 10px 14px 8px;
        background: rgba(251,146,60,0.08); border-bottom: 1px solid rgba(251,146,60,0.2);
        display: flex; align-items: center; gap: 6px;
      }
      .ai-imp-member-row {
        display: grid; grid-template-columns: 1fr auto;
        align-items: center; gap: 10px;
        padding: 8px 14px; border-bottom: 1px solid rgba(251,146,60,0.12);
        font-size: 0.8125rem;
      }
      .ai-imp-member-row:last-child { border-bottom: none; }
      .ai-imp-member-label { color: var(--text-primary, #1a1a1a); font-weight: 500; }
      .ai-imp-member-label span { color: var(--text-tertiary, #999); font-size: 0.75rem; font-weight: 400; margin-left: 6px; }
      .ai-imp-member-select {
        padding: 6px 10px; border-radius: 7px;
        border: 1px solid rgba(251,146,60,0.4);
        background: var(--bg-elevated, #fff);
        font-size: 0.8125rem; color: var(--text-primary, #1a1a1a);
        font-family: 'DM Sans', sans-serif; cursor: pointer;
        min-width: 140px;
      }
    `;
    document.head.appendChild(style);

    // Modal HTML
    const modal = document.createElement('div');
    modal.className = 'ai-imp-overlay';
    modal.id = 'aiImpModal_' + Math.random().toString(36).slice(2);
    modal.innerHTML = `
      <div class="ai-imp-box">
        <div class="ai-imp-header">
          <div>
            <div class="ai-imp-title">✨ <span class="ai-imp-title-text"></span></div>
            <div class="ai-imp-desc ai-imp-desc-text"></div>
          </div>
          <button class="ai-imp-close" aria-label="Close">×</button>
        </div>

        <!-- Tabs -->
        <div class="ai-imp-tabs">
          <button class="ai-imp-tab active" data-panel="paste">📋 Paste Text / Table</button>
          <button class="ai-imp-tab" data-panel="screenshot">🖼️ Screenshot</button>
          <button class="ai-imp-tab" data-panel="file">📁 Upload File</button>
        </div>

        <!-- Paste panel -->
        <div class="ai-imp-panel active" data-panel="paste">
          <textarea class="ai-imp-textarea ai-imp-paste-input"
            placeholder="Paste your data here…"></textarea>
        </div>

        <!-- Screenshot panel -->
        <div class="ai-imp-panel" data-panel="screenshot">
          <div class="ai-imp-dropzone ai-imp-img-zone">
            <div class="ai-imp-dropzone-icon">🖼️</div>
            <div class="ai-imp-dropzone-title">Click or drag & drop a screenshot</div>
            <div class="ai-imp-dropzone-hint">Supports PNG, JPG, WEBP — AI will read it directly</div>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif"
              style="display:none;" class="ai-imp-img-input">
          </div>
          <div class="ai-imp-file-chosen ai-imp-img-chosen">
            <span style="font-size:1.5rem;">🖼️</span>
            <div style="flex:1;">
              <div class="ai-imp-file-name ai-imp-img-name"></div>
              <div class="ai-imp-file-sub">Ready to parse</div>
            </div>
            <button style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--text-tertiary,#999);" class="ai-imp-img-clear">×</button>
          </div>
          <img class="ai-imp-image-preview ai-imp-img-preview" alt="preview">
        </div>

        <!-- File panel -->
        <div class="ai-imp-panel" data-panel="file">
          <div class="ai-imp-dropzone ai-imp-file-zone">
            <div class="ai-imp-dropzone-icon">📁</div>
            <div class="ai-imp-dropzone-title">Click or drag & drop a file</div>
            <div class="ai-imp-dropzone-hint">Supports .csv, .txt, .xlsx — max 10 MB</div>
            <input type="file" accept=".csv,.txt,.xlsx"
              style="display:none;" class="ai-imp-csv-input">
          </div>
          <div class="ai-imp-file-chosen ai-imp-csv-chosen">
            <span style="font-size:1.5rem;" class="ai-imp-csv-icon">📊</span>
            <div style="flex:1;">
              <div class="ai-imp-file-name ai-imp-csv-name"></div>
              <div class="ai-imp-file-sub ai-imp-csv-sub">Ready to parse</div>
            </div>
            <button style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--text-tertiary,#999);" class="ai-imp-csv-clear">×</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="ai-imp-actions">
          <button class="ai-imp-btn-parse">✨ Parse with AI</button>
          <span class="ai-imp-status"></span>
        </div>

        <!-- Preview -->
        <div class="ai-imp-preview"></div>

        <!-- Footer -->
        <div class="ai-imp-footer">
          <button class="ai-imp-btn-confirm">✓ Import Data</button>
          <button class="ai-imp-btn-cancel">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this._modalEl = modal;
    this._bindEvents();
  }

  _bindEvents() {
    const m = this._modalEl;

    // Close
    m.querySelector('.ai-imp-close').addEventListener('click', () => this.close());
    m.querySelector('.ai-imp-btn-cancel').addEventListener('click', () => this.close());
    m.addEventListener('click', e => { if (e.target === m) this.close(); });

    // Tabs
    m.querySelectorAll('.ai-imp-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        m.querySelectorAll('.ai-imp-tab').forEach(t => t.classList.remove('active'));
        m.querySelectorAll('.ai-imp-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        m.querySelector(`.ai-imp-panel[data-panel="${tab.dataset.panel}"]`).classList.add('active');
      });
    });

    // Screenshot upload
    const imgZone = m.querySelector('.ai-imp-img-zone');
    const imgInput = m.querySelector('.ai-imp-img-input');
    imgZone.addEventListener('click', () => imgInput.click());
    imgInput.addEventListener('change', e => this._handleImageFile(e.target.files[0]));
    m.querySelector('.ai-imp-img-clear').addEventListener('click', () => this._clearImage());
    this._setupDragDrop(imgZone, f => this._handleImageFile(f), ['image/']);

    // CSV upload
    const csvZone = m.querySelector('.ai-imp-file-zone');
    const csvInput = m.querySelector('.ai-imp-csv-input');
    csvZone.addEventListener('click', () => csvInput.click());
    csvInput.addEventListener('change', e => this._handleCsvFile(e.target.files[0]));
    m.querySelector('.ai-imp-csv-clear').addEventListener('click', () => this._clearCsv());
    this._setupDragDrop(csvZone, f => this._handleCsvFile(f), ['text/', '.csv', '.txt', '.xlsx', 'application/vnd']);

    // Parse
    m.querySelector('.ai-imp-btn-parse').addEventListener('click', () => this._parse());

    // Confirm
    m.querySelector('.ai-imp-btn-confirm').addEventListener('click', () => this._confirm());
  }

  _setupDragDrop(zone, handler, accepts) {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const f = e.dataTransfer.files[0];
      if (f) handler(f);
    });
  }

  _handleImageFile(file) {
    if (!file) return;
    const m = this._modalEl;
    this._imgFile = file;
    m.querySelector('.ai-imp-img-zone').style.display = 'none';
    const chosen = m.querySelector('.ai-imp-img-chosen');
    chosen.style.display = 'flex';
    m.querySelector('.ai-imp-img-name').textContent = file.name;

    // Show image preview
    const reader = new FileReader();
    reader.onload = e => {
      const preview = m.querySelector('.ai-imp-img-preview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }

  _clearImage() {
    this._imgFile = null;
    const m = this._modalEl;
    m.querySelector('.ai-imp-img-zone').style.display = '';
    m.querySelector('.ai-imp-img-chosen').style.display = 'none';
    m.querySelector('.ai-imp-img-preview').style.display = 'none';
    m.querySelector('.ai-imp-img-preview').src = '';
    m.querySelector('.ai-imp-img-input').value = '';
  }

  _handleCsvFile(file) {
    if (!file) return;
    if (/\.xls$/i.test(file.name) && !/\.xlsx$/i.test(file.name)) {
      alert('Legacy .xls format is not supported. Please save your file as .xlsx and try again.');
      return;
    }
    this._csvFile = file;
    const m = this._modalEl;
    m.querySelector('.ai-imp-file-zone').style.display = 'none';
    const chosen = m.querySelector('.ai-imp-csv-chosen');
    chosen.style.display = 'flex';
    m.querySelector('.ai-imp-csv-name').textContent = file.name;
    const isExcel = /\.xlsx$/i.test(file.name);
    m.querySelector('.ai-imp-csv-icon').textContent = isExcel ? '📗' : '📊';
    m.querySelector('.ai-imp-csv-sub').textContent = isExcel ? 'Excel file — will be converted to text for AI' : 'Ready to parse';
  }

  _clearCsv() {
    this._csvFile = null;
    const m = this._modalEl;
    m.querySelector('.ai-imp-file-zone').style.display = '';
    m.querySelector('.ai-imp-csv-chosen').style.display = 'none';
    m.querySelector('.ai-imp-csv-input').value = '';
  }

  _reset() {
    this._data = null;
    this._imgFile = null;
    this._csvFile = null;
    const m = this._modalEl;

    // Update title/desc from current config
    m.querySelector('.ai-imp-title-text').textContent = this.config.title || 'Import with AI';
    m.querySelector('.ai-imp-desc-text').textContent = this.config.description || 'Paste, screenshot or upload — AI extracts structured data automatically.';
    m.querySelector('.ai-imp-paste-input').placeholder = this.config.placeholder || 'Paste table, CSV rows, or describe your data…';

    m.querySelector('.ai-imp-paste-input').value = '';
    m.querySelector('.ai-imp-status').textContent = '';
    m.querySelector('.ai-imp-status').style.color = '';
    m.querySelector('.ai-imp-preview').style.display = 'none';
    m.querySelector('.ai-imp-preview').innerHTML = '';
    m.querySelector('.ai-imp-btn-confirm').style.display = 'none';
    m.querySelector('.ai-imp-btn-parse').disabled = false;

    // Reset tabs to first
    m.querySelectorAll('.ai-imp-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
    m.querySelectorAll('.ai-imp-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

    this._clearImage();
    this._clearCsv();
  }

  async _parse() {
    const m = this._modalEl;
    const activePanel = m.querySelector('.ai-imp-panel.active').dataset.panel;
    const status = m.querySelector('.ai-imp-status');
    const parseBtn = m.querySelector('.ai-imp-btn-parse');

    parseBtn.disabled = true;
    status.style.color = 'var(--text-secondary, #666)';
    status.textContent = '⏳ Parsing with AI…';
    m.querySelector('.ai-imp-preview').style.display = 'none';
    m.querySelector('.ai-imp-btn-confirm').style.display = 'none';
    this._data = null;

    try {
      const prompt = this.config.buildPrompt();
      let body;

      if (activePanel === 'screenshot' && this._imgFile) {
        const base64 = await this._fileToBase64(this._imgFile);
        const mediaType = this._imgFile.type || 'image/png';
        body = JSON.stringify({ prompt, imageBase64: base64, imageMediaType: mediaType });
      } else if (activePanel === 'file' && this._csvFile) {
        const isExcel = /\.xlsx$/i.test(this._csvFile.name);

        // ── Try direct broker-format parser first (no AI, no quota cost) ───
        if (isExcel && this.config.directParser) {
          status.textContent = '⏳ Detecting file format…';
          try {
            const directForm = new FormData();
            directForm.append('file', this._csvFile);
            const _dSb = await getSupabase();
            const { data: { session: _dSess } } = await _dSb.auth.getSession();
            const dResp = await fetch(this.config.directParser, {
              method: 'POST',
              headers: _dSess ? { 'Authorization': 'Bearer ' + _dSess.access_token } : {},
              body: directForm
            });
            if (dResp.ok) {
              const dData = await dResp.json();
              if (dData.recognized && Array.isArray(dData.data) && dData.data.length > 0) {
                this._data = dData.data;
                const count = dData.data.length;
                status.textContent = `✓ ${dData.broker || 'Broker'} format detected — ${count} holding${count !== 1 ? 's' : ''} imported directly.`;
                status.style.color = 'var(--success, #00C805)';
                const previewEl = m.querySelector('.ai-imp-preview');
                previewEl.innerHTML = this.config.renderPreview(this._data);
                previewEl.style.display = 'block';
                this._renderMemberAssign(previewEl);
                m.querySelector('.ai-imp-btn-confirm').style.display = 'inline-block';
                parseBtn.disabled = false;
                return;
              }
            }
          } catch (_) { /* fall through to AI */ }
          status.textContent = '⏳ Converting Excel to text…';
        }

        let fileText;
        if (isExcel) {
          status.textContent = '⏳ Converting Excel to text…';
          const form = new FormData();
          form.append('file', this._csvFile);
          const _cSb = await getSupabase();
          const { data: { session: _cSess } } = await _cSb.auth.getSession();
          const convResp = await fetch('/api/import/excel-to-text', {
            method: 'POST',
            headers: _cSess ? { 'Authorization': 'Bearer ' + _cSess.access_token } : {},
            body: form
          });
          if (!convResp.ok) throw new Error('Failed to convert Excel file');
          const convData = await convResp.json();
          fileText = convData.text || '';
          status.textContent = '⏳ Parsing with AI…';
        } else {
          fileText = await this._csvFile.text();
        }
        body = JSON.stringify({ prompt: prompt + '\n\nData:\n' + fileText.substring(0, 8000) });
      } else {
        const text = m.querySelector('.ai-imp-paste-input').value.trim();
        if (!text) { status.textContent = 'Please enter some data first.'; status.style.color = 'var(--error,#ef4444)'; parseBtn.disabled = false; return; }
        body = JSON.stringify({ prompt: prompt + '\n\nData:\n' + text.substring(0, 6000) });
      }

      const _aSb = await getSupabase();
      const { data: { session: _aSess } } = await _aSb.auth.getSession();
      const resp = await fetch('/api/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(_aSess ? { 'Authorization': 'Bearer ' + _aSess.access_token } : {}) },
        body
      });
      if (!resp.ok) throw new Error('API error ' + resp.status);
      const result = await resp.json();
      const raw = (result.result || '').trim();

      // Extract the first complete balanced JSON structure from the response
      const extracted = AIImport._extractJSON(raw);
      if (extracted === null) throw new Error('No structured data found in the response. Please add more detail to your input.');
      this._data = extracted;

      status.textContent = '✓ Data extracted — review below and confirm.';
      status.style.color = 'var(--success, #00C805)';

      const previewHtml = this.config.renderPreview(this._data);
      const previewEl = m.querySelector('.ai-imp-preview');
      previewEl.innerHTML = previewHtml;
      previewEl.style.display = 'block';

      this._renderMemberAssign(previewEl);

      m.querySelector('.ai-imp-btn-confirm').style.display = 'inline-block';

    } catch (err) {
      status.textContent = '✗ ' + (err.message || 'Failed to parse');
      status.style.color = 'var(--error, #ef4444)';
    }

    parseBtn.disabled = false;
  }

  _renderMemberAssign(previewEl) {
    const members = this.config.members;
    if (!Array.isArray(members) || members.length === 0) return;

    const memberNameSet = new Set(members.map(m => m.name.toLowerCase()));

    const items = Array.isArray(this._data) ? this._data : [];
    const unmatched = [];
    const seen = new Set();

    for (const item of items) {
      if (!item.memberName) continue;
      const key = item.memberName.toLowerCase();
      if (memberNameSet.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      unmatched.push({ originalName: item.memberName, key });
    }

    if (unmatched.length === 0) return;

    const esc = AIImport._esc;
    const optionsHtml = members.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join('');
    const rowsHtml = unmatched.map(u => `
      <div class="ai-imp-member-row">
        <div class="ai-imp-member-label">${esc(u.originalName)}<span>not matched</span></div>
        <select class="ai-imp-member-select" data-original="${esc(u.key)}">
          <option value="">— assign member —</option>
          ${optionsHtml}
        </select>
      </div>
    `).join('');

    const assignEl = document.createElement('div');
    assignEl.className = 'ai-imp-member-assign';
    assignEl.innerHTML = `
      <div class="ai-imp-member-assign-title">⚠ Unmatched members — assign before importing</div>
      ${rowsHtml}
    `;
    previewEl.appendChild(assignEl);
  }

  _applyMemberAssignments() {
    const members = this.config.members;
    if (!Array.isArray(members) || members.length === 0) return;

    const m = this._modalEl;
    const selects = m.querySelectorAll('.ai-imp-member-select');
    if (!selects.length) return;

    const assignMap = {};
    selects.forEach(sel => {
      const original = sel.dataset.original;
      const selectedId = sel.value ? Number(sel.value) : null;
      const selectedMember = members.find(mem => mem.id === selectedId);
      if (original && selectedMember) {
        assignMap[original] = { id: selectedMember.id, name: selectedMember.name };
      }
    });

    if (!Object.keys(assignMap).length) return;

    const items = Array.isArray(this._data) ? this._data : [];
    for (const item of items) {
      if (!item.memberName) continue;
      const key = item.memberName.toLowerCase();
      if (assignMap[key]) {
        item.memberId = assignMap[key].id;
        item.memberName = assignMap[key].name;
      }
    }
  }

  async _confirm() {
    const m = this._modalEl;
    if (!this._data) return;
    const btn = m.querySelector('.ai-imp-btn-confirm');
    const status = m.querySelector('.ai-imp-status');

    this._applyMemberAssignments();

    btn.disabled = true;
    status.style.color = 'var(--text-secondary, #666)';
    status.textContent = '⏳ Saving…';
    try {
      await this.config.onImport(this._data);
      status.textContent = '✓ Imported successfully!';
      status.style.color = 'var(--success, #00C805)';
      setTimeout(() => this.close(), 1200);
    } catch (err) {
      status.textContent = '✗ ' + (err.message || 'Save failed');
      status.style.color = 'var(--error, #ef4444)';
      btn.disabled = false;
    }
  }

  _fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        // Strip data:image/png;base64, prefix
        const b64 = e.target.result.split(',')[1];
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Robust JSON extractor ────────────────────────────────────────────────
  // Strips code fences, then walks character-by-character tracking bracket
  // depth so prose like "found [3] items" doesn't confuse the extraction.
  static _extractJSON(raw) {
    const text = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
    // Fast path: the whole trimmed string might already be valid JSON
    const trimmed = text.trim();
    if (trimmed[0] === '[' || trimmed[0] === '{') {
      try { return JSON.parse(trimmed); } catch {}
    }
    // Walk forward looking for the first balanced JSON structure
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch !== '[' && ch !== '{') continue;
      let depth = 0, inStr = false, esc = false;
      for (let j = i; j < text.length; j++) {
        const c = text[j];
        if (esc)              { esc = false; continue; }
        if (c === '\\' && inStr) { esc = true;  continue; }
        if (c === '"')           { inStr = !inStr; continue; }
        if (inStr)               { continue; }
        if (c === '[' || c === '{') depth++;
        else if (c === ']' || c === '}') {
          depth--;
          if (depth === 0) {
            try { return JSON.parse(text.slice(i, j + 1)); } catch { break; }
          }
        }
      }
    }
    return null;
  }

  // ── Shared preview helpers ───────────────────────────────────────────────

  static _esc(s) {
    if (s == null) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  static _rs(v) {
    const n = Number(v) || 0;
    if (n >= 10000000) return '₹' + (n/10000000).toFixed(2) + ' Cr';
    if (n >= 100000)   return '₹' + (n/100000).toFixed(2) + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }
}

window.AIImport = AIImport;
