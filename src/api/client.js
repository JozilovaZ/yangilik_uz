// ============================================================
//  API klient — UzLife backend (drf-spectacular)
//  Base: http://144.91.118.72:8003/api/v1
//  Til: ?lang=uz|uz-cyrl|ru|en
// ============================================================

// Dev'da nisbiy "/api/v1" (Vite proksi), prod'da to'liq URL bo'lishi mumkin
export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "";

// Nisbiy API_URL'ni absolyut qilish uchun asos (new URL absolyut talab qiladi)
const API_BASE = /^https?:\/\//.test(API_URL)
    ? API_URL
    : (typeof window !== "undefined" ? window.location.origin : "http://localhost") + API_URL;

// Joriy til — til almashtirgich orqali o'zgaradi, localStorage'da saqlanadi
const LANG_KEY = "uzlife_lang";
export const SUPPORTED_LANGS = ["uz", "uz-cyrl", "ru", "en"];

let _lang = localStorage.getItem(LANG_KEY) || "uz";
if (!SUPPORTED_LANGS.includes(_lang)) _lang = "uz";

export const getLang = () => _lang;
export const setLang = (l) => {
    if (!SUPPORTED_LANGS.includes(l)) return;
    _lang = l;
    localStorage.setItem(LANG_KEY, l);
};

// JWT token'lar localStorage'da saqlanadi
const ACCESS_KEY = "uzlife_access";
const REFRESH_KEY = "uzlife_refresh";

export const tokens = {
    get access() { return localStorage.getItem(ACCESS_KEY); },
    get refresh() { return localStorage.getItem(REFRESH_KEY); },
    set({ access, refresh }) {
        if (access) localStorage.setItem(ACCESS_KEY, access);
        if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    },
    clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
    get isAuthed() { return !!localStorage.getItem(ACCESS_KEY); },
};

// Media url'ni to'g'rilash.
// Backend rasmni portsiz host bilan qaytaradi (masalan http://144.91.118.72/media/..)
// — u 301 redirect qiladi va rasm ochilmaydi. Shu sabab faqat YO'L qismini olib,
// ishlaydigan manzilga yo'naltiramiz: dev'da proksi (/media -> :8003), prod'da MEDIA_URL.
export function mediaUrl(path) {
    if (!path) return null;
    let p = path;
    if (/^https?:\/\//.test(path)) {
        try {
            const u = new URL(path);
            p = u.pathname + u.search; // "/media/news/..jpg"
        } catch {
            return path;
        }
    }
    if (!p.startsWith("/")) p = "/" + p;
    return MEDIA_URL + p; // dev: "" + "/media/.." (proksi), prod: to'liq host
}

// ---- GET so'rovlari uchun kesh + in-flight dedup ----
// Bir xil GET manzil bir necha komponent tomonidan bir vaqtda so'ralsa,
// bitta tarmoq so'roviga birlashtiriladi; natija qisqa muddat keshlanadi.
const CACHE_TTL = 60_000; // 60 soniya
const _cache = new Map();     // key -> { at, data }
const _inflight = new Map();  // key -> Promise

export function clearApiCache() {
    _cache.clear();
    _inflight.clear();
}

// Asosiy so'rov funksiyasi
export async function apiFetch(path, { method = "GET", params, body, auth = false } = {}) {
    const url = new URL(API_BASE + path);
    // Vercel'ning [...path] serverless catch-all funksiyasi trailing slash bilan
    // tugagan URL'ni TUTMAYDI (o'zining 404'ini beradi). Prod'da proksi funksiya
    // backend uchun "/"ni o'zi qayta qo'shadi, shuning uchun bu yerda olib tashlaymiz.
    // Dev'da Vite proksi to'g'ridan-to'g'ri DRF'ga uzatadi — u trailing slash talab qiladi.
    if (import.meta.env.PROD && url.pathname.length > 1 && url.pathname.endsWith("/")) {
        url.pathname = url.pathname.replace(/\/+$/, "");
    }
    url.searchParams.set("lang", getLang());
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
        }
    }

    // Faqat autentifikatsiyasiz GET so'rovlarini keshlaymiz
    const cacheable = method === "GET" && !auth;
    const key = url.toString();
    if (cacheable) {
        const hit = _cache.get(key);
        if (hit && Date.now() - hit.at < CACHE_TTL) return hit.data;
        const pending = _inflight.get(key);
        if (pending) return pending;
    }

    const headers = { "Content-Type": "application/json" };
    if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

    const doFetch = _rawFetch(url, method, headers, body, path);
    if (cacheable) {
        const p = doFetch.then((data) => {
            _cache.set(key, { at: Date.now(), data });
            _inflight.delete(key);
            return data;
        }).catch((e) => { _inflight.delete(key); throw e; });
        _inflight.set(key, p);
        return p;
    }
    return doFetch;
}

async function _rawFetch(url, method, headers, body, path) {
    const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        let detail;
        try { detail = await res.json(); } catch { detail = await res.text().catch(() => ""); }
        const err = new Error(`API ${res.status}: ${path}`);
        err.status = res.status;
        err.detail = detail;
        throw err;
    }
    if (res.status === 204) return null;
    return res.json();
}
