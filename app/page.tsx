import { Hero } from "@/components/hero"
import { SportsSection } from "@/components/sports-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FacilitiesSection } from "@/components/facilities-section"
import { LocationsSection } from "@/components/locations-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 pt-20 overflow-x-hidden">
      <Hero />
      <SportsSection />
      <TestimonialsSection />
      <FacilitiesSection />
      <LocationsSection />
      <Footer />
    </div>
  )
}
