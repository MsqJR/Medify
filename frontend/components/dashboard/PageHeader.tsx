interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  icon?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
  variant?: 'plain' | 'gradient'
  children?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  description,
  icon,
  badge,
  actions,
  variant = 'plain',
  children,
  className = '',
}: PageHeaderProps) {
  const titleRow = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className={icon ? 'flex items-center gap-4' : ''}>
        {icon && <div className="p-3 bg-white shadow-sm rounded-2xl">{icon}</div>}
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-neutral-gray">{description}</p>
          )}
          {badge && <div className="mt-1">{badge}</div>}
        </div>
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )

  if (variant === 'gradient') {
    return (
      <section className={`overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary-light via-white to-neutral-light p-6 ${className}`}>
        {titleRow}
        {children && <div className="mt-4">{children}</div>}
      </section>
    )
  }

  return (
    <div className={className}>
      {titleRow}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}
