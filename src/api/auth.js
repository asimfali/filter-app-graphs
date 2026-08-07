// Урезанная копия filter-app/src/api/auth.js — только то, что нужно приложению
// "Графики": чтение уже выданного портальным логином JWT + профиль пользователя.
// Логин/2FA/регистрация здесь намеренно не реализуются — см.
// filter-app/src/status/FANCHART_EXTRACTION_PLAN.md. При отсутствии/протухании
// токена App.jsx редиректит на "/" (корень портала на том же origin).

const BASE = '/api/v1/auth';

export const tokenStorage = {
  getAccess: () => localStorage.getItem('access_token'),
  getRefresh: () => localStorage.getItem('refresh_token'),
  set: (access, refresh) => {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export async function apiFetch(url, options = {}) {
  const headers = {
    ...options.headers,
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const access = tokenStorage.getAccess();
  if (access) headers['Authorization'] = `Bearer ${access}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && tokenStorage.getRefresh()) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.getAccess()}`;
      return fetch(url, { ...options, headers });
    }
    tokenStorage.clear();
  }

  return res;
}

async function refreshTokens() {
  try {
    const res = await fetch(`${BASE}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokenStorage.getRefresh() }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStorage.set(data.access, data.refresh);
    return true;
  } catch {
    return false;
  }
}

export const authApi = {
  async profile() {
    const res = await apiFetch(`${BASE}/profile/`);
    return { ok: res.ok, data: await res.json() };
  },
};
