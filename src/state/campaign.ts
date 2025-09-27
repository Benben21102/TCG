import { Card } from '../types';
import { BASE_CARDS } from '../constants';
import { buildLegalDeckFromPool } from './helpers';

export function campaignDraftPool(unlocks: string[]): Card[] {
  const unlockedSet = new Set(unlocks);
  return BASE_CARDS.filter((c) => c.level <= 2 || unlockedSet.has(c.name));
}

export function makeFixedAIDeck(stage: number): Card[] {
  let pool: Card[];
  if (stage === 1) {
    pool = BASE_CARDS.filter((c) =>
      [
        '10 of Lib',
        'Beach Goer',
        'Beach Goer 3',
        'Guardbook',
        'Queens Knight',
        'Jack Knight',
        'Insight',
        'Zap!',
      ].includes(c.name),
    );
  } else if (stage === 2) {
    pool = BASE_CARDS.filter((c) =>
      [
        'Purple Rain',
        'Book Rust',
        'Mango Warrior',
        'Tequila Sunrise',
        'Mad Hatter',
        'Blue Lagoon',
        'Zap!',
        'Stackways',
      ].includes(c.name),
    );
  } else {
    pool = BASE_CARDS.filter((c) =>
      [
        'Dante',
        'Pineapple Man',
        'Beach Brawlers',
        'Grave Recall',
        'Beatrice',
        'Electra',
        'Edgar',
        'Zap!',
        'Insight',
      ].includes(c.name),
    );
  }
  if (!pool.length) pool = BASE_CARDS;
  return buildLegalDeckFromPool(pool, 20);
}
