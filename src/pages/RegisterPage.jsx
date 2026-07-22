import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login } from "../api";
import Field from "../components/Field";
import { useT } from "../i18n/LanguageContext";

export default function RegisterPage() {
    const t = useT();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", email: "", first_name: "", password: "", password2: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.password2) {
            setError(t("auth.passwordMismatch"));
            return;
        }
        setBusy(true);
        try {
            await register({
                username: form.username,
                email: form.email,
                first_name: form.first_name,
                password: form.password,
                password2: form.password2,
            });
            // Ro'yxatdan o'tgach avtomatik kirish
            try { await login(form.username, form.password); navigate("/profil"); }
            catch { navigate("/kirish"); }
        } catch (err) {
            const d = err.detail;
            const msg = d && typeof d === "object" ? Object.values(d).flat().join(" ") : t("auth.registerErr");
            setError(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex justify-center pt-12 pb-[72px] px-4">
            <div className="w-full max-w-[420px] bg-white border border-line rounded-2xl shadow-[var(--shadow-md)] px-[30px] py-[34px]">
                <h1 className="font-[family-name:var(--font-display)] text-[27px] m-0 mb-1.5 text-ink">{t("auth.register")}</h1>
                <p className="text-gray text-[14.5px] m-0 mb-[22px]">{t("auth.registerSub")}</p>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    {error && <div className="bg-[#fdecea] border border-[#f5c6c2] text-red-dark px-3.5 py-2.5 rounded-lg text-[13.5px] font-semibold">{error}</div>}
                    <Field label={t("auth.username")} name="username" value={form.username} onChange={set("username")} autoComplete="username" />
                    <Field label={t("auth.firstName")} name="first_name" value={form.first_name} onChange={set("first_name")} autoComplete="given-name" />
                    <Field label={t("auth.email")} name="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
                    <Field label={t("auth.password")} name="password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" help={t("auth.passwordHelp")} />
                    <Field label={t("auth.confirmPassword")} name="password2" type="password" value={form.password2} onChange={set("password2")} autoComplete="new-password" />
                    <button type="submit" disabled={busy} className="mt-1.5 w-full inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-lg font-bold text-white bg-red hover:bg-red-dark transition-colors disabled:opacity-60">
                        {busy ? <i className="fa-solid fa-spinner fa-spin" /> : t("auth.register")}
                    </button>
                </form>

                <p className="mt-5 text-center text-sm text-gray">
                    {t("auth.hasAccount")} <Link to="/kirish" className="text-red font-bold hover:underline">{t("auth.login")}</Link>
                </p>
            </div>
        </div>
    );
}
