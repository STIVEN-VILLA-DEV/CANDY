import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkTheme } from "@/lib/clerk-theme";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/dm-sans";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Candy",
  description:
    "Analiza la exposición de datos personales en tu CV sin almacenar información en bases de datos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkTheme}
      proxyUrl={undefined} 
      domain={undefined}
    >
      <html lang="es" className="dark">
        <body className="font-sans bg-background text-slate-100 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
