interface DashboardPageWrapperProps {
  children: React.ReactNode
}

export default function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {children}
    </div>
  )
}
