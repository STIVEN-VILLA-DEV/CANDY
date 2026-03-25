import Link from "next/link";
import { Github, Linkedin, Shield } from "lucide-react";

const GITHUB_URL = "https://github.com";
const LINKEDIN_URL = "https://www.linkedin.com";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold">
            Ca<span className="text-gradient-cyan">ndy</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 text-center max-w-md">
          Candy no almacena, vende ni comparte ningún dato personal. Todo el
          procesamiento ocurre en memoria y se descarta inmediatamente una vez el 
          usuario cierre sesion o refresque la pagina.
        </p>

        <div className="flex items-center gap-5 text-xs text-slate-500">
          <Link
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" aria-hidden />
          </Link>
          <Link
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" aria-hidden />
          </Link>
          <span>© 2026 VillaDev</span>
        </div>
      </div>
    </footer>
  );
}
