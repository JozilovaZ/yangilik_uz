import { Link } from "react-router-dom";
import { formatTime, formatNumber, formatDateTime } from "../utils/format";
import { useT } from "../i18n/LanguageContext";
import { prefetchApi } from "../hooks/useApi";
import { fetchArticle } from "../api";

// Maqola ustiga hover bo'lganda detailni oldindan yuklaymiz (tez ochilishi uchun)
const prefetchArticle = (slug) => prefetchApi("article", [slug], () => fetchArticle(slug));

// Bo'lim sarlavhasi — qizil vertikal chiziq + "Barchasi" havolasi
export function SectionHead({ title, moreHref }) {
    const t = useT();
    return (
        <div className="flex items-center justify-between mb-4">
            <h2 className="section-title m-0 text-[19px] font-extrabold tracking-tight">{title}</h2>
            {moreHref && (
                <Link to={moreHref} className="inline-flex items-center gap-1.5 text-gray text-[13px] font-bold hover:text-red">
                    {t("common.all")} <i className="fa-solid fa-arrow-right" />
                </Link>
            )}
        </div>
    );
}

// Kichik yangilik kartasi (rasm + kategoriya + sarlavha + meta)
export function SmallCard({ article, showDesc = true, dateFmt = "time" }) {
    const meta = dateFmt === "full" ? formatDateTime(article.publishedAt) : formatTime(article.publishedAt);
    return (
        <Link to={`/maqola/${article.slug}`} onMouseEnter={() => prefetchArticle(article.slug)} onFocus={() => prefetchArticle(article.slug)} className="group flex flex-col gap-2.5 bg-[#F0F0F0] p-2.5 rounded-xl">
            <div className="relative -mx-2.5 -mt-2.5 aspect-[16/10] rounded-t-xl overflow-hidden bg-gradient-to-br from-[#E6E9EF] to-[#D9DEE6] shadow-[var(--shadow-sm)]">
                {article.coverImage && (
                    <img src={article.coverImage} alt={article.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-red text-[11.5px] font-extrabold uppercase tracking-wide">
                    {article.category?.name}
                </span>
                <h3 className="m-0 text-[15px] leading-[1.32] font-bold tracking-tight group-hover:text-red">{article.title}</h3>
                {showDesc && article.summary && (
                    <p className="m-0 text-[13px] leading-[1.45] text-gray clamp-2">{article.summary}</p>
                )}
                <span className="text-gray text-xs font-semibold">
                    <i className="fa-regular fa-clock mr-0.5" /> {meta} · <i className="fa-regular fa-eye mr-0.5" /> {formatNumber(article.views)}
                </span>
            </div>
        </Link>
    );
}

// O'ng lentadagi ixcham qator (rasmsiz)
export function FeedItem({ article }) {
    return (
        <Link to={`/maqola/${article.slug}`} onMouseEnter={() => prefetchArticle(article.slug)} onFocus={() => prefetchArticle(article.slug)} className="group flex items-start gap-3.5 py-3 border-t border-line first:border-t-0 first:pt-0.5 transition-[padding] hover:pl-1.5">
            <div className="flex-1 flex flex-col gap-1">
                <span className="text-red text-[11.5px] font-extrabold uppercase tracking-wide">{article.category?.name}</span>
                <h3 className="m-0 text-[14.5px] leading-[1.35] font-bold tracking-tight group-hover:text-red">{article.title}</h3>
            </div>
            <span className="flex-none text-gray text-xs font-bold pt-px tabular-nums">{formatTime(article.publishedAt)}</span>
        </Link>
    );
}
