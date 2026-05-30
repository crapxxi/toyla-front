import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 text-muted-foreground">
        {icon ?? (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#F3F4F6" />
            <rect x="24" y="28" width="32" height="24" rx="3" fill="#E5E7EB" />
            <rect x="28" y="32" width="24" height="3" rx="1.5" fill="#9CA3AF" />
            <rect x="28" y="38" width="16" height="3" rx="1.5" fill="#D1D5DB" />
            <rect x="28" y="44" width="20" height="3" rx="1.5" fill="#D1D5DB" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="bg-[#A8492A] hover:bg-[#8A3A20] text-white">
          {action.label}
        </Button>
      )}
    </div>
  )
}
