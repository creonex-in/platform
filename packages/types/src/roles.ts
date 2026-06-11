export type UserRole = 'learner' | 'creator' | 'admin'

export type RoleArray = UserRole[]

export function parseRoles(roleString: string): RoleArray {
  return roleString.split(',').filter(Boolean) as RoleArray
}

export function hasRole(roleString: string, role: UserRole): boolean {
  return parseRoles(roleString).includes(role)
}

export function hasAnyRole(roleString: string, roles: UserRole[]): boolean {
  const parsed = parseRoles(roleString)
  return roles.some((r) => parsed.includes(r))
}
