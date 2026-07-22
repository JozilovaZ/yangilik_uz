import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchCurrencies } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";
import { formatNumber, formatDate } from "../utils/format";
import { Loading, ErrorState, Empty } from "../components/States";

export default function CurrencyPage() {
    const t = useT();
    const { data: currencyList, loading, error } = useApi(() => fetchCurrencies(), [], null, "currencies");

    const [fromCode, setFromCode] = useState("USD");
    const [toCode, setToCode] = useState("UZS");
    const [amount, setAmount] = useState("1");
    const [dir, setDir] = useState("from"); // qaysi tomonga yozildi

    // Kalkulyator uchun UZS ni ham qo'shamiz (1 so'm = 1 so'm)
    const options = useMemo(
        () => [{ code: "UZS", name: t("currency.somName"), flag: "🇺🇿", rate: 1 }, ...(currencyList || [])],
        [currencyList, t]
    );
    const rateOf = (code) => options.find((o) => o.code === code)?.rate || 1;

    // Konvertatsiya natijasi
    const result = useMemo(() => {
        const val = parseFloat(String(amount).replace(/\s/g, "").replace(",", "."));
        if (isNaN(val)) return "";
        const out = dir === "from" ? (val * rateOf(fromCode)) / rateOf(toCode) : (val * rateOf(toCode)) / rateOf(fromCode);
        const digits = (dir === "from" ? toCode : fromCode) === "UZS" ? 2 : 4;
        return out.toLocaleString("ru-RU", { maximumFractionDigits: digits });
    }, [amount, fromCode, toCode, dir, options]);

    const oneRate = useMemo(() => {
        if (fromCode === toCode) return "";
        const one = rateOf(fromCode) / rateOf(toCode);
        return `1 ${fromCode} = ${one.toLocaleString("ru-RU", { maximumFractionDigits: toCode === "UZS" ? 2 : 4 })} ${toCode}`;
    }, [fromCode, toCode, options]);

    const swap = () => { setFromCode(toCode); setToCode(fromCode); setDir("from"); };

    const fromVal = dir === "from" ? amount : result;
    const toVal = dir === "from" ? result : amount;

    if (loading) return <Loading />;
    if (error) return <ErrorState error={error} />;

    return (
        <>
            <div className="mt-4.5 mt-[18px] mb-6 pb-4 border-b-2 border-ink">
                <h1 className="font-[family-name:var(--font-display)] text-[25px] sm:text-[32px] font-bold tracking-tight m-0">{t("currency.title")}</h1>
                <p className="mt-1.5 text-[13px] text-gray">{t("currency.sourceNote", { date: formatDate(new Date().toISOString()) })}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] items-start gap-6 mb-11">
                {/* Kalkulyator */}
                <section className="lg:sticky lg:top-4 p-6 bg-white border-2 border-ink rounded-2xl shadow-[var(--shadow-md)]">
                    <div className="flex flex-col gap-0.5 mb-4.5 mb-[18px]">
                        <h2 className="m-0 text-lg font-extrabold tracking-tight"><i className="fa-solid fa-calculator text-red mr-1.5" /> {t("currency.calc")}</h2>
                        <span className="text-xs text-gray font-semibold">{t("currency.calcNote")}</span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                        <CalcSide label={t("currency.sell")} value={fromVal} onValue={(v) => { setAmount(v); setDir("from"); }} code={fromCode} onCode={setFromCode} options={options} />
                        <button onClick={swap} aria-label="swap" className="w-[42px] h-[42px] mx-auto border border-line rounded-full bg-white text-ink hover:bg-ink hover:text-white transition-all rotate-90"><i className="fa-solid fa-right-left" /></button>
                        <CalcSide label={t("currency.buy")} value={toVal} onValue={(v) => { setAmount(v); setDir("to"); }} code={toCode} onCode={setToCode} options={options} />
                    </div>
                    {oneRate && <p className="mt-4 text-[13px] font-bold text-gray tabular-nums">{oneRate}</p>}
                </section>

                {/* Ro'yxat */}
                <section>
                    <h2 className="m-0 mb-3.5 text-lg font-extrabold tracking-tight"><i className="fa-solid fa-coins text-red mr-1.5" /> {t("currency.units")}</h2>
                    {!currencyList?.length && <Empty label={t("currency.notLoaded")} />}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                        {(currencyList || []).map((c) => (
                            <Link key={c.code} to={`/valyuta/${c.code}`} className="group flex flex-col gap-3 p-5 bg-white border border-line rounded-2xl shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-ink transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-[28px] leading-none">{c.flag}</span>
                                    <div>
                                        <span className="block text-base font-extrabold tracking-tight">{c.code}</span>
                                        <span className="block text-[12.5px] text-gray">{c.name}</span>
                                    </div>
                                </div>
                                <div className="text-[28px] font-extrabold -tracking-[1px] tabular-nums">
                                    {formatNumber(c.rate)} <span className="text-[13px] font-semibold text-gray">{t("common.som")}</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-line">
                                    <span className={`inline-flex items-center gap-1 text-[13px] font-bold tabular-nums ${c.isUp ? "text-[#1a8a3c]" : "text-red"}`}>
                                        <i className={`fa-solid ${c.isUp ? "fa-caret-up" : "fa-caret-down"}`} /> {Math.abs(c.diff).toFixed(2)}
                                    </span>
                                    <span className="text-xs font-bold text-gray group-hover:text-red">{t("common.details")} <i className="fa-solid fa-arrow-right" /></span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

function CalcSide({ label, value, onValue, code, onCode, options }) {
    return (
        <div className="flex flex-col gap-1.5 min-w-0">
            <label className="text-[11px] font-extrabold text-gray uppercase tracking-wide">{label}</label>
            <div className="flex items-stretch border border-line rounded-xl bg-cream overflow-hidden focus-within:border-ink">
                <input inputMode="decimal" value={value} onChange={(e) => onValue(e.target.value)} className="flex-1 min-w-0 px-3.5 py-3 border-0 outline-none bg-transparent text-xl font-extrabold -tracking-[.5px] text-ink tabular-nums" />
                <select value={code} onChange={(e) => onCode(e.target.value)} className="flex-none max-w-[150px] px-3 border-0 border-l border-line bg-white text-[13px] font-bold text-ink cursor-pointer outline-none">
                    {options.map((o) => (
                        <option key={o.code} value={o.code}>{o.flag} {o.code}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
