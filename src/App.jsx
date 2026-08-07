import { useEffect, useState } from 'react';
import { authApi, tokenStorage } from './api/auth';
import { can, PERM } from './utils/permissions';
import { ThemeProvider } from './contexts/ThemeContext';
import FanChartPage from './pages/fanchart/FanChartPage';

// Вход в это приложение не реализуется здесь — он выдаётся основным порталом
// (filter-app). В проде оба приложения раздаются nginx'ом с одного origin
// (портал на "/", это приложение на "/graphs/"), поэтому localStorage с JWT
// общий и просто "виден" сразу после логина в портале — см.
// filter-app/src/status/FANCHART_EXTRACTION_PLAN.md.
//
// В локальной разработке порталы крутятся на разных портах (5173 vs 5174) —
// то есть на разных origin, и общего localStorage не будет: чтобы проверить
// это приложение локально, скопируйте access_token/refresh_token из
// localStorage портала руками (devtools) в localStorage localhost:5174.

function AccessDenied({ reason }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
      <div className="text-center space-y-3 max-w-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-white">Нет доступа</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{reason}</p>
        <a href="/" className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
          Вернуться в портал
        </a>
      </div>
    </div>
  );
}

function AppInner() {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStorage.getAccess()) {
        window.location.href = '/';
        return;
      }
      const { ok, data } = await authApi.profile();
      if (cancelled) return;
      if (!ok) {
        tokenStorage.clear();
        window.location.href = '/';
        return;
      }
      setState({ loading: false, user: data });
    })();
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка…</p>
      </div>
    );
  }

  if (!can(state.user, PERM.PAGE_GRAPH_READ)) {
    return <AccessDenied reason="У вашей учётной записи нет прав на просмотр графиков." />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <FanChartPage />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
