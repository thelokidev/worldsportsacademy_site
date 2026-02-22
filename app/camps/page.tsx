import { CampsClient } from "./camps-client"
import { Footer } from "@/components/footer"

export const metadata = {
  title: 'Camps | World Sports Academy',
  description: 'PA Day camps and holiday programs coming soon to World Sports Academy.',
}

export default function CampsPage() {
  return (
    <>
      <CampsClient />
      <div className="bg-black pt-20">
        <Footer />
      </div>
    </>
  )
}
