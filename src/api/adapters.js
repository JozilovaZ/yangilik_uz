// ============================================================
//  Adapterlar — backend JSON -> komponentlar kutgan format
//  Backend maydonlari (schema): snake_case; komponentlar: camelCase
// ============================================================
import { mediaUrl } from "./client";

// Ob-havo holati (backend condition) -> hero fon klassi kaliti
const CONDITION_MAP = {
    clear: "clear", sunny: "clear",
    partly: "partly", partly_cloudy: "partly",
    cloudy: "cloudy", overcast: "cloudy",
    rain: "rain", rainy: "rain", drizzle: "rain",
    snow: "snow", snowy: "snow",
};
export const mapCondition = (c) => CONDITION_MAP[String(c || "").toLowerCase()] || "clear";

// ---- Maqola (ro'yxat kartasi) ----
export function adaptArticleList(a) {
    return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        category: { name: a.category_name || a.category?.name, slug: a.category?.slug || a.category },
        coverImage: mediaUrl(a.cover_image),
        publishedAt: a.published_at,
        views: a.views_count ?? 0,
        isFeatured: a.is_featured,
    };
}

// ---- Maqola (to'liq) ----
export function adaptArticleDetail(a) {
    const authorName = a.author || "UZLIFE";
    return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary,
        bodyHtml: a.body || "",
        category: { name: a.category?.name || a.category_name, slug: a.category?.slug },
        cover: mediaUrl(a.cover_image),
        author: { name: authorName, initial: authorName.charAt(0).toUpperCase() || "U" },
        publishedAt: a.published_at,
        views: a.views_count ?? 0,
        readMinutes: Math.max(1, Math.round((a.body || "").split(/\s+/).length / 200)),
    };
}

// ---- Kategoriya ----
export function adaptCategory(c) {
    return { id: c.id, name: c.name, slug: c.slug, count: c.articles_count };
}

// ---- Valyuta ----
export function adaptCurrency(c) {
    const r = c.latest_rate || {};
    return {
        code: c.code,
        name: c.name,
        flag: c.flag_emoji || "🏳️",
        symbol: c.symbol,
        rate: parseFloat(r.rate) || 0,
        diff: parseFloat(r.diff) || 0,
        isUp: r.is_up ?? (parseFloat(r.diff) > 0),
        isDown: r.is_down ?? (parseFloat(r.diff) < 0),
        date: r.date,
    };
}

// Kurs tarixi yozuvi
export function adaptRate(r) {
    return {
        date: r.date,
        rate: parseFloat(r.rate) || 0,
        diff: parseFloat(r.diff) || 0,
        isUp: r.is_up ?? (parseFloat(r.diff) > 0),
    };
}

// ---- Ob-havo (bitta kunlik prognoz) ----
export function adaptForecast(f) {
    if (!f) return null;
    return {
        date: f.date,
        condition: mapCondition(f.condition),
        label: f.condition_display || "",
        icon: f.icon || "fa-sun",
        tempNow: f.temp_now ?? null,
        tempMax: f.temp_max,
        tempMin: f.temp_min,
    };
}

// ---- Shahar (today bilan) ----
export function adaptCity(c) {
    return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        isDefault: c.is_default,
        today: adaptForecast(c.today),
    };
}

// ---- Soatlik yozuv ----
export function adaptHour(h) {
    // Backend {date, hour, label} yoki to'liq {time/datetime} qaytarishi mumkin
    let d = h.time || h.datetime || h.timestamp || null;
    if (!d && h.date != null && h.hour != null) {
        const hh = String(h.hour).padStart(2, "0");
        d = `${h.date}T${hh}:00:00`;
    }
    if (!d) d = h.date || null;
    const dt = d ? new Date(d) : null;
    const label = h.label
        || (h.hour != null ? `${String(h.hour).padStart(2, "0")}:00` : null)
        || (dt ? dt.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }) : "");
    return {
        iso: d,
        dayKey: h.date || (dt ? dt.toISOString().slice(0, 10) : null), // "YYYY-MM-DD"
        label,
        icon: h.icon || "fa-sun",
        temp: h.temp ?? h.temperature ?? h.temp_now,
        feels: h.feels ?? h.feels_like ?? h.apparent_temperature ?? null,
    };
}
