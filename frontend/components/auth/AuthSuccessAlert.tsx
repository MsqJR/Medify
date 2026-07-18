import { FiCheckCircle } from 'react-icons/fi'
import Link from 'next/link'

interface AuthSuccessAlertProps {
  message: string
  linkHref?: string
  linkText?: string
}

export default function AuthSuccessAlert({ message, linkHref, linkText }: AuthSuccessAlertProps) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/10 p-4">
      <div className="flex items-start gap-3">
        <FiCheckCircle className="mt-0.5 text-success shrink-0" size={20} />
        <div>
          <p className="text-sm text-neutral-dark">{message}</p>
          {linkHref && linkText && (
            <Link href={linkHref} className="mt-3 inline-block text-sm text-primary hover:underline">
              {linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
