# Enhancement: Fine-grained RBAC via Better Auth Access Control plugin

**Status:** Proposed (not implemented) · **Date:** 2026-06-13
**Verified against:** `better-auth@1.6.16`

## Why this exists

Today roles are **coarse**: a user is `learner`, `creator`, or `admin` (stored
as a comma string, e.g. `"learner,creator"`). Authorization answers one question
— *"does the user have role X?"* — via `parseRoles()` + `RolesGuard`.

This doc describes adopting Better Auth's **Access Control (AC) plugin** so we
can answer *"can the user perform action Y?"* (e.g. `offer:delete`,
`testimonial:hide`) without scattering hardcoded role checks across controllers.

**Adopt only when** we need per-action permissions (moderators, partial creator
capabilities, sub-roles). For 3 coarse roles, the current `@Roles` + `parseRoles`
is correct — do **not** migrate prematurely.

## Scope clarification (important)

The AC plugin changes **how permissions are checked**, NOT **how roles are
stored**. The comma-string append in `apps/api/src/users/users.service.ts`
(`[...roles, 'creator'].join(',')`) **stays**. Killing the comma string is a
separate, larger change (a normalized `user_roles` table) that fights the admin
plugin — out of scope here. AC plugin = cleaner checks, same storage.

| Concern | Fixed by AC plugin? |
|---|---|
| "can creator delete offer?" (permissions) | ✅ yes |
| comma-string multi-role storage | ❌ no — stays |

## Current state (files)

- `packages/types/src/roles.ts` — `UserRole`, `parseRoles`, `hasRole`, `hasAnyRole`.
- `apps/api/src/app.module.ts` — `betterAuth({ ... plugins: [admin({ defaultRole, adminRoles })] })`.
- `apps/api/src/auth/roles.decorator.ts` — `@Roles(...roles)`.
- `apps/api/src/auth/roles.guard.ts` — reads `session.user.role`, `parseRoles`, `.some(includes)`.
- `apps/api/src/database/schema.ts:32` — `role: text('role').notNull().default('learner')`.
- Web: `apps/web/lib/auth-client.ts`, `apps/web/lib/auth-server-client.ts` (adminClient).

## Target design

### 1. Shared statement + roles — `packages/types/src/roles.ts`

Define permissions **once**, shared by api + web so both agree.

```ts
import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access"

// `as const` is required for type inference.
export const statement = {
  ...defaultStatements,              // keep built-in admin perms (user ban/list/etc.)
  offer:       ["create", "edit", "delete"],
  testimonial: ["hide"],
  payout:      ["approve"],
} as const

export const ac = createAccessControl(statement)

export const roles = {
  learner: ac.newRole({}),
  creator: ac.newRole({ offer: ["create", "edit"] }),
  admin:   ac.newRole({
    ...adminAc.statements,
    offer: ["create", "edit", "delete"],
    testimonial: ["hide"],
    payout: ["approve"],
  }),
}
```

### 2. Backend wiring — `apps/api/src/app.module.ts`

```ts
import { ac, roles } from "@creonex/types"
// ...
plugins: [
  admin({
    ac,
    roles,
    defaultRole: "learner",
    adminRoles: ["admin"],
  }),
],
```

### 3. Permission decorator — `apps/api/src/auth/roles.decorator.ts`

Add alongside the existing `@Roles` (keep `@Roles` for coarse gates):

```ts
export const PERMISSIONS_KEY = "permissions"
export const Permissions = (permissions: Record<string, string[]>) =>
  SetMetadata(PERMISSIONS_KEY, permissions)
```

### 4. Guard — `apps/api/src/auth/roles.guard.ts`

Add a permission branch using the better-auth server API. The `AuthService`
instance is already injected for auth elsewhere; reuse `instance.api`.

```ts
const permissions = this.reflector.getAllAndOverride<Record<string, string[]>>(
  PERMISSIONS_KEY, [ctx.getHandler(), ctx.getClass()],
)
if (permissions) {
  const { success } = await this.authService.instance.api.userHasPermission({
    body: { userId: session.user.id, permissions },
  })
  if (!success) throw new UnauthorizedException("Insufficient permission")
  return true
}
// fall through to existing @Roles coarse check
```

Note: guard becomes `async canActivate(): Promise<boolean>` (server permission
check is async). Inject `AuthService` into the guard constructor.

### 5. Controllers — opt-in per route

```ts
@Permissions({ offer: ["delete"] })
@Delete("offers/:id")
removeOffer(...) { ... }
```

Leave coarse routes on `@Roles('creator')`. Migrate incrementally.

### 6. Web client mirror — only if UI checks permissions

```ts
// apps/web/lib/auth-client.ts  &  auth-server-client.ts
import { ac, roles } from "@creonex/types"
adminClient({ ac, roles })
```

UI usage: `await authClient.admin.hasPermission({ permissions: { offer: ["delete"] } })`
to show/hide buttons. Server guard remains the real enforcement; client check is
UX only.

Optional: add `requirePermission(permissions)` to `apps/web/lib/auth-guards.ts`
mirroring backend for server-component gating.

## Compatibility notes

- **No DB migration.** Same `role` text column; AC just interprets it richer.
- **Multi-role comma strings keep working.** `userHasPermission` unions
  permissions across all of the user's roles. `addCreatorRole` append unchanged.
- **`defaultStatements` / `adminAc`** must be spread into the custom statement,
  or the admin plugin's built-in user-management permissions are lost.

## Verification checklist

1. `pnpm --filter @creonex/types build` then `pnpm --filter @creonex/api type-check`.
2. Start api (`apps/api` run skill, :3000). Confirm `Nest application
   successfully started` (admin plugin accepts `ac`/`roles`).
3. Hit a `@Permissions`-guarded route:
   - as a role **with** the perm → 200.
   - as a role **without** → 401 `Insufficient permission`.
4. Coarse `@Roles` routes still behave identically (regression check).
5. (If web mirror added) `authClient.admin.hasPermission(...)` returns expected
   booleans for creator vs learner sessions.

## Effort & risk

- ~1 shared file + guard rewrite + plugin config + per-route opt-in. Medium.
- Risk: guard async change touches every guarded route — regression-test all.
- Reversible: `@Roles` path stays, so migration is incremental, not big-bang.

## Decision

Deferred. Revisit when a real per-action requirement lands (e.g. moderators, or
creators with partial offer permissions). Until then, current coarse RBAC stands.
