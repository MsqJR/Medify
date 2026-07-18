interface AuthCardProps {
  children: React.ReactNode
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 flex flex-col justify-center">
      {children}
    </div>
  )
}
