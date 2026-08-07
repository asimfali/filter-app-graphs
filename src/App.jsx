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
// Важно: переход на "/" — это ссылка, а не автоматический location.href-редирект.
// Авторедирект на "/" исторически зацикливался: локально порталы крутятся на
// разных портах (5173 vs 5174 — разные origin, общего localStorage нет), а "/"
// на dev-сервере графиков (base: '/graphs/') сама редиректит обратно на
// "/graphs/" — без токена там снова редирект на "/", и так по кругу без остановки.
// Кликабельная ссылка этого класса багов не создаёт в принципе — ни локально,
// ни в проде (даже если сессия истекла ровно в момент захода).
//
// В локальной разработке — чтобы проверить это приложение, скопируйте
// access_token/refresh_token из localStorage портала (:5173) руками (devtools)
// в localStorage localhost:5174 и обновите страницу.

function CenteredMessage({ title, reason, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
      <div className="text-center space-y-3 max-w-sm">
        <p className="text-lg font-medium text-gray-900 dark:text-white">{title}</p>
        {reason && <p className="text-sm text-gray-500 dark:text-gray-400">{reason}</p>}
        {children}
      </div>
    </div>
  );
}

function PortalLink() {
  return (
    <a href="/" className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
      Вернуться в портал
    </a>
  );
}

function AppInner() {
  const [status, setStatus] = useState('loading'); // loading | unauthenticated | denied | ready
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStorage.getAccess()) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }
      const { ok, data } = await authApi.profile();
      if (cancelled) return;
      if (!ok) {
        tokenStorage.clear();
        setStatus('unauthenticated');
        return;
      }
      setUser(data);
      setStatus('ready');
    })();
    return () => { cancelled = true; };
  }, []);

  if (status === 'loading') {
    return <CenteredMessage title="Загрузка…" />;
  }

  if (status === 'unauthenticated') {
    return (
      <CenteredMessage title="Вы не авторизованы" reason="Войдите в портал — эта страница использует вашу текущую сессию.">
        <PortalLink />
        {import.meta.env.DEV && (
          <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 max-w-xs mx-auto">
            Локальная разработка: портал и это приложение — разные origin (разные порты),
            общего localStorage нет, ссылка выше не сработает. Скопируйте access_token/
            refresh_token из localStorage портала в localStorage этой вкладки (DevTools →
            Application → Local Storage) и обновите страницу.
          </p>
        )}
      </CenteredMessage>
    );
  }

  if (!can(user, PERM.PAGE_GRAPH_READ)) {
    return (
      <CenteredMessage title="Нет доступа" reason="У вашей учётной записи нет прав на просмотр графиков.">
        <PortalLink />
      </CenteredMessage>
    );
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
