import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import CurveEditorSection from "@/components/sections/CurveEditorSection";
import ScreenshotsSection from "@/components/sections/ScreenshotsSection";
import DownloadSection from "@/components/sections/DownloadSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <CurveEditorSection />
        <ScreenshotsSection />
        <DownloadSection />
      </main>
      <Footer />
    </>
  );
}
