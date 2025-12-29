import { describe, it, expect } from 'vitest';
import { calculatePoints, getBadgeInfo } from '@/lib/gamification';

describe('Gamification', () => {
  describe('calculatePoints', () => {
    it('should return correct points for NEW_POST', () => {
      expect(calculatePoints('NEW_POST')).toBe(10);
    });

    it('should return correct points for CLAIM_VERIFIED', () => {
      expect(calculatePoints('CLAIM_VERIFIED')).toBe(20);
    });

    it('should return correct points for COMMENT', () => {
      expect(calculatePoints('COMMENT')).toBe(2);
    });
  });

  describe('getBadgeInfo', () => {
    it('should return correct info for first_post badge', () => {
      const info = getBadgeInfo('first_post');
      expect(info.name).toBe('First Post');
      expect(info.emoji).toBe('🎉');
    });

    it('should return correct info for finder_level_1 badge', () => {
      const info = getBadgeInfo('finder_level_1');
      expect(info.name).toBe('Finder Level 1');
      expect(info.description).toContain('10 items');
    });

    it('should return correct info for campus_hero badge', () => {
      const info = getBadgeInfo('campus_hero');
      expect(info.name).toBe('Campus Hero');
    });
  });
});
