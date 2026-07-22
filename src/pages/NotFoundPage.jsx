import { Link } from "react-router-dom";
import { useT } from "../i18n/LanguageContext";

export default function NotFoundPage() {
    const t = useT();
    return (
        <div className="flex flex-col items-center justify-center text-center py-24">
            <span className="font-[family-name:var(--font-display)] text-[90px] font-bold text-red leading-none">404</span>
            <h1 className="text-2xl font-extrabold mt-4 mb-2">{t("notFound.title")}</h1>
            <p className="text-gray mb-6">{t("notFound.text")}</p>
            <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white bg-red hover:bg-red-dark transition-colors">
                <i className="fa-solid fa-house" /> {t("notFound.back")}
            </Link>
        </div>
    );
}
