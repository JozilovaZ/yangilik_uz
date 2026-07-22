import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchCategories, fetchCurrencies, fetchCities, fetchArticles, tokens } from "../api";
import { useApi } from "../hooks/useApi";
import { useLang, useT, LANGUAGES } from "../i18n/LanguageContext";
import { formatNumber, formatTemp } from "../utils/format";

export default function Header() {
    const [rotIdx, setRotIdx] = useState(0);
    const [navOpen, setNavOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [langOpen, setLangOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const authed = tokens.isAuthed;
    const { lang, setLang } = useLang();
    const t = useT();
    const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

    // Backend'dan: kategoriyalar, valyuta lentasi, ob-havo, muhim xabarlar
    const { data: categories } = useApi(fetchCategories, [], [], "categories");
    const { data: currencies } = useApi(() => fetchCurrencies(), [], [], "currencies");
    const { data: cities } = useApi(fetchCities, [], [], "cities");
    const { data: breaking } = useApi(() => fetchArticles({ featured: true, page: 1 }), [], { results: [] }, "articles-featured");

    const cats = categories || [];
    const ticker = (currencies || []).filter((c) => c.rate).slice(0, 4);
    const weatherCity = (cities || []).find((c) => c.isDefault) || (cities || [])[0];
    const breakingNews = (breaking?.results || []).slice(0, 5);

    // Muhim xabarlar aylanishi
    useEffect(() => {
        if (breakingNews.length < 2) return;
        const t = setInterval(() => setRotIdx((i) => (i + 1) % breakingNews.length), 4000);
        return () => clearInterval(t);
    }, [breakingNews.length]);

    return (
        <header>
            {/* 1-qavat: aylanuvchi muhim xabarlar */}
            {breakingNews.length > 0 && (
                <div className="bg-ink text-[#e9e5df] text-sm">
                    <div className="container flex items-center gap-3.5 h-[42px] overflow-hidden">
                        <span className="flex-none inline-flex items-center gap-1.5 bg-red text-white font-bold text-xs uppercase px-2.5 py-1 rounded tracking-wide">
                            <i className="fa-solid fa-bolt" /> {t("nav.important")}
                        </span>
                        <div className="relative flex-1 h-[42px]">
                            {breakingNews.map((item, i) => (
                                <Link
                                    key={item.id}
                                    to={`/maqola/${item.slug}`}
                                    className={`rotator-item absolute inset-0 flex items-center font-medium whitespace-nowrap overflow-hidden text-ellipsis hover:text-white ${
                                        i === rotIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                                    }`}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 2-qavat: logo + menyu + qidiruv + til + profil */}
            <div className="bg-cream border-b-2 border-ink relative">
                <div className="container flex items-center h-[68px] gap-3 md:gap-5">
                    <Link to="/" className="flex-none text-[26px] font-black tracking-tight text-ink">
                        UZ<span className="text-red">LIFE</span>
                    </Link>

                    <nav
                        className={`main-nav flex-1 md:ml-[70px] md:flex md:flex-row md:static md:bg-transparent md:border-0 md:p-0 ${
                            navOpen
                                ? "flex flex-col items-stretch absolute left-0 right-0 top-full bg-cream border-b-2 border-ink px-5 pt-2 pb-4 z-30"
                                : "hidden"
                        } md:items-center gap-0.5`}
                    >
                        {cats.map((cat) => (
                            <Link key={cat.id} to={`/kategoriya/${cat.slug}`} onClick={() => setNavOpen(false)} className="font-bold text-sm px-2.5 py-2 rounded-md text-ink hover:text-red whitespace-nowrap">
                                {cat.name}
                            </Link>
                        ))}
                        <Link to="/valyuta" onClick={() => setNavOpen(false)} className="font-bold text-sm px-2.5 py-2 rounded-md text-ink hover:text-red whitespace-nowrap">{t("common.currency")}</Link>
                        <Link to="/ob-havo" onClick={() => setNavOpen(false)} className="font-bold text-sm px-2.5 py-2 rounded-md text-ink hover:text-red whitespace-nowrap">{t("common.weather")}</Link>
                    </nav>

                    <div className="flex-none flex items-center gap-1.5 sm:gap-2.5 ml-auto md:ml-0">
                        {/* Qidiruv */}
                        <div className={`flex items-center rounded-md border ${searchOpen ? "bg-white border-line" : "border-transparent"}`}>
                            <button onClick={() => setSearchOpen((v) => !v)} className="flex-none w-10 h-10 rounded-md inline-flex items-center justify-center text-ink hover:text-red text-base" aria-label={t("nav.search")}>
                                <i className="fa-solid fa-magnifying-glass" />
                            </button>
                            <input
                                type="search"
                                placeholder={t("nav.searchPlaceholder")}
                                className={`border-0 outline-none bg-transparent text-ink text-sm transition-all duration-300 ${searchOpen ? "w-[130px] sm:w-[220px] px-3 py-2 pl-1" : "w-0 p-0"}`}
                            />
                        </div>

                        {/* Til dropdown */}
                        <div className="relative">
                            <button onClick={() => setLangOpen((v) => !v)} className="border border-line rounded-md text-ink font-bold inline-flex items-center gap-1.5 px-2.5 py-2 hover:border-ink">
                                <i className="fa-solid fa-globe" /> {currentLang.short}
                                <i className={`fa-solid fa-chevron-down text-[10px] text-faint transition-transform ${langOpen ? "rotate-180" : ""}`} />
                            </button>
                            {langOpen && (
                                <div className="absolute right-0 top-[calc(100%+8px)] bg-white border border-line rounded-xl p-1.5 min-w-[160px] shadow-[var(--shadow-lg)] z-40">
                                    {LANGUAGES.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => { setLang(l.code); setLangOpen(false); }}
                                            className={`flex items-center gap-2.5 w-full text-left font-semibold text-sm px-3 py-2 rounded-lg hover:text-red hover:bg-surface ${l.code === lang ? "text-red" : "text-ink"}`}
                                        >
                                            <span className={`w-[7px] h-[7px] rounded-full ${l.code === lang ? "bg-red" : "bg-line"}`} />
                                            <span className="font-bold w-7">{l.short}</span>
                                 
                                            <span className="text-gray text-[13px]">{l.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Profil dropdown */}
                        <div className="relative">
                            <button onClick={() => setUserOpen((v) => !v)} className="border border-line rounded-full text-ink font-bold inline-flex items-center gap-2 px-3 py-1.5 hover:border-ink hover:bg-surface">
                                <i className="fa-solid fa-circle-user text-red text-[21px]" />
                                <i className={`fa-solid fa-chevron-down text-[10px] text-faint transition-transform ${userOpen ? "rotate-180" : ""}`} />
                            </button>
                            {userOpen && (
                                <div className="absolute right-0 top-[calc(100%+8px)] bg-white border border-line rounded-2xl p-1.5 min-w-[234px] shadow-[var(--shadow-lg)] z-40">
                                    {authed ? (
                                        <Link to="/profil" onClick={() => setUserOpen(false)} className="flex items-center gap-3 w-full text-ink font-semibold text-sm px-3 py-2.5 rounded-lg hover:text-red hover:bg-surface">
                                            <i className="fa-solid fa-user w-[17px] text-center text-faint" /> {t("nav.profile")}
                                        </Link>
                                    ) : (
                                        <>
                                            <Link to="/kirish" onClick={() => setUserOpen(false)} className="flex items-center gap-3 w-full text-ink font-semibold text-sm px-3 py-2.5 rounded-lg hover:text-red hover:bg-surface">
                                                <i className="fa-solid fa-right-to-bracket w-[17px] text-center text-faint" /> {t("nav.login")}
                                            </Link>
                                            <Link to="/royxat" onClick={() => setUserOpen(false)} className="flex items-center gap-3 w-full text-red font-bold text-sm px-3 py-2.5 rounded-lg hover:bg-surface">
                                                <i className="fa-solid fa-user-plus w-[17px] text-center text-red" /> {t("nav.register")}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setNavOpen((v) => !v)} className="md:hidden text-[26px] text-ink" aria-label={t("nav.menu")}>
                            <i className="fa-solid fa-bars" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3-qavat: valyuta + ob-havo ticker */}
            {(ticker.length > 0 || weatherCity?.today) && (
                <div className="bg-white border-b border-line text-sm">
                    <div className="container flex items-center gap-3 h-10 overflow-x-auto whitespace-nowrap">
                        {ticker.map((c) => (
                            <div key={c.code} className="inline-flex items-center gap-1.5">
                                <Link to={`/valyuta/${c.code}`} className="inline-flex items-center gap-1.5 hover:text-red">
                                    <b>{c.code}</b> {formatNumber(c.rate)}
                                    <span className={`font-semibold ${c.isUp ? "text-up" : "text-red"}`}>
                                        <i className={`fa-solid ${c.isUp ? "fa-caret-up" : "fa-caret-down"}`} /> {Math.abs(c.diff).toFixed(0)}
                                    </span>
                                </Link>
                                <span className="text-line">·</span>
                            </div>
                        ))}
                        {weatherCity?.today && (
                            <Link to="/ob-havo" className="inline-flex items-center gap-1.5 hover:text-red">
                                <i className={`fa-solid ${weatherCity.today.icon}`} /> {weatherCity.name} <b>{formatTemp(weatherCity.today.tempNow ?? weatherCity.today.tempMax)}</b>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
