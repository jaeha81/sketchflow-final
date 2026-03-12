import { cn } from '@/lib/utils/cn'

const variants: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
}

export function Badge({ children, variant = 'default', size = 'sm' }: {
  children: React.ReactNode; variant?: string; size?: 'sm' | 'md'
}) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium',
      variants[variant] || variants.default,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
    )}>{children}</span>
  )
}
