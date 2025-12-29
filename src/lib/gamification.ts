import { BadgeType } from '@/types/database';

export const POINTS = {
  NEW_POST: 10,
  CLAIM_VERIFIED: 20,
  COMMENT: 2,
  HELPFUL_COMMENT: 5
} as const;

export const BADGE_REQUIREMENTS: Record<
  BadgeType,
  { name: string; description: string; emoji: string }
> = {
  first_post: {
    name: 'First Post',
    description: 'Created your first post',
    emoji: '🎉'
  },
  finder_level_1: {
    name: 'Finder Level 1',
    description: 'Posted 10 items',
    emoji: '🔍'
  },
  finder_level_2: {
    name: 'Finder Level 2',
    description: 'Posted 25 items',
    emoji: '🔎'
  },
  finder_level_3: {
    name: 'Finder Level 3',
    description: 'Posted 50 items',
    emoji: '🏆'
  },
  campus_hero: {
    name: 'Campus Hero',
    description: 'Weekly top contributor',
    emoji: '⭐'
  },
  helpful_neighbor: {
    name: 'Helpful Neighbor',
    description: 'Helped 10 people claim items',
    emoji: '🤝'
  }
};

export function calculatePoints(action: keyof typeof POINTS): number {
  return POINTS[action];
}

export function getBadgeInfo(badgeType: BadgeType) {
  return BADGE_REQUIREMENTS[badgeType];
}
