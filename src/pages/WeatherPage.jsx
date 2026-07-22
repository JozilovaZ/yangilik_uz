import { useState, useMemo, useEffect } from "react";
import { fetchCities, fetchCityForecast, fetchCityHourly } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";
import { formatTemp, locale } from "../utils/format";
import { Loading, ErrorState, Empty } from "../components/States";

export default function WeatherPage() {
    const t = useT();
    const [slug, setSlug] = useState(null);
    const [query, setQuery] = useState("");
    const [activeDay, setActiveDay] = useState(0);

    // Shaharlar ro'yxati
    const { data: cities, loading: citiesLoading } = useApi(fetchCities, [], [], "cities");

    // Standart shaharni tanlab qo'yish
    useEffect(() => {
        if (!slug && cities?.length) {
            const def = cities.find((c) => c.isDefault) || cities[0];
            setSlug(def.slug);
        }
    }, [cities, slug]);

    // Tanlangan shahar prognozi + soatlik
    const { data: forecast, loading, error } = useApi(
        () => (slug ? fetchCityForecast(slug) : Promise.resolve(null)),
        [slug],
        null,
        "forecast"
    );
    const { data: hours } = useApi(
        () => (slug ? fetchCityHourly(slug).catch(() => []) : Promise.resolve([])),
        [slug],
        [],
        "hours"
    );

    useEffect(() => { setActiveDay(0); }, [slug]);

    const days = forecast?.days || [];
    const day = days[activeDay];

    // Tanlangan kunning soatlik ma'lumoti (kun bo'yicha filtrlash)
    const dayHours = useMemo(() => {
        if (!day?.date || !hours?.length) return [];
        const key = new Date(day.date).toISOString().slice(0, 10);
        const filtered = hours.filter((h) => h.dayKey === key);
        return filtered.length ? filtered : (activeDay === 0 ? hours.slice(0, 8) : []);
    }, [day, hours, activeDay]);

    const selectCity = (s) => { setSlug(s); setActiveDay(0); };
    const onSearch = (e) => {
        e.preventDefault();
        const found = (cities || []).find((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
        if (found) selectCity(found.slug);
    };

    const longDate = day ? new Date(day.date).toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" }) : "";

    return (
        <>
            <div className="mt-[18px] mb-6 pb-4 border-b-2 border-ink">
                <h1 className="font-[family-name:var(--font-display)] text-[25px] sm:text-[32px] font-bold tracking-tight m-0">{t("weather.title")}</h1>
                <p className="mt-1.5 text-[13px] text-gray">{t("weather.searchNote")}</p>
            </div>

            {/* Qidiruv */}
            <form onSubmit={onSearch} className="relative flex items-center gap-2.5 max-w-[560px] mb-3.5">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray text-[15px] pointer-events-none" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} list="wx-cities" type="search" placeholder={t("weather.searchPlaceholder")} autoComplete="off"
                    className="flex-1 py-3.5 pl-[42px] pr-4 text-[15px] border border-line rounded-full bg-white text-ink outline-none focus:border-red" />
                <datalist id="wx-cities">
                    {(cities || []).map((c) => <option key={c.id} value={c.name} />)}
                </datalist>
                <button type="submit" className="flex-none py-3.5 px-[22px] text-sm font-bold text-white bg-red rounded-full hover:bg-red-dark transition-colors">{t("nav.search")}</button>
            </form>

            {/* Prognoz */}
            {citiesLoading || loading ? (
                <Loading />
            ) : error ? (
                <ErrorState error={error} />
            ) : !day ? (
                <Empty label={t("weather.notLoaded")} />
            ) : (
                <section className="mb-9 bg-white border border-line rounded-[18px] shadow-[var(--shadow-sm)] overflow-hidden">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 px-[26px] pt-5">
                        <h2 className="m-0 text-2xl font-extrabold -tracking-[.5px]">{t("weather.cityForecast", { city: forecast.city })}</h2>
                        <span className="text-xs font-semibold text-gray">{t("weather.forecastNote", { days: days.length })}</span>
                    </div>

                    {/* Kunlik tablar */}
                    <div className="flex gap-2.5 px-[26px] py-[18px] overflow-x-auto">
                        {days.map((d, i) => (
                            <button key={i} onClick={() => setActiveDay(i)}
                                className={`flex-none flex flex-col items-center gap-0.5 min-w-[84px] px-3.5 py-3 border rounded-2xl transition-all ${i === activeDay ? "bg-ink border-ink text-white" : "bg-white border-line text-ink hover:border-ink"}`}>
                                <span className="text-[13px] font-bold whitespace-nowrap">{i === 0 ? t("weather.today") : i === 1 ? t("weather.tomorrow") : new Date(d.date).toLocaleDateString(locale(), { weekday: "short" })}</span>
                                <span className="text-xs font-bold opacity-70">{new Date(d.date).getDate()}</span>
                                <i className={`fa-solid ${d.icon} text-xl my-0.5 ${i === activeDay ? "text-[#f2c14e]" : "text-[#e0a43b]"}`} />
                                <span className="text-xs font-bold whitespace-nowrap tabular-nums">{formatTemp(d.tempMax)}/{formatTemp(d.tempMin)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tanlangan kun */}
                    <div className="px-[26px] pt-2 pb-[26px] border-t border-line">
                        <div className="flex items-center gap-[22px] my-[18px] flex-wrap">
                            <i className={`fa-solid ${day.icon} text-[46px] sm:text-[58px] text-[#e0a43b]`} />
                            <span className="text-[52px] sm:text-[72px] font-extrabold leading-none -tracking-[3px] tabular-nums text-ink">{formatTemp(day.tempNow ?? day.tempMax)}</span>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-sm font-semibold text-gray capitalize">{longDate}</span>
                                <span className="text-[19px] font-bold">{day.label}</span>
                                <span className="text-sm font-semibold text-gray tabular-nums">{t("weather.dayRange", { max: formatTemp(day.tempMax), min: formatTemp(day.tempMin) })}</span>
                            </div>
                        </div>

                        {/* Soatlik */}
                        {dayHours.length ? (
                            <div className="flex overflow-x-auto border border-line rounded-[14px] bg-white">
                                {dayHours.map((h, i) => (
                                    <div key={i} className="flex-none flex flex-col items-center gap-2 min-w-[88px] p-4 border-r border-line last:border-r-0">
                                        <span className="text-[13px] font-bold text-gray">{h.label}</span>
                                        <i className={`fa-solid ${h.icon} text-2xl text-[#e0a43b]`} />
                                        <span className="text-[17px] font-extrabold tabular-nums">{formatTemp(h.temp)}</span>
                                        {h.feels != null && <span className="text-[11.5px] font-semibold text-gray tabular-nums">{t("weather.feels")} {formatTemp(h.feels)}</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-gray font-semibold">{t("weather.noHourly")}</p>
                        )}
                    </div>
                </section>
            )}

            {/* Shahar chiplari */}
            {(cities || []).length > 0 && (
                <section className="flex items-center flex-wrap gap-2.5 mb-11">
                    <span className="text-[13px] font-bold text-gray">{t("weather.cities")}</span>
                    {cities.map((c) => (
                        <button key={c.id} onClick={() => selectCity(c.slug)}
                            className={`px-3.5 py-1.5 border rounded-full text-[13px] font-bold transition-colors ${c.slug === slug ? "bg-ink text-white border-ink" : "bg-white border-line hover:border-ink hover:text-red"}`}>
                            {c.name}
                        </button>
                    ))}
                </section>
            )}
        </>
    );
}
