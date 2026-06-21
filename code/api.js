// WealthOS API Client - centralized data access layer
// All pages import this via <script src="/api.js"></script>

const WealthAPI = (() => {
  const BASE = '/api';

  async function headers() {
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return {
      'Content-Type': 'application/json',
      ...(session ? { 'Authorization': 'Bearer ' + session.access_token } : {})
    };
  }

  async function request(method, path, body) {
    try {
      const opts = { method, headers: await headers() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(BASE + path, opts);
      if (res.status === 401) {
        window.location.href = '/login';
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        console.error(`API ${method} ${path}: network error`);
      } else {
        console.error(`API ${method} ${path}:`, err.message);
      }
      throw err;
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = {
    login() {
      window.location.href = '/login';
    },

    logout() {
      (async()=>{ const s=await getSupabase(); await s.auth.signOut(); window.location.href='/login'; })();
    },

    async me() {
      return request('GET', '/auth/user');
    },

    async isLoggedIn() {
      try {
        const s=await getSupabase(); const {data:{session}}=await s.auth.getSession(); return !!session;
      } catch {
        return false;
      }
    },

    async getUser() {
      try {
        const h = await headers();
        const res = await fetch('/api/auth/user', { headers: h });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    },

    async requireAuth() {
      const s=await getSupabase(); const {data:{session}}=await s.auth.getSession(); if(!session){window.location.href='/login';return false;}return true;
    },

    getCachedUser() {
      return null;
    },

    async updateProfile({ name, age, dob } = {}) {
      return request('PUT', '/auth/profile', { name, age, dob });
    }
  };

  // ── Family ────────────────────────────────────────────────────────────────
  const family = {
    async get() {
      return request('GET', '/family');
    },

    async updateName(familyName) {
      return request('PUT', '/family', { familyName });
    },

    async getMembers() {
      return request('GET', '/family/members');
    },

    async addMember(member) {
      return request('POST', '/family/members', member);
    },

    async updateMember(id, member) {
      return request('PUT', `/family/members/${id}`, member);
    },

    async deleteMember(id) {
      return request('DELETE', `/family/members/${id}`);
    }
  };

  // ── Monthly Tracker ───────────────────────────────────────────────────────
  const monthly = {
    async getMonth(year, month) {
      return request('GET', `/monthly/${year}/${month}`);
    },

    async getMemberMonth(year, month, memberId) {
      return request('GET', `/monthly/${year}/${month}/${memberId}`);
    },

    async save(year, month, memberId, data) {
      return request('PUT', `/monthly/${year}/${month}/${memberId}`, data);
    },

    async history(memberId, months = 6) {
      return request('GET', `/monthly/history/${memberId}?months=${months}`);
    },

    async deleteMonth(year, month, memberId) {
      const qs = memberId ? `?memberId=${memberId}` : '';
      return request('DELETE', `/monthly/${year}/${month}${qs}`);
    }
  };

  // ── Savings Plan ──────────────────────────────────────────────────────────
  const savings = {
    async get(memberId) {
      return request('GET', `/savings/${memberId}`);
    },

    async add(memberId, item) {
      return request('POST', `/savings/${memberId}`, item);
    },

    async update(memberId, id, item) {
      return request('PUT', `/savings/${memberId}/${id}`, item);
    },

    async remove(memberId, id) {
      return request('DELETE', `/savings/${memberId}/${id}`);
    },

    async updateTargets(memberId, targets) {
      return request('PUT', `/savings/${memberId}/targets`, targets);
    }
  };

  // ── Portfolio ─────────────────────────────────────────────────────────────
  const portfolio = {
    async getAll(year, month) {
      return request('GET', `/portfolio?year=${year}&month=${month}`);
    },

    async summary(year, month) {
      return request('GET', `/portfolio/summary?year=${year}&month=${month}`);
    },

    async getMember(memberId, year, month) {
      return request('GET', `/portfolio/${memberId}?year=${year}&month=${month}`);
    },

    async add(memberId, asset) {
      return request('POST', `/portfolio/${memberId}`, asset);
    },

    async update(memberId, id, asset) {
      return request('PUT', `/portfolio/${memberId}/${id}`, asset);
    },

    async remove(memberId, id) {
      return request('DELETE', `/portfolio/${memberId}/${id}`);
    },

    async copyMonth(fromYear, fromMonth, toYear, toMonth) {
      return request('POST', '/portfolio/copy-month', { fromYear, fromMonth, toYear, toMonth });
    },

    async deleteMonth(year, month, memberId) {
      const qs = memberId ? `?year=${year}&month=${month}&memberId=${memberId}` : `?year=${year}&month=${month}`;
      return request('DELETE', `/portfolio/delete-month${qs}`);
    },

    async parseZerodha(file) {
      const form = new FormData();
      form.append('file', file);
      const sb = await getSupabase();
      const { data: { session: _zs } } = await sb.auth.getSession();
      const res = await fetch(BASE + '/portfolio/parse-zerodha', {
        method: 'POST',
        headers: _zs ? { 'Authorization': 'Bearer ' + _zs.access_token } : {},
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    },

    async parseCAS(file, password) {
      const form = new FormData();
      form.append('file', file);
      form.append('password', password);
      const sb = await getSupabase();
      const { data: { session } } = await sb.auth.getSession();
      const res = await fetch(BASE + '/import/parse-cas', {
        method: 'POST',
        headers: session ? { 'Authorization': 'Bearer ' + session.access_token } : {},
        body: form
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    }
  };

  // ── Goals ─────────────────────────────────────────────────────────────────
  const goals = {
    async getAll() {
      return request('GET', '/goals');
    },

    async add(goal) {
      return request('POST', '/goals', goal);
    },

    async update(id, goal) {
      return request('PUT', `/goals/${id}`, goal);
    },

    async remove(id) {
      return request('DELETE', `/goals/${id}`);
    },

    async toggleActive(id) {
      return request('PATCH', `/goals/${id}/toggle-active`);
    }
  };

  // ── Financial Planning ────────────────────────────────────────────────────
  const planning = {
    async retirement(memberId) {
      return request('GET', `/planning/retirement/${memberId}`);
    },

    async tax(memberId, year) {
      const y = year || getCurrentTaxYear();
      return request('GET', `/planning/tax/${memberId}?year=${y}`);
    },

    async updateTax(memberId, data) {
      return request('PUT', `/planning/tax/${memberId}`, data);
    },

    async networthProjection() {
      return request('GET', '/planning/networth-projection');
    },

    async comprehensive() {
      return request('GET', '/planning/comprehensive');
    },

    async aiInsights(comprehensiveData) {
      return request('POST', '/planning/ai-insights', { comprehensiveData });
    },

    async saveConfig(updates) {
      return request('PUT', '/planning/config', updates);
    }
  };

  // ── Setup Progress ────────────────────────────────────────────────────────
  const setup = {
    async getProgress() {
      return request('GET', '/setup/progress');
    },

    async markStep(step, done = 1) {
      return request('PUT', '/setup/progress', { step, done });
    }
  };

  // ── FIRE Settings ─────────────────────────────────────────────────────────
  const fire = {
    async getSettings() {
      return request('GET', '/fire/settings');
    },
    async saveSettings(data) {
      return request('PUT', '/fire/settings', data);
    },
    async resetSettings() {
      return request('DELETE', '/fire/settings');
    }
  };

  // ── Liabilities ───────────────────────────────────────────────────────────
  const liabilities = {
    async getAll() {
      return request('GET', '/liabilities');
    },

    async add(data) {
      return request('POST', '/liabilities', data);
    },

    async update(id, data) {
      return request('PUT', `/liabilities/${id}`, data);
    },

    async remove(id) {
      return request('DELETE', `/liabilities/${id}`);
    },

    async amortization(id) {
      return request('GET', `/liabilities/${id}/amortization`);
    },

    async syncToProjections() {
      return request('POST', '/liabilities/sync-to-projections');
    }
  };

  // ── WealthBot ─────────────────────────────────────────────────────────────
  const wealthbot = {
    async chat(message, conversationHistory = []) {
      return request('POST', '/wealthbot/chat', { message, conversationHistory });
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getCurrentTaxYear() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (month <= 3) return `FY${year - 1}-${String(year).slice(2)}`;
    return `FY${year}-${String(year + 1).slice(2)}`;
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '₹0';
    const n = Number(amount);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.?0+$/, '') + ' Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(2).replace(/\.?0+$/, '') + ' L';
    return '₹' + n.toLocaleString('en-IN');
  }

  function getCurrentYearMonth() {
    const now = new Date();
    // Default to last completed month (previous month), not the current in-progress month
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { year: prev.getFullYear(), month: prev.getMonth() + 1 };
  }

  return {
    auth,
    family,
    monthly,
    savings,
    portfolio,
    goals,
    planning,
    setup,
    fire,
    liabilities,
    wealthbot,
    formatCurrency,
    getCurrentYearMonth,
    getCurrentTaxYear
  };
})();
