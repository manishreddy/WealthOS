// WealthOS API Client - centralized data access layer
// All pages import this via <script src="/api.js"></script>

const WealthAPI = (() => {
  const BASE = '/api';

  function getToken() {
    return localStorage.getItem('wealthos_jwt');
  }

  function setToken(token) {
    localStorage.setItem('wealthos_jwt', token);
  }

  function clearToken() {
    localStorage.removeItem('wealthos_jwt');
    localStorage.removeItem('wealthos_user_cache');
  }

  function headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    };
  }

  async function request(method, path, body) {
    try {
      const opts = { method, headers: headers() };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(BASE + path, opts);
      if (res.status === 401) {
        clearToken();
        window.location.href = '/login.html';
        return null;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.error(`API ${method} ${path}:`, err.message);
      throw err;
    }
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = {
    async login(email, password) {
      const data = await request('POST', '/auth/login', { email, password });
      if (data?.token) {
        setToken(data.token);
        localStorage.setItem('wealthos_user_cache', JSON.stringify(data.user));
      }
      return data;
    },

    async signup(email, password, familyName, userName) {
      const data = await request('POST', '/auth/signup', { email, password, familyName, userName });
      if (data?.token) {
        setToken(data.token);
        localStorage.setItem('wealthos_user_cache', JSON.stringify(data.user));
      }
      return data;
    },

    logout() {
      clearToken();
      window.location.href = '/login.html';
    },

    async me() {
      return request('GET', '/auth/me');
    },

    isLoggedIn() {
      return !!getToken();
    },

    getCachedUser() {
      try {
        return JSON.parse(localStorage.getItem('wealthos_user_cache'));
      } catch { return null; }
    },

    // Call this at top of every protected page
    requireAuth() {
      if (!getToken()) {
        window.location.href = '/login.html';
        return false;
      }
      return true;
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
      // member: { name, age, role, riskProfile }
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
      // data: { income, expenditure, investments, incomeBreakup, expenseBreakup, investmentBreakup }
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
      // item: { name, assetClass, subCategory, amount, frequency, startMonth }
      return request('POST', `/savings/${memberId}`, item);
    },

    async update(memberId, id, item) {
      return request('PUT', `/savings/${memberId}/${id}`, item);
    },

    async remove(memberId, id) {
      return request('DELETE', `/savings/${memberId}/${id}`);
    },

    async updateTargets(memberId, targets) {
      // targets: { equityPct, debtPct, goldPct, othersPct, useAgeBased }
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
      // asset: { assetType, name, assetClass, purchaseValue, currentValue, units, notes, year, month }
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
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(BASE + '/portfolio/parse-zerodha', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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
      // goal: { name, goalType, targetAmount, currentAmount, monthlyContribution, targetDate, assignedMembers, notes }
      return request('POST', '/goals', goal);
    },

    async update(id, goal) {
      return request('PUT', `/goals/${id}`, goal);
    },

    async remove(id) {
      return request('DELETE', `/goals/${id}`);
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
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
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
    wealthbot,
    // Helpers exposed globally
    formatCurrency,
    getCurrentYearMonth,
    getCurrentTaxYear,
    getToken,
    setToken,
    clearToken
  };
})();
