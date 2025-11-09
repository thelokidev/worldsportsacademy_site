import { ProgramsHero } from "@/components/programs/programs-hero"
import { ProgramsGrid } from "@/components/programs/programs-grid"
import { ProgramBenefits } from "@/components/programs/program-benefits"
import { ProgramCTA } from "@/components/programs/program-cta"
import { Footer } from "@/components/footer"

export const metadata = {
  title: 'Programs | World Sports Academy',
  description: 'Explore our comprehensive training programs for squash, table tennis, chess, and high-performance fitness.',
}

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-white pt-16 overflow-x-hidden">
      <ProgramsHero />
      <ProgramsGrid />
      <ProgramBenefits />
      <ProgramCTA />
      <Footer />
    </div>
  )
}

