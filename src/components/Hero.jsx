import { Link } from "react-router-dom";
import { fetchArticles, fetchArticle } from "../api";
import { useApi, prefetchApi } from "../hooks/useApi";
import { formatDateTime, formatNumber } from "../utils/format";
import { SectionHead, SmallCard, FeedItem } from "./ui";
import { Loading, Empty } from "./States";
import { useT } from "../i18n/LanguageContext";

export default function Hero() {
    const t = useT();
    // So'nggi yangiliklar (eng yangi tepada)
    const { data, loading } = useApi(() => fetchArticles({ ordering: "-published_at" }), [], null, "articles-latest");

    if (loading) return <Loading />;
    const list = data?.results || [];
    if (!list.length) return <div className="mt-7 mb-11"><Empty /></div>;

    // Birinchi featured maqola, bo'lmasa eng yangisi — bosh yangilik
    const featured = list.find((a) => a.isFeatured) || list[0];
    const rest = list.filter((a) => a.id !== featured.id);
    const subCards = rest.slice(0, 3);
    const feed = rest.slice(3, 10);

    return (
        <section className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-[30px] mt-7 mb-11">
            {/* Chap: bosh yangilik + 3 kichik karta */}
            <div className="flex flex-col gap-[22px]">
                <Link to={`/maqola/${featured.slug}`} onMouseEnter={() => prefetchApi("article", [featured.slug], () => fetchArticle(featured.slug))} className="group block">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-[var(--shadow-sm)] bg-gradient-to-br from-[#F2F4F7] to-[#D9DEE6]">
                        {featured.coverImage && (
                            <img src={featured.coverImage} alt={featured.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )}
                        <span className="absolute left-4 top-4 bg-red text-white text-xs font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-[5px] shadow-[0_4px_14px_rgba(206,43,34,.35)]">
                            {featured.category?.name}
                        </span>
                    </div>
                    <div className="pt-4">
                        <h1 className="font-[family-name:var(--font-display)] m-0 mb-2.5 text-[23px] sm:text-[30px] leading-[1.2] font-bold tracking-tight group-hover:text-red">
                            {featured.title}
                        </h1>
                        {featured.summary && <p className="m-0 mb-3.5 text-[#4a4a4a] text-base leading-[1.55] max-w-[92%]">{featured.summary}</p>}
                        <div className="flex items-center gap-2.5 text-gray text-[13px] font-semibold">
                            <span><i className="fa-regular fa-clock" /> {formatDateTime(featured.publishedAt)}</span>
                            <span className="w-[3px] h-[3px] rounded-full bg-current opacity-50" />
                            <span><i className="fa-regular fa-eye" /> {formatNumber(featured.views)}</span>
                        </div>
                    </div>
                </Link>

                {subCards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[18px] pt-5 border-t border-line">
                        {subCards.map((a) => (
                            <SmallCard key={a.id} article={a} />
                        ))}
                    </div>
                )}
            </div>

            {/* O'ng: so'nggi yangiliklar lentasi */}
            <aside className="flex flex-col">
                <SectionHead title={t("common.latest")} />
                <div className="flex flex-col">
                    {feed.map((a) => (
                        <FeedItem key={a.id} article={a} />
                    ))}
                </div>
            </aside>
        </section>
    );
}
