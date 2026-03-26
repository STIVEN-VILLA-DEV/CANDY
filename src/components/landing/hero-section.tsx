"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { CvSimulator } from "../ui/cvSimulator";

const LOCKS = [
  { x: "3%",  y: "12%", size: 22, opacity: 0.15, duration: 7,  delay: 0 },
  { x: "91%", y: "8%",  size: 18, opacity: 0.12, duration: 9,  delay: 1 },
  { x: "6%",  y: "68%", size: 20, opacity: 0.13, duration: 10, delay: 1.5 },
  { x: "94%", y: "72%", size: 24, opacity: 0.14, duration: 8,  delay: 2.5 },
  { x: "48%", y: "6%",  size: 24, opacity: 0.20, duration: 11, delay: 0.8 },
  { x: "30%", y: "90%",  size: 24, opacity: 0.20, duration: 11, delay: 0.8 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-12">
      {/* fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#10b98112_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#00c89608_0%,_transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* animacion de candados flotantes */}
      {LOCKS.map((lock, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none text-emerald-400"
          style={{ left: lock.x, top: lock.y, opacity: lock.opacity }}
          animate={{ y: [0, -10, 0], rotate: [0, 4, -4, 0] }}
          transition={{ duration: lock.duration, delay: lock.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <Lock width={lock.size} height={lock.size} />
        </motion.div>
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          
          <div className="flex flex-col items-start">
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-5 leading-[1.1]"
            >
              Tu CV no puede{" "}
              <span className="text-gradient-emerald">exponer privacidad</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-slate-400 mb-8 leading-relaxed max-w-lg"
            >
               Analiza tu currículum  para detectar información
              personal sensible antes de que llegue a manos equivocadas. Sin bases
              de datos. Sin almacenamiento. Solo resultados.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold transition-all glow-emerald hover:scale-105"
              >
                Analizar mi CV ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#features"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-emerald-900/60 hover:border-emerald-700/60 text-slate-300 transition-all hover:bg-emerald-950/30"
              >
                Ver cómo funciona
              </Link>
            </motion.div>
          </div>

           {/* simulacion de cv analizado */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <CvSimulator />

          </motion.div>

        </div>
      </div>
    </section>
  );
}
