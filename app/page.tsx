import { Hero } from "@/components/hero"
import { CoachSection } from "@/components/coach-section"
import { SportsSection } from "@/components/sports-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FacilitiesSection } from "@/components/facilities-section"
import { LocationsSection } from "@/components/locations-section"
import { Footer } from "@/components/footer"
import { AudienceTabs } from "@/components/audience-tabs"
import { FAQSection } from "@/components/faq-section"

export default function Home() {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      <Hero />
      <CoachSection />
      <SportsSection />
      <AudienceTabs />
      <TestimonialsSection />
      <FacilitiesSection />
      <LocationsSection />
      <FAQSection />
      <Footer />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": "World Sports Academy",
            "description": "Premier sports academy for squash, table tennis, chess, and fitness training in Canada.",
            "image": "https://worldsportsacademy.com/logo.png",
            "telephone": "+1234567890",
            "url": "https://worldsportsacademy.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Sports Avenue",
              "addressLocality": "Toronto",
              "addressRegion": "ON",
              "postalCode": "M5V 2T6",
              "addressCountry": "CA"
            },
            "priceRange": "$$",
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "06:00",
              "closes": "22:00"
            }
          })
        }}
      />
    </div>
  )
}
