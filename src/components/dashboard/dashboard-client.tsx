"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { AnalysisResult, ProcessingStatus } from "@/lib/types";
import Dropzone from "./dropzone";
import ProcessingOverlay from "./processing-overlay";
import ResultsDashboard from "./results-dashboard";

export default function DashboardClient() {
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("extracting");
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        // Clerk usa cookies de sesión (httpOnly). En algunos entornos/bounds,
        // hacer explícito el envío de credenciales evita que `auth()` llegue vacío.
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error en el análisis");
      }

      setStatus("analyzing");
      const data: AnalysisResult = await res.json();
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  const isProcessing = status === "uploading" || status === "extracting" || status === "analyzing";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-1">Panel de Análisis</h1>
          <p className="text-slate-400 text-sm">Es hora de conocer si tu CV expone tus datos personales.</p>
        </div>
        {result && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Datos
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 mb-8"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-mb text-amber-300">
          <strong>Sesión efímera:</strong> Tus datos se borrarán al refrescar o cerrar la sesión. Nada se guarda en servidores.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {status === "idle" || status === "error" ? (
          <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Dropzone onFile={handleFile} error={error} />
          </motion.div>
        ) : isProcessing ? (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProcessingOverlay status={status} />
          </motion.div>
        ) : result ? (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <ResultsDashboard result={result} onReset={handleReset} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
