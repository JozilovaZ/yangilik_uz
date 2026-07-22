import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchArticle, fetchArticles } from "../api";
import { useApi } from "../hooks/useApi";
import { formatDateTime, formatNumber, formatDate } from "../utils/format";
import { SmallCard } from "../components/ui";
import Comments from "../components/Comments";
import { Loading, ErrorState } from "../components/States";
import { useT } from "../i18n/LanguageContext";

// Sidebar thumbnail karta
function TCard({ article, metaIcon, metaText }) {
    return (
        <Link to={`/maqola/${article.slug}`} className="group flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-surface">
            <span className="flex-none w-[62px] h-[62px] rounded-[11px] overflow-hidden bg-surface-2">
                {article.coverImage && <img src={article.coverImage} alt="" loading="lazy" className="w-full h-full object-cover" />}
            </span>
            <span className="flex flex-col gap-1 min-w-0">
                <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-red">{article.category?.name}</span>
                <span className="text-sm font-bold leading-[1.32] text-ink clamp-2 group-hover:text-red">{article.title}</span>
                <span className="flex items-center gap-1.5 text-[11.5px] text-faint"><i className={metaIcon} /> {metaText(article)}</span>
            </span>
        </Link>
    );
}

function SideBox({ icon, title, children }) {
    return (
        <div className="border border-line rounded-2xl bg-white shadow-[var(--shadow-sm)] overflow-hidden">
            <div className="flex items-center gap-2.5 px-[18px] py-[15px] text-[13px] font-extrabold tracking-wide uppercase text-ink">
                <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_0_4px_rgba(206,43,34,.14)]" />
                <i className={`${icon} text-red text-sm`} /> {title}
            </div>
            <div className="p-1.5 flex flex-col gap-0.5">{children}</div>
        </div>
    );
}

