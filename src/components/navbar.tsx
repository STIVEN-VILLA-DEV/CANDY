"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Shield, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

function SignInIconButton() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative flex items-center">
      <Link
        href="/sign-in"
        aria-label="Iniciar sesión"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-emerald-300 transition-all hover:bg-emerald-950/40 hover:text-emerald-200"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        <UserCircle className="w-5 h-5" />
      </Link>

      {/* tooltip */}
      {show && (
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-md bg-surface-2 border border-slate-700 text-xs text-slate-300 whitespace-nowrap pointer-events-none z-50"
        >
          Iniciar sesión
          {/* flecha */}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-2 border-l border-t border-slate-700 rotate-45" />
        </motion.span>
      )}
    </div>
  );
}

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full px-4 pt-4"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <Shield className="h-5 w-5 text-emerald-400 transition-all duration-300 group-hover:scale-105 group-hover:text-emerald-300" />
          <span className="text-lg font-heading font-semibold tracking-tight text-slate-100">
            Ca<span className="text-gradient-emerald">ndy</span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/#features"
            className="hidden text-sm font-medium text-slate-400 transition-colors hover:text-emerald-300 sm:inline-block"
          >
            Características
          </Link>

          <SignedOut>
            {/* móvil: ícono con tooltip — desktop: botón de texto */}
            <div className="sm:hidden">
              <SignInIconButton />
            </div>
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex rounded-lg border border-emerald-800/50 px-4 py-2 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-600/60 hover:bg-emerald-950/40 hover:text-emerald-200"
            >
              Iniciar sesión
            </Link>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-emerald-950/30 hover:text-emerald-300"
            >
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{ elements: { avatarBox: "w-8 h-8" } }}
            />
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
}
