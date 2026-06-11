import type { UserRole } from './roles';
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}
export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    roles: UserRole[];
    onboardingComplete: boolean;
    image?: string | null;
}
export interface SessionResponse {
    user: AuthUser;
    session: {
        id: string;
        expiresAt: string;
    };
}
export interface CreatorProfileResponse {
    id: string;
    userId: string;
    username: string | null;
    displayName: string | null;
    bio: string | null;
    profilePhotoUrl: string | null;
    primaryNiche: string | null;
    experienceYears: number | null;
    qualityScore: string;
    qualityTier: string;
    isLive: boolean;
    isVerified: boolean;
    kycStatus: string;
    onboardingStatus: string;
    currentStep: number;
}
export interface LearnerProfileResponse {
    id: string;
    userId: string;
    goalType: string | null;
    interestedNiches: string[];
    onboardingStatus: string;
    currentStep: number;
}
//# sourceMappingURL=api.d.ts.map