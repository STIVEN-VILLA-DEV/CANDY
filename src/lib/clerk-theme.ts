import type { Theme } from "@clerk/types";

export const clerkTheme: Theme = {
  baseTheme: undefined,
  variables: {
    // Colores base
    colorBackground: "#061410",
    colorInputBackground: "#020c08",
    colorInputText: "#f1f5f9",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorTextOnPrimaryBackground: "#020c08",

    // Acento principal — emerald
    colorPrimary: "#10b981",
    colorDanger: "#ef4444",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",

    // Bordes y sombras
    colorNeutral: "#0d2318",

    // Tipografía
    fontFamily: "var(--font-sans)",
    fontFamilyButtons: "var(--font-heading)",
    fontSize: "0.9rem",
    fontWeight: { normal: 400, medium: 500, bold: 700 },

    
    borderRadius: "0.5rem",
    spacingUnit: "1rem",
  },
  elements: {
    //modal
    card: {
      backgroundColor: "#061410",
      border: "1px solid #0d2318",
      boxShadow: "0 0 40px #10b98115, 0 25px 50px #00000080",
    },

    headerTitle: {
      color: "#f1f5f9",
      fontFamily: "var(--font-heading)",
      fontWeight: "700",
      letterSpacing: "0.02em",
    },
    headerSubtitle: {
      color: "#64748b",
    },

    // entradas
    formFieldInput: {
      backgroundColor: "#020c08",
      border: "1px solid #0d2318",
      color: "#f1f5f9",
      "&:focus": {
        borderColor: "#10b981",
        boxShadow: "0 0 0 2px #10b98130",
      },
    },
    formFieldLabel: {
      color: "#94a3b8",
      fontSize: "0.8rem",
    },

    formButtonPrimary: {
      backgroundColor: "#10b981",
      color: "#020c08",
      fontFamily: "var(--font-heading)",
      fontWeight: "700",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      fontSize: "0.85rem",
      "&:hover": {
        backgroundColor: "#34d399",
      },
    },

   
    footerActionLink: {
      color: "#10b981",
      "&:hover": { color: "#34d399" },
    },
    identityPreviewEditButton: {
      color: "#10b981",
    },

    // linea que divide
    dividerLine: { backgroundColor: "#0d2318" },
    dividerText: { color: "#475569" },

    // Botones
    socialButtonsBlockButton: {
      backgroundColor: "#0d2318",
      border: "1px solid #1e3a2f",
      color: "#cbd5e1",
      "&:hover": {
        backgroundColor: "#10b98110",
        borderColor: "#10b98140",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#cbd5e1",
    },

    
    navbarButton: {
      color: "#64748b",
      "&[data-active]": { color: "#10b981" },
    },

    
    userButtonAvatarBox: {
      width: "2rem",
      height: "2rem",
    },
    userButtonPopoverCard: {
      backgroundColor: "#061410",
      border: "1px solid #0d2318",
      boxShadow: "0 0 30px #10b98115, 0 20px 40px #00000080",
    },
    userButtonPopoverActionButton: {
      color: "#94a3b8",
      "&:hover": {
        backgroundColor: "#10b98110",
        color: "#10b981",
      },
    },
    userButtonPopoverActionButtonText: {
      color: "inherit",
    },
    userButtonPopoverFooter: {
      display: "none", 
    },

    
    badge: {
      backgroundColor: "#10b98120",
      color: "#10b981",
      border: "1px solid #10b98140",
    },

    
    modalBackdrop: {
      backgroundColor: "#00000090",
      backdropFilter: "blur(4px)",
    },
  },
};
