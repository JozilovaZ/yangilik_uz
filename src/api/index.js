// ============================================================
//  API funksiyalari — sahifalar shu yerdan chaqiradi
// ============================================================
import { apiFetch, tokens } from "./client";
import {
    adaptArticleList, adaptArticleDetail, adaptCategory,
    adaptCurrency, adaptRate, adaptCity, adaptForecast, adaptHour,
} from "./adapters";

// ---- Maqolalar ----
export async function fetchArticles({ category, featured, search, page, ordering } = {}) {
    const data = await apiFetch("/articles/", {
        params: { category__slug: category, is_featured: featured, search, page, ordering },
    });
    // Paginatsiya: { count, next, previous, results }
    return {
        count: data.count ?? data.length ?? 0,
        next: data.next ?? null,
        results: (data.results || data).map(adaptArticleList),
    };
}

export async function fetchArticle(slug) {
    const data = await apiFetch(`/articles/${slug}/`);
    return adaptArticleDetail(data);
}

// ---- Kategoriyalar ----
export async function fetchCategories() {
    const data = await apiFetch("/categories/");
    return (data.results || data).map(adaptCategory);
}

// ---- Valyuta ----
export async function fetchCurrencies() {
    const data = await apiFetch("/currencies/");
    return (data.results || data).map(adaptCurrency);
}

export async function fetchCurrency(code) {
    const data = await apiFetch(`/currencies/${code}/`);
    return adaptCurrency(data);
}

export async function fetchCurrencyHistory(code) {
    // history endpoint Currency ni qaytaradi (ichida rates/history bo'lishi mumkin)
    const data = await apiFetch(`/currencies/${code}/history/`);
    const rates = data.history || data.rates || data.results || [];
    return {
        ...adaptCurrency(data),
        history: rates.map(adaptRate),
    };
}

// ---- Ob-havo ----
export async function fetchCities() {
    const data = await apiFetch("/cities/");
    return (data.results || data).map(adaptCity);
}

export async function fetchCityForecast(slug) {
    const data = await apiFetch(`/cities/${slug}/forecast/`);
    // Backend kunlar massivini to'g'ridan-to'g'ri ([...]), yoki obyekt ichida qaytarishi mumkin
    const isArr = Array.isArray(data);
    const days = isArr ? data : (data.forecast || data.days || data.results || []);
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayRaw = (isArr ? null : data.today) || days.find((d) => d.date === todayIso) || days[0] || null;
    return {
        city: isArr ? null : data.name,
        slug: isArr ? slug : data.slug,
        today: adaptForecast(todayRaw),
        days: days.map(adaptForecast),
    };
}

export async function fetchCityHourly(slug) {
    const data = await apiFetch(`/cities/${slug}/hourly/`);
    const hours = Array.isArray(data) ? data : (data.hourly || data.hours || data.results || []);
    return hours.map(adaptHour);
}

// ---- Auth ----
export async function login(username, password) {
    const data = await apiFetch("/auth/token/", { method: "POST", body: { username, password } });
    tokens.set(data); // { access, refresh }
    return data;
}

export async function register(payload) {
    // { username, email, password, password2, first_name, last_name }
    return apiFetch("/auth/register/", { method: "POST", body: payload });
}

export async function fetchMe() {
    return apiFetch("/auth/me/", { auth: true });
}

export function logout() {
    tokens.clear();
}

export { tokens };
