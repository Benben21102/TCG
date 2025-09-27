/* global localStorage */
export function startMulliganFromDecks(
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

import { Card, State, Action, Player } from './types';
import { BASE_CARDS, EXTRA_POOL_TEMPLATE, UNLOCKS_KEY } from './constants';
import { makeId, shuffle } from './utils';

function loadUnlocks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKS_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveUnlocks(arr: string[]) {
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
  mullSel: { 1: new Set(), 2: new Set() },
  imageMap: JSON.parse(localStorage.getItem('cardImages') || '{}'),
};

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

export function campaignDraftPool(unlocks: string[]): Card[] {
  const unlockedSet = new Set(unlocks);
  return BASE_CARDS.filter((c) => c.level <= 2 || unlockedSet.has(c.name));
}

// --- REDUCER LOGIC ---
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'MAIN_MENU':
      return {
        ...initialState,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };
    case 'SET_TAB':
      return { ...state, tab: action.tab };
    case 'FREEPLAY_HUMAN':
      return {
        ...initialState,
        tab: 'heroSelect',
        vsAI: false,
        dbCurrent: 1,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };
    case 'FREEPLAY_AI':
      return {
        ...initialState,
        tab: 'heroSelect',
        vsAI: true,
        dbCurrent: 1,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };
    case 'CAMPAIGN_START':
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
    case 'SELECT_HERO': {
      const p = state.dbCurrent;
      if (!state.hero[p]) return { ...state, hero: { ...state.hero, [p]: action.hero } };
      const pw = { ...state.power, [p]: action.power };
      if (state.tab === 'campaignHero') {
        return {
          ...state,
          power: pw,
          tab: 'campaignDraft',
          deckBuilder: { ...state.deckBuilder, 1: [] },
          dbCurrent: 1,
        };
      }
      if (state.vsAI && p === 1) {
        const aiHero = Math.random() < 0.5 ? 'Library' : 'Beach';
        const aiPower = randomHeroPower();
        return {
          ...state,
          power: { ...pw, 2: aiPower },
          hero: { ...state.hero, 2: aiHero },
          tab: 'deckBuilder',
          dbCurrent: 1,
        };
      }
      if (p === 1) return { ...state, power: pw, dbCurrent: 2 };
      return { ...state, power: pw, tab: 'deckBuilder', dbCurrent: 1 };
    }
    case 'ADD_TO_DECK': {
      const p = state.dbCurrent,
        picks = state.deckBuilder[p],
        c = action.card;
      const legal = state.tab === 'campaignDraft' ? legalToAdd10 : legalToAdd20;
      if (!legal(picks, c)) return state;
      return {
        ...state,
        deckBuilder: { ...state.deckBuilder, [p]: [...picks, c] },
      };
    }
    case 'REMOVE_FROM_DECK': {
      const p = state.dbCurrent,
        picks = [...state.deckBuilder[p]];
      const idx = picks.findIndex((x) => x.id === action.card.id);
      if (idx < 0) return state;
      picks.splice(idx, 1);
      return { ...state, deckBuilder: { ...state.deckBuilder, [p]: picks } };
    }
    case 'NEXT_DRAFT': {
      const need = state.tab === 'campaignDraft' ? 10 : 20;
      const p = state.dbCurrent;
      if (state.deckBuilder[p].length !== need) return state;
      if (state.tab === 'campaignDraft') {
        return reducer({ ...state }, { type: 'CAMPAIGN_BUILD_NEXT' });
      }
      if (state.vsAI) {
        if (p === 1) {
          const aiDeck = buildLegalDeckFromPool(BASE_CARDS, 20);
          return {
            ...state,
            deckBuilder: { 1: state.deckBuilder[1], 2: aiDeck },
            dbCurrent: 2,
          };
        } else {
          return startMulliganFromDecks(state, state.deckBuilder[1], state.deckBuilder[2], false);
        }
      } else {
        if (p === 1) return { ...state, dbCurrent: 2 };
        return startMulliganFromDecks(state, state.deckBuilder[1], state.deckBuilder[2], false);
      }
    }
    case 'CAMPAIGN_BUILD_NEXT': {
      const nextStage = state.campaign.stage + 1;
      const aiDeck = makeFixedAIDeck(nextStage);
      const heroPowersByStage = { 1: 'Lib', 2: 'Goer', 3: 'Aura' };
      const aiPower = (heroPowersByStage as Record<number, string>)[nextStage] || 'Lib';
      const s = {
        ...state,
        campaign: { ...state.campaign, stage: nextStage },
        hero: { ...state.hero, 2: Math.random() < 0.5 ? 'Library' : 'Beach' },
        power: { ...state.power, 2: aiPower },
      };
      return startMulliganFromDecks(s, state.deckBuilder[1], aiDeck, true);
    }
    case 'MULL_TOGGLE': {
      const p = action.p;
      const ids = new Set(state.mullSel[p]);
      if (ids.has(action.id)) ids.delete(action.id);
      else ids.add(action.id);
      return { ...state, mullSel: { ...state.mullSel, [p]: ids } };
    }
    case 'MULL_CONFIRM': {
      const p = action.p;
      const ids = new Set(state.mullSel[p]);
      const pl = state.players[p];
      const keep = pl.hand.filter((c) => c.id !== undefined && !ids.has(c.id));
      const toss = pl.hand.filter((c) => c.id !== undefined && ids.has(c.id));
      const reshuffled = shuffle([...pl.deck, ...toss]);
      const draw = reshuffled.slice(0, toss.length);
      const rest = reshuffled.slice(toss.length);
      const players = {
        ...state.players,
        [p]: { ...pl, deck: rest, hand: [...keep, ...draw] },
      };
      if (p === 1)
        return {
          ...state,
          players,
          mullSel: { ...state.mullSel, 1: new Set() },
          active: 2,
        };
      return {
        ...state,
        tab: 'game',
        players,
        mullSel: { ...state.mullSel, 2: new Set() },
        active: 1,
        log: ['— Game Start —'],
      };
    }
    case 'DRAW': {
      const p = state.active,
        pl = state.players[p];
      if (!pl.deck.length) return endGame(state, 3 - p, state.campaign.active);
      const [top, ...rest] = pl.deck;
      return {
        ...state,
        players: {
          ...state.players,
          [p]: { ...pl, deck: rest, hand: [...pl.hand, top] },
        },
      };
    }
    case 'PLAY_CARD': {
      const p = state.active,
        pl = state.players[p],
        card = action.card;
      if (card.cost > state.mana[p]) return state;
      const newMana = { ...state.mana, [p]: state.mana[p] - card.cost };
      const newHand = pl.hand.filter((c) => c.id !== card.id);
      const op = state.players[3 - p];
      if (card.effect === 'damage2') {
        return {
          ...state,
          mana: newMana,
          players: { ...state.players, [p]: { ...pl, hand: newHand } },
          pendingTarget: { by: p, card },
          log: [`✨ P${p} casts ${card.name}`, ...state.log].slice(0, 20),
        };
      }
      if (card.effect === 'draw2') {
        const draw = pl.deck.slice(0, 2);
        return {
          ...state,
          mana: newMana,
          players: {
            ...state.players,
            [p]: {
              ...pl,
              deck: pl.deck.slice(2),
              hand: [...newHand, ...draw],
              grave: [...pl.grave, card],
            },
          },
          log: [`📚 P${p} draws 2`, ...state.log].slice(0, 20),
        };
      }
      if (card.effect === 'summon2') {
        let extra = pl.extra.length
          ? [...pl.extra]
          : EXTRA_POOL_TEMPLATE.map((c) => ({ ...c, id: makeId() }));
        const two = extra.splice(0, 2);
        return {
          ...state,
          mana: newMana,
          players: {
            ...state.players,
            [p]: {
              ...pl,
              hand: newHand,
              field: [...pl.field, ...two],
              extra,
              grave: [...pl.grave, card],
            },
          },
          log: [`🌀 P${p} summons 2 from extra`, ...state.log].slice(0, 20),
        };
      }
      if (card.effect === 'summonTop2Grave') {
        const revived = pl.grave.slice(-2).map((x) => ({ ...x, id: makeId() }));
        const remaining = pl.grave.slice(0, -2);
        return {
          ...state,
          mana: newMana,
          players: {
            ...state.players,
            [p]: {
              ...pl,
              hand: newHand,
              field: [...pl.field, ...revived],
              grave: [...remaining, card],
            },
          },
          log: [`💀 P${p} revives 2`, ...state.log].slice(0, 20),
        };
      }
      if (card.effect === 'banana' && card.type === 'unit') {
        const summoned = { ...card, id: makeId() };
        let newOpp = [...op.field];
        if (newOpp.length) {
          const idx = Math.floor(Math.random() * newOpp.length);
          if (newOpp[idx] && typeof newOpp[idx].hp === 'number') {
            newOpp[idx] = { ...newOpp[idx], hp: (newOpp[idx].hp as number) - 1 };
          }
          newOpp = newOpp.filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
        }
        return {
          ...state,
          mana: newMana,
          players: {
            ...state.players,
            [p]: {
              ...pl,
              hand: newHand,
              field: [...pl.field, summoned],
              grave: [...pl.grave, card],
            },
            [3 - p]: { ...op, field: newOpp },
          },
          log: [`🍌 P${p} plays ${card.name}`, ...state.log].slice(0, 20),
        };
      }
      if (card.type === 'unit') {
        return {
          ...state,
          mana: newMana,
          players: {
            ...state.players,
            [p]: {
              ...pl,
              hand: newHand,
              field: [...pl.field, { ...card, id: makeId() }],
              grave: [...pl.grave, card],
            },
          },
          log: [`▶️ P${p} plays ${card.name}`, ...state.log].slice(0, 20),
        };
      }
      return {
        ...state,
        mana: newMana,
        players: {
          ...state.players,
          [p]: { ...pl, hand: newHand, grave: [...pl.grave, card] },
        },
      };
    }
    case 'RESOLVE_TARGET': {
      const { by, card } = state.pendingTarget;
      const p = by,
        o = 3 - by;
      const pl = state.players[p],
        op = state.players[o];
      if (card.effect === 'damage2') {
        const nf = op.field
          .map((u) =>
            u.id === action.targetId && typeof u.hp === 'number'
              ? { ...u, hp: (u.hp as number) - 2 }
              : u,
          )
          .filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
        return {
          ...state,
          players: {
            ...state.players,
            [o]: { ...op, field: nf },
            [p]: { ...pl, grave: [...pl.grave, card] },
          },
          pendingTarget: null,
          log: [`⚡ Zap! hits`, ...state.log].slice(0, 20),
        };
      }
      return { ...state, pendingTarget: null };
    }
    case 'ATTACK_UNIT': {
      const p = state.active,
        o = 3 - p,
        { att, def } = action;
      const pl = state.players[p],
        op = state.players[o];
      const ac = state.attackCount[p] + 1;
      let atkVal = att.atk;
      if (state.power[p] === 'Aura' && ac === 2) atkVal++;
      const d1 =
        atkVal !== undefined && def
          ? def.keyword === 'Vanguard' && true
            ? Math.max(0, atkVal - 1)
            : atkVal
          : 0;
      const d2 =
        def.atk !== undefined && att
          ? att.keyword === 'Vanguard' && true
            ? Math.max(0, def.atk - 1)
            : def.atk
          : 0;
      const nf = op.field
        .map((u) =>
          u.id === def.id && typeof u.hp === 'number' ? { ...u, hp: (u.hp as number) - d1 } : u,
        )
        .filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
      const pf = pl.field
        .map((u) =>
          u.id === att.id && typeof u.hp === 'number' ? { ...u, hp: (u.hp as number) - d2 } : u,
        )
        .filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
      let lifeHeal = pl.life;
      const defDied = !nf.find((x) => x.id === def.id);
      if (att.keyword === 'Lifesteal' && defDied && atkVal) lifeHeal += atkVal;
      return {
        ...state,
        attackCount: { ...state.attackCount, [p]: ac },
        players: {
          ...state.players,
          [p]: { ...pl, field: pf, life: lifeHeal },
          [o]: { ...op, field: nf },
        },
        attacked: { ...state.attacked, [att.id]: true },
        log: [`⚔️ ${att.name}→${def.name}`, ...state.log].slice(0, 20),
      };
    }
    case 'ATTACK_HERO': {
      const p = state.active,
        o = 3 - p,
        att = action.att;
      const pl = state.players[p],
        op = state.players[o];
      const ac = state.attackCount[p] + 1;
      let atkVal = att.atk;
      if (state.power[p] === 'Aura' && ac === 2) atkVal++;
      const life = Math.max(0, op.life - (atkVal || 0));
      return {
        ...state,
        attackCount: { ...state.attackCount, [p]: ac },
        players: { ...state.players, [o]: { ...op, life } },
        attacked: { ...state.attacked, [att.id]: true },
        log: [`🎯 ${att.name} hits hero for ${atkVal}`, ...state.log].slice(0, 20),
      };
    }
    case 'HERO_POWER': {
      const p = state.active,
        power = state.power[p];
      if (!power || power === 'Aura' || state.powerUsed[p]) return state;
      if (state.mana[p] < 1) return state;
      const pl = state.players[p];
      const mana = { ...state.mana, [p]: state.mana[p] - 1 };
      if (power === 'Lib') {
        const lib = {
          name: '10 of Lib',
          cost: 1,
          type: 'unit',
          atk: 1,
          hp: 1,
          keyword: 'Vanguard',
          level: 1,
          id: makeId(),
        };
        return {
          ...state,
          mana,
          players: {
            ...state.players,
            [p]: { ...pl, field: [...pl.field, lib] },
          },
          powerUsed: { ...state.powerUsed, [p]: true },
          log: [`⭐ P${p} summons 10 of Lib`, ...state.log].slice(0, 20),
        };
      }
      if (power === 'Goer') {
        // Type guard for Card
        let extra: Card[];
        if (pl.extra.length) {
          extra = pl.extra.map((c) => ({
            ...c,
            type: 'unit' as const,
          }));
        } else {
          extra = EXTRA_POOL_TEMPLATE.map((c) => ({
            ...c,
            id: makeId(),
            type: 'unit' as const,
          }));
        }
        const pick = { ...extra[0], type: 'unit' as const };
        const rest = extra.slice(1).map((c) => ({ ...c, type: 'unit' as const }));
        return {
          ...state,
          mana,
          players: {
            ...state.players,
            [p]: { ...pl, field: [...pl.field, pick], extra: rest } as Player,
          },
          powerUsed: { ...state.powerUsed, [p]: true },
          log: [`⭐ P${p} summons a Goer`, ...state.log].slice(0, 20),
        };
      }
      return state;
    }
    case 'END_TURN': {
      const next = 3 - state.active;
      const counts = { ...state.turnCount, [next]: state.turnCount[next] + 1 };
      // Prepare state for draw trigger
      return {
        ...state,
        active: next,
        turnCount: counts,
        mana: { ...state.mana, [next]: Math.min(counts[next], 5) },
        attacked: {},
        attackCount: { ...state.attackCount, [state.active]: 0 },
        powerUsed: { ...state.powerUsed, [state.active]: false },
      };
    }
    case 'FORFEIT': {
      if (state.campaign.active)
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
      return {
        ...initialState,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };
    }
    case 'OPEN_ART_MANAGER':
      return { ...state, tab: 'artManager' };
    case 'SET_CARD_ART': {
      const map = { ...state.imageMap, [action.cardName]: action.objectURL };
      localStorage.setItem('cardImages', JSON.stringify(map));
      return { ...state, imageMap: map };
    }
    case 'CLEAR_CARD_ART': {
      const map = { ...state.imageMap };
      delete map[action.cardName];
      localStorage.setItem('cardImages', JSON.stringify(map));
      return { ...state, imageMap: map };
    }
    case 'REWARD_BEGIN': {
      return {
        ...state,
        tab: 'campaignReward',
        campaign: {
          ...state.campaign,
          rewardsLeft: 3,
          rewardOptions: randomRewardOptions(),
        },
      };
    }
    case 'REWARD_PICK': {
      if (state.campaign.rewardsLeft <= 0) return state;
      const chosen = action.card;
      const newDeck = [...state.deckBuilder[1], { ...chosen, id: makeId() }];
      let newUnlocks = state.campaign.unlocks;
      if (chosen.level >= 3 && !newUnlocks.includes(chosen.name)) {
        newUnlocks = [...newUnlocks, chosen.name];
        saveUnlocks(newUnlocks);
      }
      const left = state.campaign.rewardsLeft - 1;
      const next = {
        ...state,
        deckBuilder: { ...state.deckBuilder, 1: newDeck },
        campaign: {
          ...state.campaign,
          rewardsLeft: left,
          rewardOptions: left > 0 ? randomRewardOptions() : [],
          unlocks: newUnlocks,
        },
      };
      if (left === 0) {
        return reducer(next, { type: 'CAMPAIGN_BUILD_NEXT' });
      }
      return next;
    }
    default:
      return state;
  }
}
