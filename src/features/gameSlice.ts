/* global localStorage */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Card } from '../types';
import {
  initialState,
  buildLegalDeckFromPool,
  randomHeroPower,
  randomRewardOptions,
  legalToAdd10,
  legalToAdd20,
  startMulliganFromDeck,
  endGame,
} from '../state/helpers';
import { makeFixedAIDeck } from '../state/campaign';
import { BASE_CARDS, EXTRA_POOL_TEMPLATE } from '../constants';
import { makeId, shuffle } from '../utils';

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    mainMenu(state) {
      return {
        ...initialState,
        campaign: { ...initialState.campaign, unlocks: state.campaign.unlocks },
      };
    },
    setTab(state, action: PayloadAction<string>) {
      state.tab = action.payload;
    },
    freeplayHuman(state) {
      return {
        ...initialState,
        tab: 'heroSelect',
        vsAI: false,
        dbCurrent: 1,
        campaign: { ...initialState.campaign, unlocks: state.campaign.unlocks },
      };
    },
    freeplayAI(state) {
      return {
        ...initialState,
        tab: 'heroSelect',
        vsAI: true,
        dbCurrent: 1,
        campaign: { ...initialState.campaign, unlocks: state.campaign.unlocks },
      };
    },
    campaignStart(state) {
      return {
        ...initialState,
        tab: 'campaignHero',
        campaign: {
          active: true,
          stage: 0,
          rewardsLeft: 0,
          rewardOptions: [],
          unlocks: state.campaign.unlocks,
        },
      };
    },
    selectHero(state, action: PayloadAction<{ hero?: string; power?: string }>) {
      const p = state.dbCurrent;
      if (action.payload.hero && !state.hero[p]) {
        state.hero[p] = action.payload.hero;
        return;
      }
      if (action.payload.power) {
        state.power[p] = action.payload.power;
      }
      if (state.tab === 'campaignHero') {
        state.tab = 'campaignDraft';
        state.deckBuilder[1] = [];
        state.dbCurrent = 1;
        return;
      }
      if (state.vsAI && p === 1) {
        state.power[2] = randomHeroPower();
        state.hero[2] = Math.random() < 0.5 ? 'Library' : 'Beach';
        state.tab = 'deckBuilder';
        state.dbCurrent = 1;
        return;
      }
      if (p === 1) {
        state.dbCurrent = 2;
        return;
      }
      state.tab = 'deckBuilder';
      state.dbCurrent = 1;
    },
    addToDeck(state, action: PayloadAction<Card>) {
      const p = state.dbCurrent;
      const picks = state.deckBuilder[p];
      const legal = state.tab === 'campaignDraft' ? legalToAdd10 : legalToAdd20;
      if (!legal(picks, action.payload)) return;
      state.deckBuilder[p] = [...picks, action.payload];
    },
    removeFromDeck(state, action: PayloadAction<Card>) {
      const p = state.dbCurrent;
      const picks = [...state.deckBuilder[p]];
      const idx = picks.findIndex((x) => x.id === action.payload.id);
      if (idx < 0) return;
      picks.splice(idx, 1);
      state.deckBuilder[p] = picks;
    },
    nextDraft(state) {
      const need = state.tab === 'campaignDraft' ? 10 : 20;
      const p = state.dbCurrent;
      if (state.deckBuilder[p].length !== need) return;
      if (state.tab === 'campaignDraft') {
        gameSlice.caseReducers.campaignBuildNext(state);
        return;
      }
      if (state.vsAI) {
        if (p === 1) {
          const aiDeck = buildLegalDeckFromPool(BASE_CARDS, 20);
          state.deckBuilder[2] = aiDeck;
          state.dbCurrent = 2;
        } else {
          Object.assign(
            state,
            startMulliganFromDeck(state, state.deckBuilder[1], state.deckBuilder[2], false),
          );
        }
      } else {
        if (p === 1) {
          state.dbCurrent = 2;
        } else {
          Object.assign(
            state,
            startMulliganFromDeck(state, state.deckBuilder[1], state.deckBuilder[2], false),
          );
        }
      }
    },
    campaignBuildNext(state) {
      const nextStage = state.campaign.stage + 1;
      const aiDeck = makeFixedAIDeck(nextStage);
      const heroPowersByStage = { 1: 'Lib', 2: 'Goer', 3: 'Aura' };
      const aiPower = (heroPowersByStage as Record<number, string>)[nextStage] || 'Lib';
      state.campaign.stage = nextStage;
      state.hero[2] = Math.random() < 0.5 ? 'Library' : 'Beach';
      state.power[2] = aiPower;
      Object.assign(state, startMulliganFromDeck(state, state.deckBuilder[1], aiDeck, true));
    },
    mullToggle(state, action: PayloadAction<{ p: number; id: number }>) {
      const { p, id } = action.payload;
      const ids = state.mullSel[p].slice();
      const idx = ids.indexOf(id);
      if (idx !== -1) ids.splice(idx, 1);
      else ids.push(id);
      state.mullSel[p] = ids;
    },
    mullConfirm(state, action: PayloadAction<{ p: number }>) {
      const p = action.payload.p;
      const ids = state.mullSel[p];
      const pl = state.players[p];
      const keep = pl.hand.filter((c) => c.id !== undefined && !ids.includes(c.id as number));
      const toss = pl.hand.filter((c) => c.id !== undefined && ids.includes(c.id as number));
      const reshuffled = shuffle([...pl.deck, ...toss]);
      const draw = reshuffled.slice(0, toss.length);
      const rest = reshuffled.slice(toss.length);
      state.players[p] = { ...pl, deck: rest, hand: [...keep, ...draw] };
      if (p === 1) {
        state.mullSel[1] = [];
        state.active = 2;
      } else {
        state.tab = 'game';
        state.mullSel[2] = [];
        state.active = 1;
        state.log = ['— Game Start —'];
      }
    },
    // ...continue for all other actions (DRAW, PLAY_CARD, etc.)
    resolveTarget(state, action: PayloadAction<{ targetId: string }>) {
      const { by, card } = state.pendingTarget || {};
      if (!by || !card) return;
      const p = by,
        o = 3 - by;
      const pl = state.players[p],
        op = state.players[o];
      if (card.effect === 'damage2') {
        const nf = op.field
          .map((u) =>
            String(u.id) === String(action.payload.targetId) && typeof u.hp === 'number'
              ? { ...u, hp: (u.hp as number) - 2 }
              : u,
          )
          .filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
        state.players[o] = { ...op, field: nf };
        state.players[p] = { ...pl, grave: [...pl.grave, card] };
        state.pendingTarget = null;
        state.log = [`⚡ Zap! hits`, ...state.log].slice(0, 20);
        return;
      }
      state.pendingTarget = null;
    },
    attackUnit(state, action: PayloadAction<{ att: Card; def: Card }>) {
      const p = state.active,
        o = 3 - p;
      const { att, def } = action.payload;
      const pl = state.players[p],
        op = state.players[o];
      const ac = state.attackCount[p] + 1;
      let atkVal = att.atk ?? 0;
      if (state.power[p] === 'Aura' && ac === 2) atkVal++;
      const d1 = def ? (def.keyword === 'Vanguard' ? Math.max(0, atkVal - 1) : atkVal) : 0;
      const d2 =
        def.atk !== undefined && att
          ? att.keyword === 'Vanguard'
            ? Math.max(0, def.atk - 1)
            : def.atk
          : 0;
      const nf = op.field
        .map((u) =>
          String(u.id) === String(def.id) && typeof u.hp === 'number'
            ? { ...u, hp: (u.hp as number) - d1 }
            : u,
        )
        .filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
      const pf = pl.field
        .map((u) =>
          String(u.id) === String(att.id) && typeof u.hp === 'number'
            ? { ...u, hp: (u.hp as number) - d2 }
            : u,
        )
        .filter((u) => typeof u.hp === 'number' && (u.hp as number) > 0);
      let lifeHeal = pl.life;
      const defDied = !nf.find((x) => String(x.id) === String(def.id));
      if (att.keyword === 'Lifesteal' && defDied && atkVal) lifeHeal += atkVal;
      state.attackCount[p] = ac;
      state.players[p] = { ...pl, field: pf, life: lifeHeal };
      state.players[o] = { ...op, field: nf };
      if (att.id !== undefined) state.attacked[att.id] = true;
      state.log = [`⚔️ ${att.name}→${def.name}`, ...state.log].slice(0, 20);
    },
    attackHero(state, action: PayloadAction<{ att: Card }>) {
      const p = state.active,
        o = 3 - p,
        att = action.payload.att;
      const pl = state.players[p],
        op = state.players[o];
      const ac = state.attackCount[p] + 1;
      let atkVal = att.atk ?? 0;
      if (state.power[p] === 'Aura' && ac === 2) atkVal++;
      const life = Math.max(0, op.life - atkVal);
      state.attackCount[p] = ac;
      state.players[o] = { ...op, life };
      if (att.id !== undefined) state.attacked[att.id] = true;
      state.log = [`🎯 ${att.name} hits hero for ${atkVal}`, ...state.log].slice(0, 20);
    },
    heroPower(state) {
      const p = state.active;
      const power = state.power[p];
      if (!power || power === 'Aura' || state.powerUsed[p]) return;
      if (state.mana[p] < 1) return;
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
        state.mana = mana;
        state.players[p] = { ...pl, field: [...pl.field, lib] };
        state.powerUsed[p] = true;
        state.log = [`⭐ P${p} summons 10 of Lib`, ...state.log].slice(0, 20);
        return;
      }
      if (power === 'Goer') {
        let extra;
        if (pl.extra.length) {
          extra = pl.extra.map((c) => ({ ...c, type: 'unit' as const }));
        } else {
          extra = EXTRA_POOL_TEMPLATE.map((c) => ({ ...c, id: makeId(), type: 'unit' as const }));
        }
        const pick = { ...extra[0], type: 'unit' as const };
        const rest = extra.slice(1).map((c) => ({ ...c, type: 'unit' as const }));
        state.mana = mana;
        state.players[p] = { ...pl, field: [...pl.field, pick], extra: rest };
        state.powerUsed[p] = true;
        state.log = [`⭐ P${p} summons a Goer`, ...state.log].slice(0, 20);
        return;
      }
    },
    endTurn(state) {
      // Toggle active player between 1 and 2
      const current = state.active;
      const next = current === 1 ? 2 : 1;
      state.active = next;
      state.turnCount[next] = (state.turnCount[next] || 0) + 1;
      // At the start of the new player's turn, increase their max mana by 1 (up to 10) and refill
      const newMana = Math.min(10, state.turnCount[next] || 1);
      state.mana[next] = newMana;
      state.powerUsed[next] = false;
    },
    forfeit(state) {
      if (state.campaign.active) {
        Object.assign(state, {
          ...initialState,
          tab: 'campaignHero',
          campaign: {
            active: true,
            stage: 0,
            rewardsLeft: 0,
            rewardOptions: [],
            unlocks: state.campaign.unlocks,
          },
        });
      } else {
        Object.assign(state, {
          ...initialState,
          campaign: { ...initialState.campaign, unlocks: state.campaign.unlocks },
        });
      }
    },
    openArtManager(state) {
      state.tab = 'artManager';
    },
    setCardArt(state, action: PayloadAction<{ cardName: string; objectURL: string }>) {
      const map = { ...state.imageMap, [action.payload.cardName]: action.payload.objectURL };
      localStorage.setItem('cardImages', JSON.stringify(map));
      state.imageMap = map;
    },
    clearCardArt(state, action: PayloadAction<{ cardName: string }>) {
      const map = { ...state.imageMap };
      delete map[action.payload.cardName];
      localStorage.setItem('cardImages', JSON.stringify(map));
      state.imageMap = map;
    },
    rewardBegin(state) {
      state.tab = 'campaignReward';
      state.campaign.rewardsLeft = 3;
      state.campaign.rewardOptions = randomRewardOptions();
    },
    rewardPick(state, action: PayloadAction<{ card: Card }>) {
      if (state.campaign.rewardsLeft <= 0) return;
      const chosen = action.payload.card;
      const newDeck = [...state.deckBuilder[1], { ...chosen, id: makeId() }];
      let newUnlocks = state.campaign.unlocks;
      if (chosen.level >= 3 && !newUnlocks.includes(chosen.name)) {
        newUnlocks = [...newUnlocks, chosen.name];
        localStorage.setItem('unlocks', JSON.stringify(newUnlocks));
      }
      const left = state.campaign.rewardsLeft - 1;
      state.deckBuilder[1] = newDeck;
      state.campaign.rewardsLeft = left;
      state.campaign.rewardOptions = left > 0 ? randomRewardOptions() : [];
      state.campaign.unlocks = newUnlocks;
      if (left === 0) {
        // Directly call the reducer logic for campaignBuildNext
        const nextStage = state.campaign.stage + 1;
        const aiDeck = makeFixedAIDeck(nextStage);
        const heroPowersByStage = { 1: 'Lib', 2: 'Goer', 3: 'Aura' };
        const aiPower = (heroPowersByStage as Record<number, string>)[nextStage] || 'Lib';
        state.campaign.stage = nextStage;
        state.hero[2] = Math.random() < 0.5 ? 'Library' : 'Beach';
        state.power[2] = aiPower;
        Object.assign(state, startMulliganFromDeck(state, state.deckBuilder[1], aiDeck, true));
      }
    },
    draw(state) {
      const p = state.active;
      const pl = state.players[p];
      if (!pl.deck.length) {
        Object.assign(state, endGame(state, 3 - p, state.campaign.active));
        return;
      }
      const [top, ...rest] = pl.deck;
      state.players[p] = { ...pl, deck: rest, hand: [...pl.hand, top] };
    },
    playCard(state, action: PayloadAction<Card>) {
      const p = state.active;
      const pl = state.players[p];
      const card = action.payload;
      if (card.cost > state.mana[p]) return;
      const newMana = { ...state.mana, [p]: state.mana[p] - card.cost };
      const newHand = pl.hand.filter((c) => c.id === undefined || c.id !== card.id);
      const op = state.players[3 - p];
      if (card.effect === 'damage2') {
        state.mana = newMana;
        state.players[p] = { ...pl, hand: newHand };
        state.pendingTarget = { by: p, card };
        state.log = [`✨ P${p} casts ${card.name}`, ...state.log].slice(0, 20);
        return;
      }
      if (card.effect === 'draw2') {
        const draw = pl.deck.slice(0, 2);
        state.mana = newMana;
        state.players[p] = {
          ...pl,
          deck: pl.deck.slice(2),
          hand: [...newHand, ...draw],
          grave: [...pl.grave, card],
        };
        state.log = [`📚 P${p} draws 2`, ...state.log].slice(0, 20);
        return;
      }
      if (card.effect === 'summon2') {
        let extra = pl.extra.length
          ? [...pl.extra]
          : EXTRA_POOL_TEMPLATE.map((c) => ({ ...c, id: makeId() }));
        const two = extra.splice(0, 2);
        state.mana = newMana;
        state.players[p] = {
          ...pl,
          hand: newHand,
          field: [...pl.field, ...two],
          extra,
          grave: [...pl.grave, card],
        };
        state.log = [`🌀 P${p} summons 2 from extra`, ...state.log].slice(0, 20);
        return;
      }
      if (card.effect === 'summonTop2Grave') {
        const revived = pl.grave.slice(-2).map((x) => ({ ...x, id: makeId() }));
        const remaining = pl.grave.slice(0, -2);
        state.mana = newMana;
        state.players[p] = {
          ...pl,
          hand: newHand,
          field: [...pl.field, ...revived],
          grave: [...remaining, card],
        };
        state.log = [`💀 P${p} revives 2`, ...state.log].slice(0, 20);
        return;
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
        state.mana = newMana;
        state.players[p] = {
          ...pl,
          hand: newHand,
          field: [...pl.field, summoned],
          grave: [...pl.grave, card],
        };
        state.players[3 - p] = { ...op, field: newOpp };
        state.log = [`🍌 P${p} plays ${card.name}`, ...state.log].slice(0, 20);
        return;
      }
      if (card.type === 'unit') {
        state.mana = newMana;
        state.players[p] = {
          ...pl,
          hand: newHand,
          field: [...pl.field, { ...card, id: makeId() }],
          grave: [...pl.grave, card],
        };
        state.log = [`▶️ P${p} plays ${card.name}`, ...state.log].slice(0, 20);
        return;
      }
      // Default: spell with no special effect
      state.mana = newMana;
      state.players[p] = { ...pl, hand: newHand, grave: [...pl.grave, card] };
    },
  },
});

export const {
  mainMenu,
  setTab,
  freeplayHuman,
  freeplayAI,
  campaignStart,
  selectHero,
  addToDeck,
  removeFromDeck,
  nextDraft,
  campaignBuildNext,
  mullToggle,
  mullConfirm,
  draw,
  playCard,
  resolveTarget,
  attackUnit,
  attackHero,
  heroPower,
  endTurn,
  forfeit,
  openArtManager,
  setCardArt,
  clearCardArt,
  rewardBegin,
  rewardPick,
} = gameSlice.actions;
export default gameSlice.reducer;
