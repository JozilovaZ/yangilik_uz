import { useParams } from "react-router-dom";
import { fetchArticles, fetchCategories } from "../api";
import { useApi } from "../hooks/useApi";
import { SmallCard } from "../components/ui";
import { Loading, ErrorState, Empty } from "../components/States";
import { useT } from "../i18n/LanguageContext";

export default function CategoryPage() {
    const t = useT();
    const { slug } = useParams();
    const { data: categories } = useApi(fetchCategories, [], [], "categories");
    const { data, loading, error } = useApi(() => fetchArticles({ category: slug, ordering: "-published_at" }), [slug], null, "articles-cat");

    const category = (categories || []).find((c) => c.slug === slug);
    const articles = data?.results || [];

    return (
        <section className="mt-7 mb-[46px]">
            <div className="flex items-center justify-between mb-4">
                <h1 className="section-title m-0 text-[19px] font-extrabold tracking-tight">{category?.name || slug}</h1>
            </div>

            {loading ? (
                <Loading />
            ) : error ? (
                <ErrorState error={error} />
            ) : articles.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {articles.map((a) => (
                        <SmallCard key={a.id} article={a} dateFmt="full" />
                    ))}
                </div>
            ) : (
                <Empty label={t("category.empty")} />
            )}
        </section>
    );
}
