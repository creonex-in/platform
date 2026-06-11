export type UserRole = 'learner' | 'creator' | 'admin';
export type RoleArray = UserRole[];
export declare function parseRoles(roleString: string): RoleArray;
export declare function hasRole(roleString: string, role: UserRole): boolean;
export declare function hasAnyRole(roleString: string, roles: UserRole[]): boolean;
//# sourceMappingURL=roles.d.ts.map