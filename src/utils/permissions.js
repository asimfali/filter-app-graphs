// Урезанная копия filter-app/src/utils/permissions.js — только код,
// которым в основном портале гейтится страница "Графики" (Header.jsx, PAGE_GRAPH_READ).
// Источник истины по-прежнему бэкенд (RBACService); держать в синхроне с
// filter-app/src/utils/permissions.js вручную, пока это единственный вынесенный модуль
// (см. filter-app/src/status/FANCHART_EXTRACTION_PLAN.md — про общий пакет на будущее).

export const can = (user, code) => {
    if (!user) return false;
    return user.permissions?.includes(code) ?? false;
};

export const PERM = {
    PAGE_GRAPH_READ: 'page.graph.read',
};
