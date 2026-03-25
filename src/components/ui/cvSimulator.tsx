"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Eye } from "lucide-react";

const findings = [
  { icon: AlertTriangle, label: "Teléfono personal", risk: "Alto", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { icon: Eye, label: "Dirección completa", risk: "Alto", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { icon: CheckCircle, label: "Email profesional", risk: "Bajo", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

export function CvSimulator() {
  return (
    <div className="relative rounded-2xl border border-emerald-900/40 bg-surface/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Resultado del análisis</p>
          <p className="text-sm font-mono text-slate-200">hoja_de_vida.pdf</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#0d2318" strokeWidth="6" />
              <motion.circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={163}
                initial={{ strokeDashoffset: 163 }}
                animate={{ strokeDashoffset: 163 * 0.32 }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-mono font-bold text-emerald-400">68</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 mt-1">Puntaje</span>
        </div>
      </div>

      <div className="border-t border-emerald-900/30 mb-4" />

      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Riesgos detectados</p>
      <div className="space-y-2">
        {findings.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${f.bg} ${f.border}`}
          >
            <div className="flex items-center gap-2.5">
              <f.icon className={`w-3.5 h-3.5 ${f.color}`} />
              <span className="text-sm text-slate-300">{f.label}</span>
            </div>
            <span className={`text-xs font-mono font-medium ${f.color}`}>{f.risk}</span>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-emerald-900/30 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <p className="text-xs text-slate-500">Análisis completado · datos no almacenados</p>
      </div>
    </div>
  );
}
