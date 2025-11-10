export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-4 py-12">
        {children}
      </div>
    </div>
  )
}