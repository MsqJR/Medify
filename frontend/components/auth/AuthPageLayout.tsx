interface AuthPageLayoutProps {
  children: React.ReactNode
}

export default function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 sm:p-6 overflow-x-hidden w-full">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-full">
        {children}
      </div>
    </div>
  )
}
