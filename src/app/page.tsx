import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import RevealSection from "@/components/sections/RevealSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import ControlsSection from "@/components/sections/ControlsSection";
import DownloadSection from "@/components/sections/DownloadSection";
import PageScrollEngine from "@/components/interactive/PageScrollEngine";

export default function Home() {
  return (
    <PageScrollEngine>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <RevealSection />
        <FeaturesSection />
        <ControlsSection />
        <DownloadSection />
      </main>
      <Footer />
    </PageScrollEngine>
  );
}
