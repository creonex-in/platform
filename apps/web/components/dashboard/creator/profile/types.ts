export interface ProfileSocials {
  instagram: string
  twitter: string
  linkedin: string
  youtube: string
  website: string
}

export interface ProfileData {
  username: string
  firstName: string
  lastName: string
  displayName: string
  headline: string
  intro: string
  bio: string
  initials: string
  tags: string[]
  socials: ProfileSocials
}

export type PreviewDevice = 'desktop' | 'mobile'
