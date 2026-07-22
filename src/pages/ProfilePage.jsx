import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe, logout, tokens } from "../api";
import { useApi } from "../hooks/useApi";
import { useT } from "../i18n/LanguageContext";
import { formatDate } from "../utils/format";
import { Loading, ErrorState } from "../components/States";

export default function ProfilePage() {
    const t = useT();
    const navigate = useNavigate();

    // Kirmagan bo'lsa — login sahifasiga
    useEffect(() => {
        if (!tokens.isAuthed) navigate("/kirish");
    }, [navigate]);

    const { data: user, loading, error } = useApi(fetchMe, [], null);

    if (loading) return <Loading />;
    if (error || !user) return <ErrorState error={error || new Error(t("profile.notFound"))} />;

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
    const role = user.is_staff ? t("profile.editor") : t("profile.user");

    const rows = [
        { icon: "fa-user", label: t("auth.username"), value: user.username },
        { icon: "fa-envelope", label: t("auth.email"), value: user.email || "—" },
        { icon: "fa-calendar", label: t("profile.joined"), value: user.date_joined ? formatDate(user.date_joined) : "—" },
    ];

    const doLogout = () => { logout(); navigate("/"); };

    return (
        <div className="flex justify-center pt-11 pb-[72px] px-4">
            <div className="w-full max-w-[520px] bg-white border border-line rounded-[18px] shadow-[var(--shadow-md)] p-[30px]">
                <div className="flex items-center gap-4 pb-[22px] mb-[22px] border-b border-line">
                    <div className="w-16 h-16 rounded-full flex-none inline-flex items-center justify-center bg-gradient-to-br from-red to-red-dark text-white font-extrabold text-[28px]">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="font-[family-name:var(--font-display)] text-2xl m-0 mb-1 text-ink">{fullName}</h1>
                        <span className="inline-block text-xs font-bold text-red bg-[#fdecea] px-2.5 py-0.5 rounded-full">{role}</span>
                    </div>
                </div>

                <dl className="m-0 flex flex-col gap-0.5">
                    {rows.map((r) => (
                        <div key={r.label} className="flex items-center justify-between gap-4 py-3 px-1 border-b border-surface-2 last:border-b-0">
                            <dt className="m-0 text-gray text-[13.5px] font-semibold flex items-center gap-2.5">
                                <i className={`fa-solid ${r.icon} text-faint w-4 text-center`} /> {r.label}
                            </dt>
                            <dd className="m-0 text-ink font-bold text-sm">{r.value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="flex gap-3 mt-6">
                    <button onClick={doLogout} className="flex-1 inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-lg font-bold text-white bg-red hover:bg-red-dark transition-colors">
                        <i className="fa-solid fa-right-from-bracket" /> {t("profile.logout")}
                    </button>
                </div>
            </div>
        </div>
    );
}
