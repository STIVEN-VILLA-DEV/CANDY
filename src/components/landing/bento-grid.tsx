"use client";

import { motion } from "framer-motion";
import { Database, Brain, FileCheck, Lock, Zap, Eye } from "lucide-react";
import { useState, useEffect } from "react";

const items = [
  {
    icon: Database,
    title: "Sin guardar tu información",
    description:
      "Tu hoja de vida no se almacena en una base de datos. El análisis se hace en memoria en el servidor y el resultado solo llega a tu sesión actual. Priorizamos la confidencialidad de lo que compartes.",
    className: "md:col-span-2",
    color: "emerald",
  },
  {
    icon: Brain,
    title: "Pensado para el contexto en Colombia",
    description:
      "Detectamos de forma local datos sensibles habituales en CV colombianos: cédula, NIT, medios de contacto, dirección y otros indicios de riesgo, sin enviar el texto completo a terceros para el análisis principal.",
    className: "md:col-span-1",
    color: "jade",
  },
  {
    icon: Lock,
    title: "Sesión efímera",
    description:
      "Al cerrar sesión o al recargar la página, dejan de estar disponibles los resultados de ese análisis en tu navegador. No usamos tu CV para publicidad ni para cobrarte por el contenido que revisas.",
    className: "md:col-span-1",
    color: "emerald",
  },
  {
    icon: FileCheck,
    title: "Compatible con procesos ATS",
    description:
      "Las recomendaciones van orientadas a proteger tu privacidad sin romper lo que suelen esperar los sistemas de seguimiento de candidatos. El objetivo es que dejes de exponer datos innecesarios, no que pierdas visibilidad frente a un reclutador.",
    className: "md:col-span-2",
    color: "jade",
  },
  {
    icon: Zap,
    title: "Acceso solo con tu cuenta",
    description:
      "El análisis de archivos está en el panel protegido por inicio de sesión. Así se reduce el uso indebido del servicio y queda claro que los resultados no son visibles para cualquiera que solo visite la página.",
    className: "md:col-span-2",
    color: "emerald",
  },
  {
    icon: Eye,
    title: "Transparencia en cada hallazgo",
    description:
      "Verás qué tipo de dato se detectó, un ejemplo o referencia en tu documento y una recomendación concreta para reducir el riesgo.",
    className: "md:col-span-1",
    color: "jade",
  },
];

export default function BentoGrid() {
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <div className="inline-block font-mono text-left bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">[{">"}]</span>
            <span className="text-white font-semibold text-sm">Seguridad sin compromisos</span>
            <span className={`w-2 h-4 bg-emerald-500 ${cursorVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-75`} />
          </div>
        </div>
        <p className="text-slate-500 text-sm mt-4 max-w-md mx-auto">
          Protegemos tu información con la misma seriedad que protegeríamos la nuestra
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`${item.className} relative p-6 rounded-xl border bg-surface/60 backdrop-blur-sm overflow-hidden group transition-all duration-300 ${
              item.color === "jade"
                ? "border-emerald-900/40 hover:border-jade/30 hover:glow-jade"
                : "border-emerald-900/40 hover:border-emerald-500/30 hover:glow-emerald"
            }`}
          >
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_left,_${
                item.color === "jade" ? "#00c89608" : "#10b98108"
              }_0%,_transparent_70%)]`}
            />
            <item.icon
              className={`w-8 h-8 mb-4 ${
                item.color === "jade" ? "text-jade" : "text-emerald-400"
              }`}
            />
          <h3 className="font-heading font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
