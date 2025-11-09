export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center pt-24 pb-8">
        {children}
      </div>
    </div>
  )
}