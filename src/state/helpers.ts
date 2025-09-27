/* global localStorage */

import { Card, State, Player } from '../types';
import { BASE_CARDS, EXTRA_POOL_TEMPLATE, UNLOCKS_KEY } from '../constants';
import { makeId, shuffle } from '../utils';

function loadUnlocks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKS_KEY) || '[]');
  } catch {
    return [];
  }
}
export function saveUnlocks(arr: string[]) {
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(arr));
}

export const initialState: State = {
  tab: 'mainMenu',
  hero: { 1: null, 2: null },
  power: { 1: null, 2: null },
  dbCurrent: 1,
  deckBuilder: { 1: [], 2: [] },
  players: {
    1: { deck: [], hand: [], field: [], life: 15, extra: [], grave: [] },
    2: { deck: [], hand: [], field: [], life: 15, extra: [], grave: [] },
  },
  active: 1,
  turnCount: { 1: 1, 2: 0 },
  mana: { 1: 1, 2: 0 },
  attacked: {},
  attackCount: { 1: 0, 2: 0 },
  powerUsed: { 1: false, 2: false },
  pendingTarget: null,
  showLog: false,
  log: [],
  vsAI: false,
  campaign: {
    active: false,
    stage: 0,
    rewardsLeft: 0,
    rewardOptions: [],
    unlocks: loadUnlocks(),
  },
  // Use arrays instead of Set for Immer compatibility
  mullSel: { 1: [], 2: [] },
  imageMap: JSON.parse(localStorage.getItem('cardImages') || '{}'),
};

export function startMulliganFromDeck(
  state: State,
  deck1: Card[],
  deck2: Card[],
  isCampaign: boolean,
): State {
  const p1 = buildPlayerFromDeck(deck1);
  const p2 = buildPlayerFromDeck(deck2);
  return {
    ...state,
    players: { 1: p1, 2: p2 },
    active: 1,
    turnCount: { 1: 1, 2: 0 },
    mana: { 1: 1, 2: 0 },
    attacked: {},
    attackCount: { 1: 0, 2: 0 },
    powerUsed: { 1: false, 2: false },
    tab: 'mulligan',
    log: ['— Mulligan — Select cards to replace (each player) —'],
    vsAI: isCampaign ? true : state.vsAI,
    // Always reset mullSel to arrays for both players
    mullSel: { 1: [], 2: [] },
  };
}

export function endGame(state: State, winner: number, isCampaign: boolean): State {
  if (isCampaign) {
    if (winner === 1)
      return {
        ...state,
        tab: 'campaignReward',
        campaign: {
          ...state.campaign,
          rewardsLeft: 3,
          rewardOptions: randomRewardOptions(),
        },
        log: ['🏆 You win! Choose rewards.'],
      };
    return {
      ...initialState,
      tab: 'campaignHero',
      campaign: {
        active: true,
        stage: 0,
        rewardsLeft: 0,
        rewardOptions: [],
        unlocks: loadUnlocks(),
      },
    };
  }
  return {
    ...initialState,
    tab: 'mainMenu',
    campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
  };
}

export function legalToAdd20(deck: Card[], card: Card): boolean {
  const copies = deck.filter((c) => c.name === card.name).length;
  if (copies >= 2) return false;
  const l12 = deck.filter((c) => c.level <= 2).length;
  const l3 = deck.filter((c) => c.level === 3).length;
  const l4 = deck.filter((c) => c.level === 4).length;
  const l5 = deck.filter((c) => c.level === 5).length;
  if (card.level <= 2 && l12 >= 10) return false;
  if (card.level === 3 && l3 >= 6) return false;
  if (card.level === 4 && l4 >= 4) return false;
  if (card.level === 5 && l5 >= 1) return false;
  return true;
}
export function legalToAdd10(deck: Card[], card: Card): boolean {
  const copies = deck.filter((c) => c.name === card.name).length;
  if (copies >= 2) return false;
  if (card.level === 5 && deck.some((c) => c.level === 5)) return false;
  return deck.length < 10;
}

export function buildPlayerFromDeck(deck: Card[]): Player {
  const all = shuffle(deck.map((c) => ({ ...c, id: makeId() })));
  return {
    deck: all.slice(3),
    hand: all.slice(0, 3),
    field: [],
    life: 15,
    extra: EXTRA_POOL_TEMPLATE.map((c) => ({ ...c, id: makeId() })),
    grave: [],
  };
}

export function buildLegalDeckFromPool(pool: Card[], size = 20): Card[] {
  const picks: Card[] = [];
  let guard = 0;
  while (picks.length < size && guard < 5000) {
    const base = pool[Math.floor(Math.random() * pool.length)];
    if (legalToAdd20(picks, base)) picks.push({ ...base, id: makeId() });
    guard++;
  }
  // Broaden if needed
  guard = 0;
  while (picks.length < size && guard < 5000) {
    const base = BASE_CARDS[Math.floor(Math.random() * BASE_CARDS.length)];
    if (legalToAdd20(picks, base)) picks.push({ ...base, id: makeId() });
    guard++;
  }
  // L1 filler
  if (picks.length < size) {
    const fillers = BASE_CARDS.filter((c) => c.level === 1);
    for (const f of fillers) {
      while (picks.length < size && picks.filter((x) => x.name === f.name).length < 2) {
        picks.push({ ...f, id: makeId() });
      }
      if (picks.length >= size) break;
    }
  }
  return picks;
}

export function randomHeroPower(): string {
  return ['Lib', 'Goer', 'Aura'][Math.floor(Math.random() * 3)];
}

export function randomRewardOptions(): Card[] {
  const seen = new Set<string>();
  const out: Card[] = [];
  while (out.length < 3) {
    const b = BASE_CARDS[Math.floor(Math.random() * BASE_CARDS.length)];
    if (!seen.has(b.name)) {
      seen.add(b.name);
      out.push({ ...b, id: makeId() });
    }
  }
  return out;
}

// campaignDraftPool and makeFixedAIDeck moved to campaign.ts
