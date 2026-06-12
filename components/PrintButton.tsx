"use client";

import { FileDown, Printer } from "lucide-react";

/**
 * Botón de exportación del CV.
 * window.print() abre el diálogo del navegador donde el usuario puede
 * "Guardar como PDF" — el documento usa estilos @media print optimizados
 * (A4, saltos de página controlados, portafolio en página propia).
 */
export function PrintButton() {
    return (
        <div className="flex flex-col items-end gap-2">
            <button
                onClick={() => window.print()}
                className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                title="Exportar como PDF (elige 'Guardar como PDF' en el diálogo)"
            >
                <FileDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
                <span className="font-semibold">Exportar PDF</span>
            </button>
            <span className="text-[10px] text-slate-400 bg-white/90 px-3 py-1 rounded-full shadow flex items-center gap-1.5 font-medium">
                <Printer size={11} />
                En el diálogo elige “Guardar como PDF”
            </span>
        </div>
    );
}
