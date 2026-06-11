# UI Context — Creonex Component Patterns

Component patterns, utility class usage, and Tailwind conventions.
Token values → `style-guide.md`. Icon imports → `code-standards.md`.

---

## Using Design Tokens in Tailwind

```tsx
<div className="bg-[var(--brand)]">
<span className="text-[var(--brand)]">
<div className="border-[var(--brand)]">
<div className="bg-[var(--surface)]">
```

---

## Section Structure

Every page section must follow this wrapper:

```tsx
<section className="section">               {/* white bg */}
<section className="section section-surface"> {/* gray bg */}
  <div className="container-inner">
    {/* content */}
  </div>
</section>
```

### Section Header

```tsx
<div className="section-header">
  <span className="section-badge">Label</span>
  <h2>Section Heading</h2>
  <p className="body-lg max-w-xl">Supporting sentence.</p>
</div>
```

---

## Buttons

```tsx
<button className="btn-primary">Get Started Free</button>
<button className="btn-outline">Browse Courses</button>
```

---

## Feature Cards

Icon import pattern → `code-standards.md`.

```tsx
<div className="card-feature-hover">
  <div className="icon-pad-indigo mb-6">  {/* or: icon-pad-orange / green / purple */}
    <FontAwesomeIcon icon={faPenNib} className="size-8 text-[var(--brand)]" />
  </div>
  <h3 className="mb-3">Card Title</h3>
  <p className="body-lg">Description.</p>
</div>
```

---

## Step Circle

```tsx
<div className="bg-brand-gradient rounded-full size-20 flex items-center justify-center
                shadow-[0_8px_16px_oklch(0.516_0.160_249.5/0.2)]">
  <span className="font-display font-extrabold text-[28px] text-white">1</span>
</div>
```

---

## Brand Utility Classes

| Class | Effect |
|-------|--------|
| `.bg-brand-gradient` | Solid `var(--brand)` background (no gradient) |
| `.text-brand-gradient` | `var(--brand)` text color |
| `.hero-glow` | `var(--brand-faint)` background tint for hero |
| `.section-badge` | Small pill label above section headings |

---

## Page Sections Inventory

| Component | File | Background |
|-----------|------|-----------|
| HeroSection | `components/sections/HeroSection.tsx` | bg-background |
| StatsSection | `components/sections/StatsSection.tsx` | bg-surface |
| CategoriesSection | `components/sections/CategoriesSection.tsx` | bg-surface |
| CoursesSection | `components/sections/CoursesSection.tsx` | bg-background |
| ExpertsSection | `components/sections/ExpertsSection.tsx` | bg-background |
| WhyCreonexSection | `components/sections/WhyCreonexSection.tsx` | bg-surface |
| HowItWorksSection | `components/sections/HowItWorksSection.tsx` | bg-surface |
| TestimonialsSection | `components/sections/TestimonialsSection.tsx` | bg-surface |
| FAQSection | `components/sections/FAQSection.tsx` | bg-background |
| CTASection | `components/sections/CTASection.tsx` | bg-background |

---

## shadcn Components Base UI

Located in `components/ui/` — never edit generated files directly. Add with `npx shadcn add <name>`.

Installed: Accordion, Avatar, Badge, Button, Card, Input, ScrollArea, Separator, Sheet, Tabs

Custom wrappers go in `components/shared/` — not in `components/ui/`.
