import { useState, useEffect } from "react";
import { useLang } from "../i18n/LanguageContext";
import { getLang } from "../api/client";

// Hook darajasidagi natija keshi — sahifalar orasida o'tganda darhol
// ko'rsatish uchun (stale-while-revalidate). key berilgan bo'lsa ishlaydi.
const _hookCache = new Map();

// Kesh localStorage'da ham saqlanadi — shunda sahifa refresh qilinganda
// (xotira keshi bo'sh bo'lsa) ma'lumot darhol ko'rsatiladi, "yuklanmoqda"
// matni chiqmaydi. Yangilanish orqa fonda ketadi.
const LS_PREFIX = "apicache:";

function lsGet(cacheKey) {
    try {
        const raw = localStorage.getItem(LS_PREFIX + cacheKey);
        return raw != null ? JSON.parse(raw) : undefined;
    } catch { return undefined; }
}

function lsSet(cacheKey, value) {
    try { localStorage.setItem(LS_PREFIX + cacheKey, JSON.stringify(value)); } catch { /* to'lgan bo'lsa e'tiborsiz */ }
}

// Xotira keshini localStorage bilan birga to'ldiradi
function cacheGet(cacheKey) {
    if (cacheKey == null) return undefined;
    if (_hookCache.has(cacheKey)) return _hookCache.get(cacheKey);
    const fromLs = lsGet(cacheKey);
    if (fromLs !== undefined) _hookCache.set(cacheKey, fromLs);
    return fromLs;
}

function cacheSet(cacheKey, value) {
    if (cacheKey == null) return;
    _hookCache.set(cacheKey, value);
    lsSet(cacheKey, value);
}

// Oldindan yuklab keshга qo'yish (masalan link ustiga hover bo'lganda).
// useApi bilan bir xil kalit sxemasini ishlatadi, shuning uchun sahifa
// ochilganda ma'lumot darhol tayyor bo'ladi.
export function prefetchApi(key, deps, fn) {
    const cacheKey = `${key}|${JSON.stringify(deps)}|${getLang()}`;
    if (_hookCache.has(cacheKey)) return;
    // Bir vaqtda takror bo'lmasligi uchun joyni band qilamiz
    _hookCache.set(cacheKey, undefined);
    Promise.resolve()
        .then(fn)
        .then((res) => { cacheSet(cacheKey, res); })
        .catch(() => { _hookCache.delete(cacheKey); });
}

// Umumiy data yuklash hook'i: { data, loading, error }
// deps yoki til o'zgarsa qayta yuklaydi.
// key — ixtiyoriy: berilsa, natija keshlanadi va keyingi tashrifda
//       darhol (yuklanishsiz) ko'rsatiladi, yangilanish esa orqa fonda ketadi.
export function useApi(fn, deps = [], initial = null, key = null) {
    const { lang } = useLang();
    const cacheKey = key != null ? `${key}|${JSON.stringify(deps)}|${lang}` : null;
    const cached = cacheGet(cacheKey);
    const hasCached = cached !== undefined;

    const [data, setData] = useState(hasCached ? cached : initial);
    // Keshda bor bo'lsa — yuklanishni ko'rsatmaymiz
    const [loading, setLoading] = useState(!hasCached);
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;
        const c = cacheGet(cacheKey);
        if (c !== undefined) {
            // Keshdagi qiymatni darhol ko'rsatamiz, yuklanishsiz revalidatsiya
            setData(c);
            setLoading(false);
        } else {
            setLoading(true);
        }
        setError(null);
        Promise.resolve()
            .then(fn)
            .then((res) => {
                if (!alive) return;
                setData(res);
                cacheSet(cacheKey, res);
            })
            .catch((e) => { if (alive) { setError(e); console.error(e); } })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, lang]);

    return { data, loading, error };
}
