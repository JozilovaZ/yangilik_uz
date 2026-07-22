import { Link } from "react-router-dom";
import { fetchCurrencies } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";
import { formatNumber } from "../utils/format";

export default function CurrencySection() {
    const t = useT();
    // Statik informatsion kartalar (kontent — tarjima lug'atidan)
    const currencyInfo = [
        { icon: "fa-building-columns", title: t("home.info1Title"), text: t("home.info1Text"), linkLabel: t("home.info1Link") },
        { icon: "fa-arrows-rotate", title: t("home.info2Title"), text: t("home.info2Text"), linkLabel: t("home.info2Link") },
        { icon: "fa-chart-line", title: t("home.info3Title"), text: t("home.info3Text"), linkLabel: t("home.info3Link") },
    ];

    const { data: currencies } = useApi(() => fetchCurrencies(), [], [], "currencies");
    // Suzuvchi kartalar: aniq 4 ta valyuta — USD, RUB, EUR, GBP (shu tartibda)
    const wanted = ["USD", "RUB", "EUR", "GBP"];
    const byCode = new Map((currencies || []).filter((c) => c.rate).map((c) => [c.code, c]));
    const currencyDials = wanted.map((code) => byCode.get(code)).filter(Boolean);
    if (!currencyDials.length) return null;

    return (
        <>
            {/* Sarlavha */}
            <h2 className="flex items-center gap-2.5 m-0 mb-6 text-[26px] font-extrabold tracking-tight text-ink">
                <img className="w-[34px] h-[34px] object-contain" src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b1.png" alt="" loading="lazy" />
                {t("home.currencyRate")}
            </h2>

            {/* Gradient hero + markazdagi rasm + suzuvchi kartalar */}
            <section className="fx-hero-bg relative mb-11 p-6 lg:p-10 rounded-[22px] overflow-hidden lg:min-h-[420px]">
                <div className="fx-mock-shadow relative z-0 max-w-[760px] mx-auto rounded-[14px] overflow-hidden max-lg:opacity-20">
                    <img src="https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=900&h=560&q=80" alt="Oltin va valyuta" loading="lazy" className="block w-full h-auto" />
                </div>

                <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:block gap-3.5 mt-4 lg:mt-0 lg:absolute lg:inset-0">
                    {currencyDials.map((d) => (
                        <Link key={d.code} to={`/valyuta/${d.code}`} className="fx-note block bg-[#DEDEDE] rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="inline-flex items-center gap-2 text-base font-extrabold tracking-tight text-ink">
                                    <span className="text-xl leading-none">{d.flag}</span>
                                    {d.code}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${d.isUp ? "bg-[#e7f6ec] text-[#1a8a3c]" : "bg-[#fde9e8] text-red"}`}>
                                    <i className={`fa-solid ${d.isUp ? "fa-caret-up" : "fa-caret-down"}`} /> {Math.abs(d.diff).toFixed(0)}
                                </span>
                            </div>
                            <p className="m-0 mb-3 text-[12.5px] leading-[1.4] text-gray">{t("home.cbuToday")}</p>
                            <div className="px-3 py-2.5 bg-[#f6f5f3] rounded-lg font-mono text-[13px] text-[#444]">
                                <span className="text-[#7c3aed] font-bold">{d.code}</span> = <b className="text-[#16a34a] font-bold">{formatNumber(d.rate)}</b> {t("common.som")}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Rasm ostidagi 3 ta info karta */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-[30px] mb-[46px]">
                {currencyInfo.map((info, i) => (
                    <div key={i} className="flex flex-col items-start">
                        <span className="flex items-center justify-center w-11 h-11 rounded-xl mb-3.5 bg-[#f3edfe] text-[#7c3aed] text-lg">
                            <i className={`fa-solid ${info.icon}`} />
                        </span>
                        <h3 className="m-0 mb-1.5 text-[17px] font-extrabold tracking-tight">{info.title}</h3>
                        <p className="m-0 mb-3 text-sm leading-[1.5] text-gray">{info.text}</p>
                        <Link to="/valyuta" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-[#7c3aed] hover:text-[#5b21b6]">
                            {info.linkLabel} <i className="fa-solid fa-arrow-right" />
                        </Link>
                    </div>
                ))}
            </section>
        </>
    );
}
