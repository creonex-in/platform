import { DashboardTopbar } from '@/components/dashboard/shared/dashboard-topbar'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
  /** Topbar title. */
  title: string
  /** Static topbar action (link/button needing no data). Data-dependent actions
   *  belong inside the streamed content island, not here. */
  action?: React.ReactNode
  /** Optional topbar search affordance. */
  showSearch?: boolean
  /** Page content — typically a single <Suspense> island. */
  children: React.ReactNode
  /** Override/extend the content wrapper classes. Pass `noPadding` to opt out of
   *  the default padding (for pages whose content manages its own layout). */
  className?: string
  /** Drop the default `p-4 sm:p-6 space-y-6` wrapper — for self-contained forms. */
  noPadding?: boolean
}

/**
 * Standard chrome for every creator-dashboard page: an instant, never-suspended
 * topbar followed by a consistently padded content region. The topbar renders
 * synchronously so it never flickers while the content island streams behind a
 * <Suspense> boundary supplied by the page.
 */
export function DashboardShell({
  title,
  action,
  showSearch,
  children,
  className,
  noPadding = false,
}: DashboardShellProps): React.ReactElement {
  return (
    <>
      <DashboardTopbar title={title} action={action} showSearch={showSearch} />
      {noPadding ? (
        children
      ) : (
        <div className={cn('space-y-6 p-4 sm:p-6', className)}>{children}</div>
      )}
    </>
  )
}
