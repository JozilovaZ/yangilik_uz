// Yuklanish, xato va bo'sh holatlar uchun umumiy ko'rinishlar
import { useT } from "../i18n/LanguageContext";

export function Loading({ label }) {
    const t = useT();
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-gray">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-red" />
            <span className="font-semibold">{label || t("common.loading")}</span>
        </div>
    );
}

export function ErrorState({ error, onRetry }) {
    const t = useT();
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
            <i className="fa-solid fa-triangle-exclamation text-3xl text-red" />
            <p className="font-bold text-ink m-0">{t("common.errorTitle")}</p>
            <p className="text-gray text-sm m-0">{error?.message || t("common.errorText")}</p>
            {onRetry && (
                <button onClick={onRetry} className="mt-2 px-4 py-2 rounded-lg font-bold text-white bg-red hover:bg-red-dark transition-colors">
                    {t("common.retry")}
                </button>
            )}
        </div>
    );
}

export function Empty({ label }) {
    const t = useT();
    return (
        <div className="flex flex-col items-center justify-center text-center py-14 gap-2 text-gray">
            <i className="fa-regular fa-folder-open text-3xl text-faint" />
            <p className="m-0 font-semibold">{label || t("common.empty")}</p>
        </div>
    );
}
