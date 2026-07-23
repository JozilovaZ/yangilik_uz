// ============================================================
//  Vercel Serverless proksi — /api/v1/* va /media/* so'rovlarini
//  HTTP backendga (SSL'siz) server tomonidan uzatadi.
//
//  NEGA KERAK: Vercel HTTPS sayt. Brauzerdan to'g'ridan-to'g'ri
//  http://144.91.118.72:8003 ga so'rov = "Mixed Content" (bloklanadi),
//  Vercel "rewrites" proksi esa oddiy http/xom-IP manzilga o'tkazmaydi.
//  Bu funksiya Node ichida ishlaydi — http backendga bemalol ulanadi.
//
//  MARSHRUT (vercel.json orqali):
//   /api/v1/...  ->  /api/proxy?p=/api/v1/...
//   /media/...   ->  /api/proxy?p=/media/...
//  Asl yo'l ?p= da keladi; boshqa query paramlar (masalan lang) alohida.
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
    const q = req.query || {};

    // Asl yo'l ?p= da (vercel.json bergan)
    let p = q.p || "";
    if (Array.isArray(p)) p = p[p.length - 1];
    if (!p) return res.status(400).json({ error: "no_path" });

    // Qolgan query paramlarni (p dan tashqari) qayta yig'amiz
    const extra = new URLSearchParams();
    for (const [k, v] of Object.entries(q)) {
        if (k === "p") continue;
        if (Array.isArray(v)) v.forEach((x) => extra.append(k, x));
        else extra.append(k, v);
    }

    // DRF trailing-slash: oxirgi segmentda nuqta (fayl) bo'lmasa "/" qo'shamiz
    const last = p.split("/").pop();
    if (!p.endsWith("/") && !last.includes(".")) p += "/";

    const qs = extra.toString();
    const target = BACKEND + p + (qs ? "?" + qs : "");

    // Header'larni uzatamiz (host'ni olib tashlab)
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
