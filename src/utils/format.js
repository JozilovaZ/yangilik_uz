import { getLang } from "../api/client";

// Joriy tilga mos Intl lokali (sana/hafta nomlari uchun)
const LOCALE_MAP = { uz: "uz-UZ", "uz-cyrl": "uz-Cyrl-UZ", ru: "ru-RU", en: "en-US" };
export const locale = () => LOCALE_MAP[getLang()] || "uz-UZ";

// Sonni ming ajratgich (bo'sh joy) bilan: 12650 -> "12 650"
export const formatNumber = (n) =>
    new Intl.NumberFormat("en-US").format(Math.round(n)).replace(/,/g, " ");

// Vaqt: "09:30"
export const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });

// Faqat sana: "19.07.2026"
export const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(locale(), { day: "2-digit", month: "2-digit", year: "numeric" });

// Sana + vaqt: "19.07.2026 09:30"
export const formatDateTime = (iso) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString(locale(), { day: "2-digit", month: "2-digit", year: "numeric" });
    return `${date} ${formatTime(iso)}`;
};

// Bayroq kodi: USD -> us
export const flagCode = (code) => {
    const map = { USD: "us", EUR: "eu", RUB: "ru", GBP: "gb", CHF: "ch", JPY: "jp", CNY: "cn", KZT: "kz", TRY: "tr" };
    return map[code] || "un";
};

// Harorat: 28 -> "+28°", -5 -> "-5°"
export const formatTemp = (t) => `${t > 0 ? "+" : ""}${t}°`;
