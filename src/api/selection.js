// Урезанная копия filter-app/src/api/selection.js — только методы fan-charts*,
// которые использует страница "Графики". Остальные методы (proposals, calculate,
// config, dxf-import) относятся к странице "Подбор" и остались в filter-app,
// см. filter-app/src/status/FANCHART_EXTRACTION_PLAN.md.
import { apiFetch } from './auth';

const BASE = '/api/v1/selection';

export const selectionApi = {
    async fanCharts(productExternalId = '') {
        const url = productExternalId
            ? `${BASE}/fan-charts/?product=${encodeURIComponent(productExternalId)}`
            : `${BASE}/fan-charts/`
        const res = await apiFetch(url)
        return { ok: res.ok, data: await res.json() }
    },

    async fanChartDetail(chartId) {
        const res = await apiFetch(`${BASE}/fan-charts/${chartId}/`);
        return { ok: res.ok, data: await res.json() };
    },

    async fanChartCreate(payload) {
        const res = await apiFetch(`${BASE}/fan-charts/`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { ok: res.ok, data: await res.json() };
    },

    async fanChartSave(chartId, payload) {
        const res = await apiFetch(`${BASE}/fan-charts/${chartId}/save/`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { ok: res.ok, data: await res.json() };
    },

    async fanChartOperatingPoint(chartId, qRef, pvRef, curveId = null) {
        const body = { q_ref: qRef, pv_ref: pvRef };
        if (curveId) body.curve_id = curveId;
        const res = await apiFetch(`${BASE}/fan-charts/${chartId}/operating-point/`, {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return { ok: res.ok, data: await res.json() };
    },

    async fanChartCombined(product) {
        const res = await apiFetch(`${BASE}/fan-charts/combined/?product=${encodeURIComponent(product)}`);
        return { ok: res.ok, data: await res.json() };
    },

    async fanChartSelect(qRef, pvRef, productFilter = '', nAbove = 3, nBelow = 0, qMax = null, pvMax = null) {
        const res = await apiFetch(`${BASE}/fan-charts/select/`, {
            method: 'POST',
            body: JSON.stringify({
                q_ref: qRef,
                pv_ref: pvRef,
                product_filter: productFilter,
                n_above: nAbove,
                n_below: nBelow,
                include_curves: true,
            }),
        });
        return { ok: res.ok, data: await res.json() };
    },
};
