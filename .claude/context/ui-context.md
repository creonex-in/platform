# UI Context

## Theme
Light + dark (class-based, `next-themes`, `defaultTheme="light"`, `enableSystem`).
Clean, premium SaaS aesthetic: soft neutral surfaces, a single blue accent,
generous rounding (~15px), subtle blur/shadow on floating elements. Colors are
defined as **oklch** CSS variables in `app/globals.css` and exposed to Tailwind
via `@theme inline`. Use the semantic Tailwind classes — never raw color values.

## Colors (semantic tokens — use the Tailwind class, not the value)

| Role            | Tailwind class            | Light (oklch)        | Dark (oklch)        |
| --------------- | ------------------------- | -------------------- | ------------------- |
| Page background | `bg-background`           | `0.985 0.002 250`    | `0.15 0 0`          |
| Foreground text | `text-foreground`         | `0.15 0 0`           | `0.985 0.002 250`   |
| Card surface    | `bg-card`                 | `1 0 0`              | `0.2 0 0`           |
| Primary accent  | `bg-primary` / `text-primary` | `0.55 0.18 255` (blue) | same           |
| Muted text      | `text-muted-foreground`   | `0.5 0.02 250`       | lighter neutral     |
| Border          | `border-border`           | `0.92 0.01 250`      | dark neutral        |
| Destructive     | `text-destructive`        | `0.6 0.2 25` (red)   | same                |
| Sidebar         | `bg-sidebar` (+ `-foreground`, `-accent`, `-border`) | white | `0.2 0 0` |

There is no separate success token — use `primary`/`destructive`; charts use `--chart-1..5`.

## Typography

| Role        | Font               | Variable / class            |
| ----------- | ------------------ | --------------------------- |
| UI / body   | Geist Sans         | `--font-sans` (default)     |
| Display / headings | Bricolage Grotesque | `--font-display` → `font-display` |
| Code / mono | Geist Mono         | `--font-mono` → `font-mono` |

## Border Radius
`--radius` = `0.9375rem`. Scale: `rounded-sm` (−4px), `rounded-md` (−2px),
`rounded-lg` (=radius), `rounded-xl` (+4px). Pills use `rounded-full`.

## Component Library
shadcn on Tailwind v4. Primitives in `components/ui/` — add via the shadcn CLI,
don't hand-write. Domain components elsewhere under `components/` (`dashboard/`,
`landing/`, `layout/`, `onboarding/`).

## Icons — Font Awesome ONLY
`@fortawesome/react-fontawesome` with `free-solid-svg-icons` (UI) and
`free-brands-svg-icons` (social). Pattern:
```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
<FontAwesomeIcon icon={faVideo} className="size-4" />
```
Sizing via Tailwind (`size-4` inline, `size-5`/`size-6` larger). **Never import
`lucide-react`** except inside vendored `components/ui/*` shadcn primitives.

## Layout Patterns
- **Dashboards** (creator + learner): `SidebarProvider` + `AppSidebar` + `SidebarInset`, `DashboardTopbar` per page.
- **Onboarding**: centered single-column card on `bg-muted/40` with logo header.
- **Marketing/public**: floating blurred navbar, full-bleed hero, section blocks, `Toaster` (sonner) bottom/top.
- **Errors**: `app/error.tsx` premium full-screen boundary with "Try again" + "Go Home".
