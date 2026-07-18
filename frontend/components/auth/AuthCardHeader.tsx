import Link from 'next/link'

interface AuthCardHeaderProps {
  title: string
  description?: string
  linkHref?: string
  linkText?: string
}

export default function AuthCardHeader({ title, description, linkHref, linkText }: AuthCardHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <Link href="/" className="text-xl sm:text-2xl font-bold text-primary mb-2 inline-block">
        Medify
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-2">{title}</h1>
      {(description || linkHref) && (
        <p className="text-sm sm:text-base text-neutral-gray">
          {description && <span>{description} </span>}
          {linkHref && linkText && (
            <Link href={linkHref} className="text-primary hover:underline">
              {linkText}
            </Link>
          )}
        </p>
      )}
    </div>
  )
}
