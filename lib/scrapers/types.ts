/**
 * Tipos compartidos por el agregador de ofertas de empleo.
 * Cada fuente (LinkedIn, Computrabajo, Bumeran) produce JobResult[] con la
 * misma forma para que el frontend las renderice de manera uniforme.
 */

export type JobSource = "LinkedIn" | "Computrabajo" | "Bumeran";

export interface JobResult {
    source: JobSource;
    title: string;
    company: string;
    location: string;
    /** Snippet corto; puede quedar vacío si la fuente no lo expone en el listado. */
    description: string;
    /** URL pública de la oferta (siempre absoluta). */
    url: string;
    /** Texto relativo tipo "hace 2 días" cuando la fuente lo provee. */
    postedAt?: string;
    /** Jornada: "Full-time", "Part-time", etc. */
    employmentType?: string;
    /** Modalidad: "Remoto", "Presencial", "Híbrido". */
    modality?: string;
    /** Salario formateado cuando la fuente lo expone. */
    salary?: string;
}

export interface SourceStatus {
    source: JobSource;
    count: number;
    ok: boolean;
    error?: string;
}

export interface JobSearchResponse {
    query: string;
    location: string;
    page: number;
    /** true si alguna fuente devolvió resultados en esta página (hay más por cargar). */
    hasMore: boolean;
    results: JobResult[];
    sources: SourceStatus[];
    cached: boolean;
}
