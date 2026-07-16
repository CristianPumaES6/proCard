/**
 * Utilidades de scraping dependency-free (sin cheerio).
 * - fetchWithTimeout: fetch con AbortController para no colgar la request.
 * - stripTags / decodeEntities / clean: normalizan texto extraído de HTML.
 * - extractJsonLd: recupera los bloques schema.org (application/ld+json),
 *   que es la forma MÁS robusta de leer ofertas cuando la fuente los expone.
 */

const NAMED_ENTITIES: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ntilde: "ñ",
    Ntilde: "Ñ",
    aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
    Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
    uuml: "ü", Uuml: "Ü",
    ordf: "ª", ordm: "º", deg: "°", hellip: "…", mdash: "—", ndash: "–",
};

export function decodeEntities(input: string): string {
    if (!input) return "";
    return input
        // Numéricas decimales &#233;
        .replace(/&#(\d+);/g, (_, n) => {
            try { return String.fromCodePoint(parseInt(n, 10)); } catch { return _; }
        })
        // Numéricas hexadecimales &#xE9;
        .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => {
            try { return String.fromCodePoint(parseInt(n, 16)); } catch { return _; }
        })
        // Nombradas conocidas
        .replace(/&([a-zA-Z]+);/g, (m, name) => (name in NAMED_ENTITIES ? NAMED_ENTITIES[name] : m));
}

export function stripTags(html: string): string {
    if (!html) return "";
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ");
}

/** Quita etiquetas, decodifica entidades y colapsa espacios. */
export function clean(html: string): string {
    return decodeEntities(stripTags(html)).replace(/\s+/g, " ").trim();
}

/** Recorta a un máximo de caracteres respetando palabras. */
export function truncate(text: string, max = 220): string {
    const t = (text || "").trim();
    if (t.length <= max) return t;
    return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export interface FetchOpts extends RequestInit {
    timeoutMs?: number;
}

const DEFAULT_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function fetchWithTimeout(url: string, opts: FetchOpts = {}): Promise<Response> {
    const { timeoutMs = 8000, headers, ...rest } = opts;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, {
            cache: "no-store",
            ...rest,
            signal: controller.signal,
            headers: {
                "User-Agent": DEFAULT_UA,
                "Accept-Language": "es-PE,es;q=0.9,en;q=0.8",
                ...headers,
            },
        });
    } finally {
        clearTimeout(timer);
    }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * fetchWithTimeout + reintento con backoff jitter ante fallos transitorios
 * (HTTP 429 / 5xx / timeout / error de red). Los 4xx no-transitorios (403, 404)
 * se devuelven tal cual para que el adaptador decida.
 */
export async function fetchWithRetry(url: string, opts: FetchOpts = {}, retries = 1): Promise<Response> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetchWithTimeout(url, opts);
            if (res.ok) return res;
            if (res.status !== 429 && res.status < 500) return res; // no-transitorio
            lastErr = new Error(`HTTP ${res.status}`);
        } catch (e) {
            lastErr = e;
        }
        if (attempt < retries) await sleep(250 + Math.floor(Math.random() * 400));
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/**
 * Extrae y parsea todos los bloques <script type="application/ld+json">.
 * Aplana los @graph. Devuelve [] si no hay o si el JSON está corrupto.
 */
export function extractJsonLd(html: string): any[] {
    const out: any[] = [];
    const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
        const raw = m[1].trim();
        if (!raw) continue;
        try {
            const parsed = JSON.parse(raw);
            const items = Array.isArray(parsed) ? parsed : [parsed];
            for (const it of items) {
                if (it && Array.isArray(it["@graph"])) out.push(...it["@graph"]);
                else out.push(it);
            }
        } catch {
            /* JSON-LD malformado: se ignora esa fuente y se sigue */
        }
    }
    return out;
}

/** Extrae el primer objeto JSON embebido tras un marcador (p.ej. __NEXT_DATA__). */
export function extractEmbeddedJson(html: string, marker: RegExp): any | null {
    const m = marker.exec(html);
    if (!m) return null;
    // A partir del final del match, buscar el primer '{' y balancear llaves.
    const start = html.indexOf("{", m.index + m[0].length - 1);
    if (start === -1) return null;
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < html.length; i++) {
        const ch = html[i];
        if (inStr) {
            if (esc) esc = false;
            else if (ch === "\\") esc = true;
            else if (ch === '"') inStr = false;
            continue;
        }
        if (ch === '"') inStr = true;
        else if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0) {
                try { return JSON.parse(html.slice(start, i + 1)); } catch { return null; }
            }
        }
    }
    return null;
}
