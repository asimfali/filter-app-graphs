import { useAuthGate, portalUrl, can, PERM } from 'portal-core';
import { ThemeProvider } from './contexts/ThemeContext';
import FanChartPage from './pages/fanchart/FanChartPage';

// Вход в это приложение не реализуется здесь — он выдаётся основным порталом
// (filter-app). В проде оба приложения раздаются nginx'ом с одного origin
// (портал на "/", это приложение на "/graphs/"), поэтому localStorage с JWT
// общий и просто "виден" сразу после логина в портале. Bootstrap-логика
// (проверка токена, профиль, право) — в portal-core#useAuthGate, здесь только
// вёрстка под каждый статус, см. portal-core/README.md.
//
// В локальной разработке — чтобы проверить это приложение, скопируйте
// access_token/refresh_token из localStorage портала (:5173) руками (devtools)
// в localStorage localhost:5174 и обновите страницу.

const PORTAL_URL = portalUrl();

function TopBar() {
  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-gray-700
                       px-6 py-3 flex items-center gap-3">
      <a href={PORTAL_URL} className="text-sm font-bold text-gray-900 dark:text-white hover:underline">
        ← Корпоративный портал
      </a>
      <span className="text-gray-300 dark:text-gray-600">/</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">Графики</span>
    </header>
  );
}

function CenteredMessage({ title, reason, children }) {
  return (
    <div className="min-h-[calc(100vh-53px)] flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
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
    <a href={PORTAL_URL} className="inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
      Вернуться в портал
    </a>
  );
}

function AppInner() {
  const { status, user } = useAuthGate(PERM.PAGE_GRAPH_READ);

  let body;
  if (status === 'loading') {
    body = <CenteredMessage title="Загрузка…" />;
  } else if (status === 'unauthenticated') {
    body = (
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
  } else if (status === 'denied' || !can(user, PERM.PAGE_GRAPH_READ)) {
    body = (
      <CenteredMessage title="Нет доступа" reason="У вашей учётной записи нет прав на просмотр графиков.">
        <PortalLink />
      </CenteredMessage>
    );
  } else {
    body = <FanChartPage />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <TopBar />
      {body}
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
