import { useEffect, useState } from "react";
import { formatDateTime } from "../utils/format";

// Izohlar bloki — maqola detali uchun.
// Backend hozircha izoh endpointini bermagani uchun izohlar brauzer
// localStorage'ida (har maqola slug'i bo'yicha alohida) saqlanadi.
// Backend tayyor bo'lganda faqat load/save funksiyalarini API'ga almashtirish kifoya.
const LS_KEY = (slug) => `comments:${slug}`;

function loadComments(slug) {
    try {
        const raw = localStorage.getItem(LS_KEY(slug));
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveComments(slug, list) {
    try { localStorage.setItem(LS_KEY(slug), JSON.stringify(list)); } catch { /* to'lgan bo'lsa e'tiborsiz */ }
}

export default function Comments({ slug }) {
    const [comments, setComments] = useState([]);
    const [name, setName] = useState("");
    const [text, setText] = useState("");

    useEffect(() => {
        setComments(loadComments(slug));
    }, [slug]);

    const submit = (e) => {
        e.preventDefault();
        const body = text.trim();
        if (!body) return;
        const comment = {
            id: Date.now(),
            name: name.trim() || "Foydalanuvchi",
            text: body,
            createdAt: new Date().toISOString(),
        };
        const next = [comment, ...comments];
        setComments(next);
        saveComments(slug, next);
        setText("");
    };

    const remove = (id) => {
        const next = comments.filter((c) => c.id !== id);
        setComments(next);
        saveComments(slug, next);
    };

    const initial = (n) => (n?.trim()?.charAt(0) || "F").toUpperCase();

    return (
        <section className="mt-11 pt-8 border-t border-line">
            <h2 className="flex items-center gap-2.5 m-0 mb-6 text-[22px] font-extrabold tracking-tight text-ink">
                <i className="fa-regular fa-comments text-red" />
                Izohlar
                <span className="text-sm font-bold text-faint">({comments.length})</span>
            </h2>

            {/* Izoh yozish formasi */}
            <form onSubmit={submit} className="mb-8 flex flex-col gap-3 bg-surface rounded-2xl p-5 border border-line">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ismingiz (ixtiyoriy)"
                    className="w-full px-4 py-2.5 rounded-xl border border-line bg-white text-sm text-ink outline-none focus:border-red"
                />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Izohingizni yozing..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-line bg-white text-sm text-ink outline-none resize-y focus:border-red"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-red hover:bg-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <i className="fa-solid fa-paper-plane" /> Yuborish
                    </button>
                </div>
            </form>

            {/* Izohlar ro'yxati */}
            {comments.length === 0 ? (
                <p className="text-gray text-sm text-center py-6">Hozircha izohlar yo'q. Birinchi bo'lib fikringizni bildiring!</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-3.5 p-4 rounded-2xl border border-line bg-white">
                            <span className="flex-none w-10 h-10 rounded-full inline-flex items-center justify-center bg-gradient-to-br from-red to-red-dark text-white font-extrabold">
                                {initial(c.name)}
                            </span>
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-extrabold text-sm text-ink">{c.name}</span>
                                    <span className="text-[11.5px] text-faint font-semibold">{formatDateTime(c.createdAt)}</span>
                                </div>
                                <p className="m-0 text-sm leading-[1.6] text-[#23262d] whitespace-pre-wrap break-words">{c.text}</p>
                                <button
                                    onClick={() => remove(c.id)}
                                    className="self-start mt-1 text-[12px] font-semibold text-faint hover:text-red transition-colors"
                                >
                                    <i className="fa-regular fa-trash-can" /> O'chirish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
