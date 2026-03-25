"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full px-4 pt-4"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between  px-6">
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
            <Link
              href="/sign-in"
              className="rounded-lg border border-emerald-800/50 px-4 py-2 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-600/60 hover:bg-emerald-950/40 hover:text-emerald-200"
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
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
}
