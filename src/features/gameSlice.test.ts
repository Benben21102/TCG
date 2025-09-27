/* global describe, it, expect, beforeEach */

import reducer, {
  mainMenu,
  setTab,
  addToDeck,
  removeFromDeck,
  mullToggle,
  mullConfirm,
  draw,
  playCard,
  endTurn,
  attackHero,
  heroPower,
} from './gameSlice';
import { Card, State } from '../types';
import { initialState } from '../state/helpers';

describe('Redux Game Slice', () => {
  let state: State;
  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialState));
  });

  it('should return to main menu', () => {
    const next = reducer(state, mainMenu());
    expect(next.tab).toBe('mainMenu');
  });

  it('should set tab', () => {
    const next = reducer(state, setTab('deckBuilder'));
    expect(next.tab).toBe('deckBuilder');
  });

  it('should add and remove cards from deck', () => {
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
    let next = reducer(state, addToDeck(card));
    expect(next.deckBuilder[1].length).toBe(1);
    next = reducer(next, removeFromDeck(card));
    expect(next.deckBuilder[1].length).toBe(0);
  });

  it('should toggle and confirm mulligan', () => {
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
    state.players[1].hand = [card];
    state.mullSel[1] = [];
    let next = reducer(state, mullToggle({ p: 1, id: 1 }));
    expect(next.mullSel[1].includes(1)).toBe(true);
    next = reducer(next, mullConfirm({ p: 1 }));
    expect(next.players[1].hand.length).toBe(1);
  });

  it('should draw a card', () => {
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
    state.players[1].deck = [card];
    state.players[1].hand = [];
    state.active = 1;
    const next = reducer(state, draw());
    expect(next.players[1].hand.length).toBe(1);
    expect(next.players[1].deck.length).toBe(0);
  });

  it('should play a card if enough mana', () => {
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
    state.players[1].hand = [card];
    state.mana[1] = 2;
    state.active = 1;
    const next = reducer(state, playCard(card));
    expect(next.players[1].field.length).toBe(1);
    expect(next.players[1].hand.length).toBe(0);
  });

  it('should not play a card if not enough mana', () => {
    const card: Card = {
      name: 'Test',
      id: 1,
      cost: 2,
      type: 'unit',
      atk: 1,
      hp: 1,
      level: 1,
      keyword: '',
    };
    state.players[1].hand = [card];
    state.mana[1] = 1;
    state.active = 1;
    const next = reducer(state, playCard(card));
    expect(next.players[1].field.length).toBe(0);
    expect(next.players[1].hand.length).toBe(1);
  });

  it('should end turn and update active player', () => {
    state.active = 1;
    let next = reducer(state, endTurn());
    expect(next.active).toBe(2);
    next = reducer(next, endTurn());
    expect(next.active).toBe(1);
  });

  it('should handle attack on hero', () => {
    const att: Card = {
      name: 'Att',
      id: 1,
      cost: 1,
      type: 'unit',
      atk: 2,
      hp: 1,
      level: 1,
      keyword: '',
    };
    state.players[1].field = [att];
    state.players[2].life = 10;
    state.active = 1;
    const next = reducer(state, attackHero({ att }));
    expect(next.players[2].life).toBe(8);
  });

  it('should handle hero power Lib', () => {
    state.active = 1;
    state.power[1] = 'Lib';
    state.mana[1] = 2;
    const next = reducer(state, heroPower());
    expect(next.players[1].field.some((c: Card) => c.name === '10 of Lib')).toBe(true);
    expect(next.powerUsed[1]).toBe(true);
  });
});
