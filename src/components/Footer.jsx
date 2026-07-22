import { Link } from "react-router-dom";
import { fetchCategories } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";

const socials = [
    { icon: "fa-telegram", label: "Telegram" },
    { icon: "fa-instagram", label: "Instagram" },
    { icon: "fa-youtube", label: "YouTube" },
    { icon: "fa-facebook", label: "Facebook" },
];

export default function Footer() {
    const { data: categories } = useApi(fetchCategories, [], [], "categories");
    const t = useT();

    const sections = [
        { label: t("common.home"), href: "/" },
        { label: t("common.currency"), href: "/valyuta" },
        { label: t("common.weather"), href: "/ob-havo" },
    ];
    const info = [
        { label: t("footer.about"), href: "#" },
        { label: t("footer.contact"), href: "#" },
        { label: t("footer.privacy"), href: "#" },
    ];

    return (
        <footer className="mt-[60px] bg-ink text-[#c9cdd4]">
            <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 py-13 pt-[52px] pb-10">
                <div className="sm:col-span-2 lg:col-span-1">
                    <Link to="/" className="text-[26px] font-extrabold text-white">UZ<span className="text-red">LIFE</span></Link>
                    <p className="mt-3.5 mb-4.5 text-sm leading-[1.6] text-[#9aa0a9] max-w-[34ch]">
                        {t("footer.tagline")}
                    </p>
                    <div className="flex gap-3">
                        {socials.map((s) => (
                            <a key={s.label} href="#" aria-label={s.label} className="w-[38px] h-[38px] rounded-full inline-flex items-center justify-center bg-white/10 text-[#d6dae0] text-base hover:bg-red hover:text-white hover:-translate-y-0.5 transition-all">
                                <i className={`fa-brands ${s.icon}`} />
                            </a>
                        ))}
                    </div>
                </div>

                <FooterCol title={t("footer.rubrics")} links={(categories || []).map((c) => ({ label: c.name, href: `/kategoriya/${c.slug}` }))} />
                <FooterCol title={t("footer.sections")} links={sections} />
                <FooterCol title={t("footer.info")} links={info} />
            </div>

            <div className="border-t border-white/10">
                <div className="container flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 py-4.5 text-[12.5px] text-[#8a909a]">
                    <span>© {new Date().getFullYear()} UZLIFE. {t("footer.rights")}</span>
                    <span>{t("footer.cbuNote")}</span>
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, links }) {
    return (
        <div>
            <h4 className="mt-1 mb-4 text-[13px] font-extrabold uppercase tracking-wide text-white">{title}</h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-[11px]">
                {links.map((l) => (
                    <li key={l.label}>
                        <Link to={l.href} className="text-sm text-[#b3b8c0] hover:text-red transition-colors">{l.label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
