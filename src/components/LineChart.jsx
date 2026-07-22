// Yengil SVG chiziqli grafik (tashqi kutubxonasiz).
// props: data = [sonlar], height
export default function LineChart({ data, height = 280 }) {
    if (!data?.length) return null;
    const W = 800, H = height, pad = 10;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const x = (i) => pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = (v) => pad + (1 - (v - min) / range) * (H - pad * 2);

    const line = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const area = `${line} L${x(data.length - 1).toFixed(1)},${H - pad} L${x(0).toFixed(1)},${H - pad} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
            <defs>
                <linearGradient id="fxfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(206,43,34,.18)" />
                    <stop offset="100%" stopColor="rgba(206,43,34,0)" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#fxfill)" />
            <path d={line} fill="none" stroke="#CE2B22" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </svg>
    );
}
