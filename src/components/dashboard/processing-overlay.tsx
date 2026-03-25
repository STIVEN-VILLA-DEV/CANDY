"use client";

import { motion } from "framer-motion";
import { STATUS_MESSAGES } from "@/lib/utils";
import type { ProcessingStatus } from "@/lib/types";

interface Props {
  status: ProcessingStatus;
}

export default function ProcessingOverlay({ status }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      <div className="relative w-64 h-80 rounded-lg border border-slate-700 bg-surface/60 overflow-hidden">
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-2 rounded bg-slate-400"
              style={{ width: `${60 + Math.random() * 40}%` }}
            />
          ))}
        </div>

        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          style={{ boxShadow: "0 0 12px #06b6d4, 0 0 24px #06b6d480" }}
          animate={{ top: ["0%", "calc(100% - 2px)", "0%"] }}
          transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
      </div>

      <div className="text-center">
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-esmerald-400 font-medium mb-2"
        >
          {STATUS_MESSAGES[status]}
        </motion.p>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-esmerald-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
