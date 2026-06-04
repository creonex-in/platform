# How to use Auth Gaurds for the controllers

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { GetAuth } from '../auth/get-auth.decorator';

// Any logged in user (learner or creator)
@Get('profile')
@UseGuards(ClerkAuthGuard)
getProfile(@GetAuth() auth) {
  console.log(auth.roles) // ["learner"] or ["learner", "creator"]
}

// Creator only route
@Get('dashboard/creator')
@UseGuards(ClerkAuthGuard)
@Roles('creator')
getCreatorDashboard(@GetAuth() auth) {
  // Only creators reach here
  // Learner-only accounts get 401
}

// Learner only route
@Get('dashboard/learner')
@UseGuards(ClerkAuthGuard)
@Roles('learner')
getLearnerDashboard(@GetAuth() auth) {
  // Only learners reach here
}
```
