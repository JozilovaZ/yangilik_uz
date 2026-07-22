import { fetchCategories, fetchArticles } from "../api";
import { useApi } from "../hooks/useApi";
import { SectionHead, SmallCard } from "./ui";

// Bitta kategoriya bloki — o'z maqolalarini yuklaydi
function CategoryBlock({ category }) {
    const { data } = useApi(() => fetchArticles({ category: category.slug, ordering: "-published_at" }), [category.slug], null, "articles-cat-home");
    const articles = (data?.results || []).slice(0, 4);
    if (!articles.length) return null;

    return (
        <section className="mb-[46px]">
            <SectionHead title={category.name} moreHref={`/kategoriya/${category.slug}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {articles.map((a) => (
                    <SmallCard key={a.id} article={a} dateFmt="full" />
                ))}
            </div>
        </section>
    );
}

export default function CategoryBlocks() {
    // Maqolasi bor barcha kategoriyalar
    const { data: categories } = useApi(fetchCategories, [], [], "categories");
    const blocks = (categories || []).filter((c) => c.count > 0);

    return (
        <>
            {blocks.map((c) => (
                <CategoryBlock key={c.id} category={c} />
            ))}
        </>
    );
}
