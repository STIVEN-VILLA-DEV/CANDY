import Navbar from "@/components/navbar";
import HeroSection from "@/components/landing/hero-section";
import BentoGrid from "@/components/landing/bento-grid";
import Footer from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BentoGrid />
      </main>
      <Footer />
    </>
  );
}
