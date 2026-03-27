import { SignIn } from "@clerk/nextjs";
import { clerkTheme } from "@/lib/clerk-theme";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* fondo personalizado para que no se quede el loggin no quede con un estilo basico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#10b98112_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#00c89608_0%,_transparent_55%)]" />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        <SignIn appearance={clerkTheme} />
      </div>
    </div>
  );
}

