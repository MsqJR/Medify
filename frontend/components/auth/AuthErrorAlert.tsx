import { FiAlertCircle } from 'react-icons/fi'

interface AuthErrorAlertProps {
  message: string
}

export default function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  return (
    <div className="bg-error/10 border border-error rounded-lg p-4 flex items-center gap-3">
      <FiAlertCircle className="text-error shrink-0" size={20} />
      <p className="text-error text-sm">{message}</p>
    </div>
  )
}
