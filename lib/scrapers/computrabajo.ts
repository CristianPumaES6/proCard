import { JobResult } from "./types";
import { clean, truncate, fetchWithTimeout, fetchWithRetry, extractJsonLd } from "./html";

/**
 * Computrabajo Perú. Server-rendered, sin auth. Verificado en vivo:
 *  - Lista: https://pe.computrabajo.com/trabajo-de-{slug}?p={page}
 *    Las tarjetas <article class="box_offer"> traen título, empresa, ubicación
 *    y URL de detalle, pero NO descripción.
 *  - Detalle: descripción / salario / jornada viven en el JSON-LD (JobPosting)
 *    de cada oferta, así que enriquecemos los primeros resultados.
 * Cloudflare exige un User-Agent de navegador real (lo pone fetchWithTimeout).
 */
const ORIGIN = "https://pe.computrabajo.com";
const ENRICH_LIMIT = 6; // cuántas ofertas enriquecer con detalle

const EMPLOYMENT_ES: Record<string, string> = {
    FULL_TIME: "Jornada completa",
    PART_TIME: "Media jornada",
    CONTRACTOR: "Por contrato",
    TEMPORARY: "Temporal",
    INTERN: "Prácticas",
    OTHER: "Otro",
};

interface Detail {
    description: string;
    salary?: string;
    employmentType?: string;
}

function slugify(q: string): string {
    return q
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function absolute(href: string): string {
    if (!href) return "";
    const stripped = href.split("#")[0];
    if (stripped.startsWith("http")) return stripped;
    return ORIGIN + (stripped.startsWith("/") ? stripped : "/" + stripped);
}

function formatSalary(baseSalary: any): string | undefined {
    if (!baseSalary) return undefined;
    const currency = baseSalary.currency || baseSalary.salaryCurrency || "";
    const v = baseSalary.value ?? baseSalary;
    const min = v?.minValue ?? v?.value;
    const max = v?.maxValue;
    if (!min && !max) return undefined;
    const range = max && max !== min ? `${min} - ${max}` : `${min}`;
    return `${currency ? currency + " " : ""}${range}`.trim();
}

function parseCards(html: string): JobResult[] {
    const blocks = html.split(/<article class="box_offer/i).slice(1);
    const out: JobResult[] = [];

    for (const block of blocks) {
        const titleMatch = /<a class="js-o-link fc_base" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i.exec(block);
        if (!titleMatch) continue;

        const url = absolute(titleMatch[1]);
        const title = clean(titleMatch[2]);

        // Empresa: anclada al atributo único; si no hay <a>, texto del primer <p>.
        const companyMatch =
            /offer-grid-article-company-url[^>]*>([\s\S]*?)<\/a>/i.exec(block) ||
            /<p class="dFlex[^"]*fc_base[^"]*"[^>]*>([\s\S]*?)<\/p>/i.exec(block);
        const company = companyMatch ? clean(companyMatch[1]) : "";

        // Ubicación: <span class="mr10"> dentro del <p> de ubicación.
        const locMatch = /<span class="mr10">([\s\S]*?)<\/span>/i.exec(block);
        const location = locMatch ? clean(locMatch[1]) : "";

        // Fecha relativa: <p class="fs13 fc_aux mt15">Hace 3 horas</p>
        const dateMatch = /<p class="fs13 fc_aux[^"]*">([\s\S]*?)<\/p>/i.exec(block);
        const postedAt = dateMatch ? clean(dateMatch[1]) : undefined;

        if (title && url) {
            out.push({ source: "Computrabajo", title, company, location, description: "", url, postedAt });
        }
    }
    return out;
}

/** Abre la página de detalle y saca descripción/salario/jornada del JobPosting JSON-LD. */
async function fetchDetail(url: string): Promise<Detail> {
    try {
        const res = await fetchWithTimeout(url, {
            timeoutMs: 5000,
            headers: {
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                Referer: ORIGIN + "/",
            },
        });
        if (!res.ok) return { description: "" };
        const html = await res.text();
        for (const node of extractJsonLd(html)) {
            const type = node?.["@type"];
            const isJob = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
            if (!isJob) continue;
            const et = typeof node.employmentType === "string" ? node.employmentType.toUpperCase() : "";
            return {
                description: node.description ? truncate(clean(node.description)) : "",
                salary: formatSalary(node.baseSalary),
                employmentType: et ? EMPLOYMENT_ES[et] || clean(node.employmentType) : undefined,
            };
        }
    } catch {
        /* sin detalle: se muestra la tarjeta igual */
    }
    return { description: "" };
}

export async function searchComputrabajo(query: string, page = 0): Promise<JobResult[]> {
    const p = Math.max(0, page) + 1; // página 1 = sin ?p / con ?p=1
    const url = `${ORIGIN}/trabajo-de-${slugify(query)}${p > 1 ? `?p=${p}` : ""}`;

    const res = await fetchWithRetry(url, {
        timeoutMs: 9000,
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            Referer: ORIGIN + "/",
        },
    });
    if (!res.ok) throw new Error(`Computrabajo HTTP ${res.status}`);

    const html = await res.text();
    if (!html.includes("box_offer")) {
        // Body sin tarjetas => probable interstitial de Cloudflare o página vacía.
        throw new Error("Computrabajo: respuesta sin ofertas (posible bloqueo)");
    }

    const cards = parseCards(html);

    // Enriquecer los primeros resultados con detalle (best-effort, en paralelo).
    const toEnrich = cards.slice(0, ENRICH_LIMIT);
    const details = await Promise.allSettled(toEnrich.map((c) => fetchDetail(c.url)));
    details.forEach((d, i) => {
        if (d.status !== "fulfilled") return;
        if (d.value.description) toEnrich[i].description = d.value.description;
        if (d.value.salary) toEnrich[i].salary = d.value.salary;
        if (d.value.employmentType) toEnrich[i].employmentType = d.value.employmentType;
    });

    return cards;
}
