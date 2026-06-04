// auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ('learner' | 'creator')[]) =>
    SetMetadata(ROLES_KEY, roles);