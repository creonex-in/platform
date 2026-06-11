import type { NicheValue, GoalType, OfferType } from '@/types/api'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faGraduationCap, faCode, faIndianRupeeSign, faDumbbell,
  faPenNib, faLanguage, faBullhorn, faMusic, faLandmark,
  faBrain, faCamera, faFlask, faHouse, faPencil,
  faRobot, faGamepad, faUtensils, faBriefcase,
  faLeaf, faRocket, faStar, faArrowTrendUp,
  faLaptop, faSackDollar, faHeartPulse,
  faPhone, faUsers, faPeopleGroup, faFileArrowDown,
} from '@fortawesome/free-solid-svg-icons'

export interface NicheOption {
  value: NicheValue
  label: string
  icon: IconDefinition
}

export interface GoalOption {
  value: GoalType
  label: string
  icon: IconDefinition
  description: string
}

export interface OfferTypeOption {
  value: OfferType
  label: string
  icon: IconDefinition
  description: string
  recommended?: boolean
}

export const NICHE_OPTIONS: NicheOption[] = [
  { value: 'cat_mba_prep',      label: 'CAT / MBA Prep',      icon: faGraduationCap   },
  { value: 'coding_dsa',        label: 'Coding & DSA',        icon: faCode            },
  { value: 'personal_finance',  label: 'Personal Finance',    icon: faIndianRupeeSign },
  { value: 'fitness_nutrition', label: 'Fitness & Nutrition', icon: faDumbbell        },
  { value: 'design_creative',   label: 'Design & Creative',   icon: faPenNib          },
  { value: 'language_learning', label: 'Language Learning',   icon: faLanguage        },
  { value: 'digital_marketing', label: 'Digital Marketing',   icon: faBullhorn        },
  { value: 'music_arts',        label: 'Music & Arts',        icon: faMusic           },
  { value: 'upsc_govt_exams',   label: 'UPSC & Govt Exams',   icon: faLandmark        },
  { value: 'mental_wellness',   label: 'Mental Wellness',     icon: faBrain           },
  { value: 'photography',       label: 'Photography',         icon: faCamera          },
  { value: 'science_research',  label: 'Science & Research',  icon: faFlask           },
  { value: 'real_estate',       label: 'Real Estate',         icon: faHouse           },
  { value: 'writing_content',   label: 'Writing & Content',   icon: faPencil          },
  { value: 'ai_data_science',   label: 'AI & Data Science',   icon: faRobot           },
  { value: 'gaming_esports',    label: 'Gaming & Esports',    icon: faGamepad         },
  { value: 'cooking_food',      label: 'Cooking & Food',      icon: faUtensils        },
  { value: 'interview_prep',    label: 'Interview Prep',      icon: faBriefcase       },
  { value: 'ayurveda_yoga',     label: 'Ayurveda & Yoga',     icon: faLeaf            },
  { value: 'startup_product',   label: 'Startup & Product',   icon: faRocket          },
]

export const GOAL_OPTIONS: GoalOption[] = [
  { value: 'cat_prep',      label: 'Clear CAT / MBA',     icon: faGraduationCap, description: 'Crack CAT, XAT, GMAT or other MBA exams'    },
  { value: 'job_switch',    label: 'Switch careers',       icon: faBriefcase,     description: 'Land your first job or switch to a new field' },
  { value: 'skill_upgrade', label: 'Upgrade my skills',    icon: faArrowTrendUp,  description: 'Level up in your current domain'              },
  { value: 'freelancing',   label: 'Start freelancing',    icon: faLaptop,        description: 'Build skills to work independently'           },
  { value: 'investing',     label: 'Learn investing',      icon: faSackDollar,    description: 'Finance, mutual funds, wealth building'        },
  { value: 'fitness',       label: 'Get fit & healthy',    icon: faHeartPulse,    description: 'Improve fitness, nutrition, mental health'     },
  { value: 'other',         label: 'Something else',       icon: faStar,          description: 'I have a different goal in mind'              },
]

export const OFFER_TYPE_OPTIONS: OfferTypeOption[] = [
  { value: 'one_on_one', label: '1:1 Call',        icon: faPhone,         description: 'Personal one-on-one session', recommended: true },
  { value: 'workshop',   label: 'Workshop',         icon: faUsers,         description: 'Live group session for multiple learners'        },
  { value: 'group',      label: 'Group Session',    icon: faPeopleGroup,   description: 'Small group interactive session (max 20)'        },
  { value: 'digital',    label: 'Digital Product',  icon: faFileArrowDown, description: 'PDF, template, or recorded resource'             },
]

export const DURATION_OPTIONS = [
  { value: 30,  label: '30 min' },
  { value: 45,  label: '45 min' },
  { value: 60,  label: '1 hour' },
  { value: 90,  label: '90 min' },
] as const

export const NICHE_TAG_SUGGESTIONS: Record<NicheValue, string[]> = {
  cat_mba_prep:      ['Quant', 'VARC', 'DILR', 'Mock Analysis'],
  coding_dsa:        ['LeetCode', 'DSA', 'System Design', 'FAANG Prep'],
  personal_finance:  ['SIP', 'Mutual Funds', 'Tax Saving', 'Options'],
  fitness_nutrition: ['Fat Loss', 'Strength Training', 'Nutrition', 'HIIT'],
  design_creative:   ['Figma', 'UX Research', 'Portfolio Review', 'Branding'],
  language_learning: ['Spoken English', 'IELTS', 'Communication', 'Grammar'],
  digital_marketing: ['SEO', 'Meta Ads', 'Content Strategy', 'Growth'],
  music_arts:        ['Guitar', 'Vocals', 'Music Theory', 'Production'],
  upsc_govt_exams:   ['Prelims', 'Mains', 'Current Affairs', 'Essay'],
  mental_wellness:   ['Anxiety', 'Mindfulness', 'CBT', 'Breathwork'],
  photography:       ['Lightroom', 'Composition', 'Portrait', 'Reels'],
  science_research:  ['Research Methods', 'Statistics', 'Lab Skills', 'Papers'],
  real_estate:       ['Investment', 'Valuation', 'Legal', 'Rental'],
  writing_content:   ['Copywriting', 'SEO Writing', 'Storytelling', 'Editing'],
  ai_data_science:   ['Python', 'ML', 'LLMs', 'Data Analysis'],
  gaming_esports:    ['Strategy', 'Mechanics', 'Streaming', 'Coaching'],
  cooking_food:      ['Baking', 'Meal Prep', 'Regional Cuisine', 'Nutrition'],
  interview_prep:    ['HR Round', 'Case Studies', 'Resume', 'Mock Interviews'],
  ayurveda_yoga:     ['Hatha Yoga', 'Pranayama', 'Ayurvedic Diet', 'Meditation'],
  startup_product:   ['Product Thinking', 'GTM', 'Fundraising', 'Roadmaps'],
}

export const PLATFORM_FEE_PERCENT = 10
export const MIN_PRICE = 99
export const BIO_MAX_LENGTH = 150
export const TITLE_MAX_LENGTH = 60
export const TAGS_MAX = 5
export const NICHES_MAX = 3
