import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { SportsSection } from "@/components/sports-section";
import { FacilitiesSection } from "@/components/facilities-section";
import { LocationsSection } from "@/components/locations-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <SportsSection />
      <FacilitiesSection />
      <LocationsSection />
      <Footer />
    </div>
  );
}
