import { TrainingHero } from "@/components/training/training-hero"
import { TrainingTypes } from "@/components/training/training-types"
import { TrainingEnquiryCTA } from "@/components/training/training-enquiry-cta"
import { Footer } from "@/components/footer"

export const metadata = {
  title: 'Training Programs | World Sports Academy',
  description: 'Professional coaching for table tennis and squash. One-on-one, semi-private, group, and high-performance training programs.',
}

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-black pt-20 overflow-x-hidden">
      <TrainingHero />
      <TrainingTypes />
      <TrainingEnquiryCTA />
      <Footer />
    </div>
  )
}
