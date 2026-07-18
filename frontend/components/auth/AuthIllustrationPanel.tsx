interface AuthIllustrationPanelProps {
  icon: React.ReactNode
  title: string
  description: string
}

export default function AuthIllustrationPanel({ icon, title, description }: AuthIllustrationPanelProps) {
  return (
    <div className="bg-primary-light rounded-lg p-12 flex items-center justify-center hidden md:flex">
      <div className="text-center">
        <div className="w-64 h-64 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-neutral-dark mb-4">{title}</h2>
        <p className="text-neutral-gray">{description}</p>
      </div>
    </div>
  )
}
