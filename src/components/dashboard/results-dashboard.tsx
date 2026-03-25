"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import type { AnalysisResult, RiskLevel } from "@/lib/types";
import PrivacyScore from "./privacy-score";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

const riskConfig: Record<RiskLevel, { icon: typeof AlertTriangle; color: string; bg: string; border: string; label: string }> = {
  high: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", label: "Alto riesgo" },
  medium: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Riesgo medio" },
  low: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Bajo riesgo" },
};

export default function ResultsDashboard({ result, onReset }: Props) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-8 rounded-xl border border-slate-800 bg-surface/60">
          <PrivacyScore score={result.score} />
          <p className="text-slate-400 text-sm mt-4 text-center">{result.summary}</p>
        </div>

        <div className="md:col-span-2 p-6 rounded-xl border border-slate-800 bg-surface/60">
          <h3 className="font-semibold mb-4 text-slate-200">Recomendaciones ATS</h3>
          <ul className="space-y-2">
            {result.atsRecommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                {rec}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4 text-slate-200">
          Hallazgos ({result.findings.length})
        </h3>
        <div className="space-y-3">
          {result.findings.map((finding, i) => {
            const cfg = riskConfig[finding.risk];
            return (
              <motion.div
                key={finding.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                  <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-xs text-slate-500 ml-auto">{finding.category}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Dato detectado</p>
                    <p className="text-sm text-slate-200 font-mono bg-slate-900/60 px-3 py-2 rounded">
                      {finding.detected}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Recomendación</p>
                    <p className="text-sm text-slate-300 bg-slate-900/40 px-3 py-2 rounded">
                      {finding.recommendation}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
