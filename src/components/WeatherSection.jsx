import { useState } from "react";
import { fetchCities, fetchCityForecast } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";
import { formatTemp, locale } from "../utils/format";

// Ob-havo holatiga qarab fon klassi
const bgClass = {
    clear: "wxa-clear", partly: "wxa-partly", cloudy: "wxa-cloudy", rain: "wxa-rain", snow: "wxa-snow",
};

// Sana -> qisqa hafta kuni
const weekdayShort = (iso) => new Date(iso).toLocaleDateString(locale(), { weekday: "short" });

function AccItem({ q, open, onToggle, children }) {
    return (
        <div className="border-t border-line last:border-b">
            <button onClick={onToggle} className="w-full flex items-center justify-between gap-3 py-[22px] px-0.5 text-left font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight text-ink">
                {q}
                <i className={`fa-solid fa-chevron-down text-base transition-transform duration-300 ${open ? "rotate-180 text-sky" : "text-gray"}`} />
            </button>
            <div className={`acc-body ${open ? "is-open" : ""}`}>
                <div>{children}</div>
            </div>
        </div>
    );
}

export default function WeatherSection() {
    const t = useT();
    const [open, setOpen] = useState(0);
    const toggle = (i) => setOpen((cur) => (cur === i ? -1 : i));

    // Standart shaharni topib, uning prognozini yuklaymiz
    const { data: cities } = useApi(fetchCities, [], [], "cities");
    const defaultCity = (cities || []).find((c) => c.isDefault) || (cities || [])[0];
    const { data: forecast } = useApi(
        () => (defaultCity ? fetchCityForecast(defaultCity.slug) : Promise.resolve(null)),
        [defaultCity?.slug],
        null,
        "forecast"
    );

    if (!defaultCity || !forecast?.today) return null;

    const today = forecast.today;
    const weather = {
        city: forecast.city || defaultCity.name,
        condition: today.condition,
        conditionLabel: today.label,
        icon: today.icon,
        tempNow: today.tempNow ?? today.tempMax,
        tempMax: today.tempMax,
        tempMin: today.tempMin,
        nextDays: (forecast.days || []).slice(1, 6).map((d) => ({
            weekday: weekdayShort(d.date), icon: d.icon, max: d.tempMax, min: d.tempMin,
        })),
    };

    return (
        <>
        {/* Sarlavha — "Valyuta kursi" bilan bir xil uslubda */}
        <h2 className="flex items-center gap-2.5 m-0 mb-6 text-[26px] font-extrabold tracking-tight text-ink">
            <img className="w-[34px] h-[34px] object-contain" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26c5.png" alt="" loading="lazy" />
            {t("common.weather")}
        </h2>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] items-center gap-8 lg:gap-12 mt-2.5 mb-14">
            {/* CHAP: sarlavha + akkordeon */}
            <div>
                <span className="inline-flex items-center gap-2 text-sky text-[13px] font-extrabold uppercase tracking-wide mb-4">
                    <i className="fa-solid fa-location-dot" /> {t("common.weather")} · {weather.city}
                </span>

                <div>
                    <AccItem q={t("home.wxToday")} open={open === 0} onToggle={() => toggle(0)}>
                        <p className="m-0 mb-3.5 pt-0.5 text-base leading-[1.6] text-gray max-w-[42ch]">
                            {t("home.wxSentence", {
                                city: weather.city,
                                cond: weather.conditionLabel.toLowerCase(),
                                max: formatTemp(weather.tempMax),
                                min: formatTemp(weather.tempMin),
                            })}
                        </p>
                        <a href="/ob-havo" className="inline-flex items-center gap-1.5 text-red font-bold text-sm pb-5 hover:text-red-dark">
                            {t("home.wxHourly")} <i className="fa-solid fa-arrow-right" />
                        </a>
                    </AccItem>

                    <AccItem q={t("home.wxNextDays")} open={open === 1} onToggle={() => toggle(1)}>
                        <div className="flex gap-2.5 flex-wrap pb-5">
                            {weather.nextDays.map((f, i) => (
                                <a key={i} href="/ob-havo" className="group flex-1 min-w-[64px] flex flex-col items-center gap-1.5 p-3 border border-line rounded-2xl bg-surface hover:-translate-y-0.5 hover:border-sky transition-all">
                                    <span className="text-xs font-extrabold text-gray">{f.weekday}</span>
                                    <i className={`fa-solid ${f.icon} text-[22px] text-sky`} />
                                    <span className="text-base font-extrabold tabular-nums">{formatTemp(f.max)}</span>
                                    <span className="text-xs font-bold text-gray tabular-nums">{formatTemp(f.min)}</span>
                                </a>
                            ))}
                        </div>
                    </AccItem>

                    <AccItem q={t("home.wxOtherCities")} open={open === 2} onToggle={() => toggle(2)}>
                        <p className="m-0 mb-3.5 pt-0.5 text-base leading-[1.6] text-gray max-w-[42ch]">
                            {t("home.wxOtherText")}
                        </p>
                        <a href="/ob-havo" className="inline-flex items-center gap-1.5 text-red font-bold text-sm pb-5 hover:text-red-dark">
                            {t("home.wxAllCities")} <i className="fa-solid fa-arrow-right" />
                        </a>
                    </AccItem>
                </div>
            </div>

            {/* O'NG: "qurilma" ekrani + suzuvchi widget */}
            <div className="relative flex justify-center max-lg:order-first">
                <a href="/ob-havo" className="group block w-full max-w-[460px] aspect-[4/3] rounded-[28px] p-2.5 bg-[#0b1622] shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-transform">
                    <div className={`wxa-screen ${bgClass[weather.condition] || "wxa-clear"} h-full rounded-[20px] flex flex-col items-center justify-center gap-1 text-white text-center`}>
                        <span className="text-base font-bold opacity-95">{weather.city}</span>
                        <i className={`fa-solid ${weather.icon} text-[56px] my-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,.25)]`} />
                        <span className="text-[74px] font-extrabold leading-none -tracking-[3px] tabular-nums">{formatTemp(weather.tempNow)}</span>
                        <span className="text-base font-semibold opacity-95">{weather.conditionLabel}</span>
                    </div>
                </a>

                <div className="absolute -left-1.5 -bottom-[18px] bg-white border border-line rounded-2xl shadow-[var(--shadow-md)] px-4 py-3.5 flex flex-col gap-1.5 min-w-[150px]" aria-hidden>
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-gray">{t("home.wxTodayLabel")}</span>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-ink"><i className="fa-solid fa-temperature-arrow-up w-4 text-sky text-[13px]" /> {t("home.wxMax")} <b className="ml-auto tabular-nums">{formatTemp(weather.tempMax)}</b></div>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-ink"><i className="fa-solid fa-temperature-arrow-down w-4 text-sky text-[13px]" /> {t("home.wxMin")} <b className="ml-auto tabular-nums">{formatTemp(weather.tempMin)}</b></div>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-ink"><i className={`fa-solid ${weather.icon} w-4 text-sky text-[13px]`} /> {weather.conditionLabel}</div>
                </div>
            </div>
        </section>
        </>
    );
}
