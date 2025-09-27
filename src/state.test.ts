/* global describe, it, expect */
import { legalToAdd20, legalToAdd10 } from './state/helpers';
import { Card } from './types';

// Legacy reducer tests removed after Redux migration. New tests should target the Redux slice in features/gameSlice.ts.

describe('TCG Game State Utilities', () => {
  it('should validate legalToAdd20 and legalToAdd10', () => {
    const card: Card = {
      name: 'Test',
      id: 1,
      cost: 1,
      type: 'unit',
      atk: 1,
      hp: 1,
      level: 1,
      keyword: '',
    };
    const deck: Card[] = [];
    expect(legalToAdd20(deck, card)).toBe(true);
    expect(legalToAdd10(deck, card)).toBe(true);
  });
});
