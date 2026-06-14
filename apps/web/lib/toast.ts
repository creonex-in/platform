import { toast as _toast } from '@/hooks/use-toast'

export const toast = {
  success: (title: string, description?: string) =>
    _toast({ title, description, variant: 'success' as const }),
  error: (title: string, description?: string) =>
    _toast({ title, description, variant: 'destructive' as const }),
  info: (title: string, description?: string) =>
    _toast({ title, description, variant: 'info' as const }),
  warning: (title: string, description?: string) =>
    _toast({ title, description, variant: 'warning' as const }),
  plain: (title: string, description?: string) =>
    _toast({ title, description }),
}
