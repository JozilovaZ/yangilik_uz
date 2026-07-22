import { createContext, useContext, useState, useCallback } from "react";
import { getLang, setLang as persistLang } from "../api/client";
import { translations } from "./translations";

// Qo'llab-quvvatlanadigan tillar (backend: uz | uz-cyrl | ru | en)
export const LANGUAGES = [
    { code: "uz", short: "UZ", label: "O'zbekcha" },
    { code: "uz-cyrl", short: "ЎЗ", label: "Ўзбекча" },
    { code: "ru", short: "RU", label: "Русский" },
    { code: "en", short: "EN", label: "English" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(getLang());

    const changeLang = useCallback((code) => {
        persistLang(code);          // localStorage + client.js
        setLangState(getLang());    // qayta render -> useApi qayta yuklaydi
        document.documentElement.lang = code;
    }, []);

    return (
        <LanguageContext.Provider value={{ lang, setLang: changeLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    // Provider tashqarisida ishlatilsa ham buzilmasin
    return ctx || { lang: getLang(), setLang: () => {} };
}

// Tarjima funksiyasi: t("currency.title"), t("fx.asOf", { date })
export function useT() {
    const { lang } = useLang();
    return useCallback(
        (key, vars) => {
            const dict = translations[lang] || translations.uz;
            let str = dict[key] ?? translations.uz[key] ?? key;
            if (vars) {
                for (const [k, v] of Object.entries(vars)) {
                    str = str.replaceAll(`{${k}}`, v);
                }
            }
            return str;
        },
        [lang]
    );
}
