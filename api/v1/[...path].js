// ============================================================
//  Catch-all proksi: /api/v1/* so'rovlarini HTTP backendga uzatadi.
//
//  NEGA CATCH-ALL (rewrite emas): Vercel'da `api/` papkasi bo'lgani
//  uchun butun /api/* yo'nalishi "serverless funksiyalar" hududi.
//  /api/v1/... so'rovi kelganda Vercel avval funksiya faylini qidiradi,
//  topmasa REWRITE'dan OLDIN 404 qaytaradi. Shuning uchun rewrite emas,
//  aynan shu yo'lda joylashgan funksiya kerak. Bu fayl /api/v1/* ni
//  butunlay ushlaydi va req.url ni backendga xuddi shundayligicha uzatadi.
// ============================================================

const BACKEND = "http://144.91.118.72:8003";

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (c) => chunks.push(c));
        req.on("end", () => resolve(chunks.length ? Buffer.concat(chunks) : undefined));
        req.on("error", reject);
    });
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    // req.url = "/api/v1/categories/?lang=uz" — backend yo'li bilan bir xil
    let url = req.url || "";

    // DRF trailing-slash: yo'l qismida (query'gacha) oxirgi segment fayl
    // bo'lmasa "/" qo'shamiz
    const [pathPart, queryPart] = url.split("?");
    const last = pathPart.split("/").pop();
    let fixedPath = pathPart;
    if (!pathPart.endsWith("/") && !last.includes(".")) fixedPath += "/";
    const target = BACKEND + fixedPath + (queryPart ? "?" + queryPart : "");

    const headers = { ...req.headers };
    delete headers.host;
    delete headers["content-length"];
    delete headers["accept-encoding"];

    const method = req.method || "GET";
    const hasBody = !["GET", "HEAD"].includes(method);

    try {
        const backendRes = await fetch(target, {
            method,
            headers,
            body: hasBody ? await readBody(req) : undefined,
            redirect: "follow",
        });

        res.status(backendRes.status);
        backendRes.headers.forEach((value, key) => {
            const k = key.toLowerCase();
            if (["content-encoding", "transfer-encoding", "connection", "content-length"].includes(k)) return;
            res.setHeader(key, value);
        });

        const buf = Buffer.from(await backendRes.arrayBuffer());
        res.send(buf);
    } catch (err) {
        res.status(502).json({ error: "proxy_failed", target, detail: String(err) });
    }
}