export default function ArticlePage() {
    const t = useT();
    const { slug } = useParams();
    const [copied, setCopied] = useState(false);

    const { data: article, loading, error } = useApi(() => fetchArticle(slug), [slug], null, "article");
    const { data: popularData } = useApi(() => fetchArticles({ ordering: "-views_count" }), [], null, "articles-popular");
    const { data: latestData } = useApi(() => fetchArticles({ ordering: "-published_at" }), [], null, "articles-latest");

    if (loading) return <Loading />;
    if (error || !article) return <ErrorState error={error || new Error("Maqola topilmadi")} />;

    const popular = (popularData?.results || []).slice(0, 5);
    const latest = (latestData?.results || []).filter((a) => a.slug !== slug);
    const related = latest.slice(0, 4);

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const copyLink = () => {
        navigator.clipboard?.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        });
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-10 items-start">
                {/* Asosiy maqola */}
                <div className="min-w-0">
                    <article className="max-w-none pt-6">
                        <nav className="flex items-center gap-2.5 text-[13px] font-semibold text-faint mb-4.5 mb-[18px]">
                            <Link to="/" className="text-gray hover:text-red">{t("common.home")}</Link>
                            <i className="fa-solid fa-angle-right text-[10px]" />
                            {article.category?.slug && <Link to={`/kategoriya/${article.category.slug}`} className="text-gray hover:text-red">{article.category.name}</Link>}
                        </nav>

                        {article.category?.slug && (
                            <Link to={`/kategoriya/${article.category.slug}`} className="inline-block bg-[#fdecea] text-red text-xs font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-full hover:bg-red hover:text-white">
                                {article.category.name}
                            </Link>
                        )}
                        <h1 className="font-[family-name:var(--font-display)] text-[38px] leading-[1.18] my-4 text-ink tracking-tight max-[560px]:text-[29px]">{article.title}</h1>
                        {article.summary && <p className="text-xl leading-[1.5] font-medium text-gray mb-6">{article.summary}</p>}

                        {/* Muallif qatori */}
                        <div className="flex items-center justify-between flex-wrap gap-3.5 py-4 mb-6 border-y border-line">
                            <div className="flex items-center gap-3">
                                <span className="w-11 h-11 rounded-full flex-none inline-flex items-center justify-center bg-gradient-to-br from-red to-red-dark text-white font-extrabold text-lg">{article.author.initial}</span>
                                <span className="flex flex-col gap-0.5">
                                    <span className="font-extrabold text-[15px] text-ink">{article.author.name}</span>
                                    <span className="text-[12.5px] text-faint font-semibold"><i className="fa-regular fa-calendar" /> {formatDateTime(article.publishedAt)}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-[18px] text-gray text-[13px] font-semibold">
                                <span><i className="fa-regular fa-eye text-faint mr-1" /> {formatNumber(article.views)}</span>
                                <span><i className="fa-regular fa-clock text-faint mr-1" /> {article.readMinutes} {t("article.readMin")}</span>
                            </div>
                        </div>

                        {article.cover && (
                            <figure className="m-0 mb-7">
                                <img className="w-full rounded-2xl block shadow-[var(--shadow-md)]" src={article.cover} alt={article.title} />
                            </figure>
                        )}

                        {/* Maqola tanasi — backend HTML */}
                        <div className="article-body text-lg leading-[1.75] text-[#23262d]" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />

                        {/* Ulashish */}
                        <div className="flex items-center gap-4 flex-wrap mt-8 py-[18px] border-t border-line">
                            <span className="font-extrabold text-ink text-sm"><i className="fa-solid fa-share-nodes text-red mr-1.5" /> {t("article.share")}</span>
                            <div className="flex gap-2.5">
                                <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener" aria-label="Telegram" className="w-10 h-10 rounded-full inline-flex items-center justify-center border border-line bg-white text-gray text-base hover:-translate-y-0.5 hover:bg-[#229ED9] hover:text-white hover:border-[#229ED9] transition-all"><i className="fa-brands fa-telegram" /></a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener" aria-label="Facebook" className="w-10 h-10 rounded-full inline-flex items-center justify-center border border-line bg-white text-gray text-base hover:-translate-y-0.5 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"><i className="fa-brands fa-facebook-f" /></a>
                                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`} target="_blank" rel="noopener" aria-label="X" className="w-10 h-10 rounded-full inline-flex items-center justify-center border border-line bg-white text-gray text-base hover:-translate-y-0.5 hover:bg-black hover:text-white hover:border-black transition-all"><i className="fa-brands fa-x-twitter" /></a>
                                <button onClick={copyLink} aria-label="Havolani nusxalash" className={`w-10 h-10 rounded-full inline-flex items-center justify-center border text-base hover:-translate-y-0.5 transition-all ${copied ? "bg-up border-up text-white" : "border-line bg-white text-gray hover:bg-ink hover:text-white hover:border-ink"}`}>
                                    <i className={copied ? "fa-solid fa-check" : "fa-regular fa-copy"} />
                                </button>
                            </div>
                        </div>
                    </article>

                    {/* Izohlar */}
                    <Comments slug={slug} />
                </div>

                {/* Sidebar */}
                <aside className="lg:sticky lg:top-[90px] flex flex-col gap-[26px] pt-6">
                    {popular.length > 0 && (
                        <SideBox icon="fa-solid fa-fire" title={t("article.popular")}>
                            {popular.map((a) => (
                                <TCard key={a.id} article={a} metaIcon="fa-regular fa-eye" metaText={(x) => formatNumber(x.views)} />
                            ))}
                        </SideBox>
                    )}
                    {latest.length > 0 && (
                        <SideBox icon="fa-regular fa-clock" title={t("common.latest")}>
                            {latest.slice(0, 5).map((a) => (
                                <TCard key={a.id} article={a} metaIcon="fa-regular fa-calendar" metaText={(x) => formatDate(x.publishedAt)} />
                            ))}
                        </SideBox>
                    )}
                </aside>
            </div>

            {/* O'xshash yangiliklar */}
            {related.length > 0 && (
                <section className="mt-11">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title m-0 text-[19px] font-extrabold tracking-tight">{t("article.related")}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {related.map((a) => (
                            <SmallCard key={a.id} article={a} showDesc={false} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
