// Shared Supabase client — loaded by all pages before api.js
let _supabase = null;

async function getSupabase() {
  if (_supabase) return _supabase;
  const cfg = await fetch('/api/config').then(r => r.json());
  _supabase = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  _supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') window.location.href = '/login';
  });
  return _supabase;
}
