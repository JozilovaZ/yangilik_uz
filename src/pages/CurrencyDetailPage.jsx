import { Link, useParams } from "react-router-dom";
import { fetchCurrencyHistory, fetchCurrencies } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";
import { formatNumber, formatDate } from "../utils/format";
import LineChart from "../components/LineChart";
import { Loading, ErrorState } from "../components/States";

export default function CurrencyDetailPage() {
    const t = useT();
    const { code } = useParams();
    const { data, loading, error } = useApi(() => fetchCurrencyHistory(code), [code], null, "currency-history");
    const { data: all } = useApi(() => fetchCurrencies(), [], [], "currencies");

    if (loading) return <Loading />;
    if (error || !data) return <ErrorState error={error || new Error("Valyuta topilmadi")} />;

    // Tarixdan statistika hisoblash
    const history = data.history || [];
    const rates = history.map((h) => h.rate).filter(Boolean);
    const cur = {
        ...data,
        history,
        stats: rates.length
            ? { days: rates.length, min: Math.min(...rates), max: Math.max(...rates), change: rates[0] - rates[rates.length - 1] }
            : { days: 0, min: 0, max: 0, change: 0 },
        others: (all || []).filter((c) => c.code !== data.code),
    };

    return (
        <>
            <nav className="flex items-center gap-2 mt-5 text-[13px] font-semibold text-gray">
                <Link to="/" className="hover:text-red">{t("common.home")}</Link>
                <i className="fa-solid fa-angle-right text-[10px] opacity-60" />
                <Link to="/valyuta" className="hover:text-red">{t("common.currency")}</Link>
                <i className="fa-solid fa-angle-right text-[10px] opacity-60" />
                <span className="text-ink">{cur.code}</span>
            </nav>

            <div className="mt-4.5 mt-[18px] mb-6 pb-4 border-b-2 border-ink">
                <h1 className="font-[family-name:var(--font-display)] text-[24px] sm:text-[32px] font-bold tracking-tight m-0">{cur.flag} {cur.name} ({cur.code})</h1>
                <p className="mt-1.5 text-[13px] text-gray">{t("fx.sourceCbu")}</p>
            </div>

            {/* Asosiy raqam + statistika */}
            <section className="flex items-center justify-between flex-wrap gap-6 p-6.5 p-[26px] bg-white border border-line rounded-[18px] shadow-[var(--shadow-sm)] mb-8">
                <div>
                    <span className="block text-[13px] font-bold text-gray">1 {cur.code} =</span>
                    <span className="text-[34px] sm:text-[44px] font-extrabold -tracking-[1.5px] tabular-nums">{formatNumber(cur.rate)}</span>
                    <span className="text-base font-semibold text-gray ml-1.5">{t("common.som")}</span>
                    <div className="flex items-center gap-2.5 mt-2 text-[13px] text-gray">
                        <span className={`inline-flex items-center gap-1 font-bold tabular-nums ${cur.isUp ? "text-[#1a8a3c]" : "text-red"}`}>
                            <i className={`fa-solid ${cur.isUp ? "fa-caret-up" : "fa-caret-down"}`} /> {Math.abs(cur.diff).toFixed(2)}
                        </span>
                        <span className="w-[3px] h-[3px] rounded-full bg-current opacity-50" />
                        <span>{t("fx.asOf", { date: formatDate(cur.date) })}</span>
                    </div>
                </div>
                <div className="flex gap-7 flex-wrap">
                    <Stat label={t("fx.low", { days: cur.stats.days })} value={formatNumber(cur.stats.min)} />
                    <Stat label={t("fx.high", { days: cur.stats.days })} value={formatNumber(cur.stats.max)} />
                    <Stat label={t("fx.change")} value={`${cur.stats.change > 0 ? "+" : ""}${cur.stats.change.toFixed(2)}`} tone={cur.stats.change > 0 ? "up" : cur.stats.change < 0 ? "down" : ""} />
                </div>
            </section>

            {/* Grafik */}
            <section className="mb-7">
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="section-title m-0 text-lg font-extrabold"><i className="fa-solid fa-chart-line text-[#16a34a] mr-1.5" /> {cur.code} — {t("fx.dynamics", { days: cur.stats.days || 30 })}</h2>
                </div>
                <div className="h-[320px] p-4 bg-white border border-line rounded-2xl shadow-[var(--shadow-sm)] max-[640px]:h-[240px]">
                    <LineChart data={cur.history.map((h) => h.rate)} />
                </div>
            </section>

            {/* Tarix jadvali */}
            <section className="mb-9">
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="section-title m-0 text-lg font-extrabold"><i className="fa-regular fa-calendar text-red mr-1.5" /> {t("fx.history")}</h2>
                </div>
                <div className="overflow-x-auto bg-white border border-line rounded-2xl shadow-[var(--shadow-sm)]">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                {[t("fx.date"), t("fx.rateCol"), t("fx.diffCol")].map((h) => (
                                    <th key={h} className="text-left px-4.5 px-[18px] py-3 text-[11px] font-extrabold text-gray uppercase tracking-wide border-b border-line whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {cur.history.map((r, i) => (
                                <tr key={i} className="hover:bg-surface">
                                    <td className="px-4.5 px-[18px] py-2.5 border-b border-line tabular-nums whitespace-nowrap">{formatDate(r.date)}</td>
                                    <td className="px-4.5 px-[18px] py-2.5 border-b border-line tabular-nums whitespace-nowrap"><b>{formatNumber(r.rate)}</b></td>
                                    <td className="px-4.5 px-[18px] py-2.5 border-b border-line tabular-nums whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1 font-bold ${r.isUp ? "text-[#1a8a3c]" : "text-red"}`}>
                                            <i className={`fa-solid ${r.isUp ? "fa-caret-up" : "fa-caret-down"}`} /> {Math.abs(r.diff).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Boshqa valyutalar */}
            <section className="flex items-center flex-wrap gap-2.5 mb-11">
                <span className="text-[13px] font-bold text-gray">{t("fx.others")}</span>
                {cur.others.map((o) => (
                    <Link key={o.code} to={`/valyuta/${o.code}`} className="px-3.5 py-1.5 bg-white border border-line rounded-full text-[13px] font-bold hover:border-ink hover:text-red transition-colors">
                        {o.flag} {o.code}
                    </Link>
                ))}
            </section>
        </>
    );
}

function Stat({ label, value, tone }) {
    const color = tone === "up" ? "text-[#1a8a3c]" : tone === "down" ? "text-red" : "";
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-gray uppercase tracking-wide">{label}</span>
            <span className={`text-xl font-extrabold -tracking-[.5px] tabular-nums ${color}`}>{value}</span>
        </div>
    );
}
