// ============================================================
//  Vercel Serverless proksi — /api/* va /media/* so'rovlarini
//  HTTP backendga (SSL'siz) server tomonidan uzatadi.
//
//  NEGA KERAK: Vercel HTTPS sayt. Brauzerdan to'g'ridan-to'g'ri
//  http://144.91.118.72:8003 ga so'rov = "Mixed Content" (bloklanadi),
//  Vercel "rewrites" proksi esa oddiy http/xom-IP manzilga o'tkazmaydi.
//  Bu funksiya Node ichida ishlaydi — http backendga bemalol ulanadi.
//
//  MARSHRUT:
//   /api/v1/...        -> filesystem orqali shu funksiyaga tushadi
//   /media/...         -> vercel.json rewrite bilan /api/media/... ga
//                         aylanadi va shu yerda /media/... ga qaytariladi
// ============================================================

const BACKEND = "http://144.91.118.72:8003";

// So'rov tanasini (POST/PUT) xom holda o'qiymiz
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
    // req.url query bilan birga keladi: "/api/v1/cities/?lang=uz"
    let path = req.url || "";
    // /media/* -> vercel.json uni /api/media/* ga aylantirgan; "/api" ni olib tashlaymiz
    if (path.startsWith("/api/media/")) path = path.slice(4); // -> "/media/..."

    const target = BACKEND + path;

    // Kiruvchi header'larni uzatamiz (host'ni olib tashlab)
    const headers = { ...req.headers };
    delete headers.host;
    delete headers["content-length"];
    delete headers["accept-encoding"]; // fetch o'zi ochadi

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
            // sikllanadigan/mos kelmaydigan header'larni o'tkazmaymiz
            if (["content-encoding", "transfer-encoding", "connection", "content-length"].includes(k)) return;
            res.setHeader(key, value);
        });

        const buf = Buffer.from(await backendRes.arrayBuffer());
        res.send(buf);
    } catch (err) {
        res.status(502).json({ error: "proxy_failed", target, detail: String(err) });
    }
}
