import React, { useReducer, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import "./App.css";

/* ───────────────────────── Utils ───────────────────────── */
let nextId = 1;
const makeId = () => nextId++;
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const damageAfterVanguard = (dmg, def, isAttack) =>
  def.keyword === "Vanguard" && isAttack ? Math.max(0, dmg - 1) : dmg;

const keywordHelp = (k) =>
  k === "Rush"
    ? "Can attack the turn it is summoned."
    : k === "Vanguard"
    ? "Takes 1 less damage when defending."
    : k === "Lifesteal"
    ? "Heals your hero equal to damage dealt."
    : "";

/* ───────────────────────── Card Pool ───────────────────────── */
const BASE_CARDS = [
  // L1
  {
    name: "Purple Rain",
    cost: 1,
    type: "unit",
    atk: 3,
    hp: 1,
    keyword: "Rush",
    level: 1,
  },
  {
    name: "Book Rust",
    cost: 1,
    type: "unit",
    atk: 2,
    hp: 1,
    keyword: "Rush",
    level: 1,
  },
  {
    name: "10 of Lib",
    cost: 1,
    type: "unit",
    atk: 1,
    hp: 1,
    keyword: "Vanguard",
    level: 1,
  },
  {
    name: "Coconut Champ",
    cost: 1,
    type: "unit",
    atk: 1,
    hp: 2,
    keyword: "Lifesteal",
    level: 1,
  },
  {
    name: "Beach Goer",
    cost: 1,
    type: "unit",
    atk: 1,
    hp: 1,
    keyword: "Vanguard",
    level: 1,
  },
  // L2
  {
    name: "Jack Knight",
    cost: 2,
    type: "unit",
    atk: 2,
    hp: 3,
    keyword: "",
    level: 2,
  },
  {
    name: "Lifesteal Book",
    cost: 2,
    type: "unit",
    atk: 2,
    hp: 2,
    keyword: "Lifesteal",
    level: 2,
  },
  {
    name: "Blue Lagoon",
    cost: 2,
    type: "unit",
    atk: 3,
    hp: 2,
    keyword: "",
    level: 2,
  },
  {
    name: "Beach Goer 2",
    cost: 2,
    type: "unit",
    atk: 1,
    hp: 3,
    keyword: "Lifesteal",
    level: 2,
  },
  {
    name: "Stackways",
    cost: 2,
    type: "spell",
    effect: "summon2",
    keyword: "Spell",
    level: 2,
  },
  {
    name: "Beach Goer 3",
    cost: 2,
    type: "unit",
    atk: 2,
    hp: 2,
    keyword: "Vanguard",
    level: 2,
  },
  {
    name: "Mango Warrior",
    cost: 2,
    type: "unit",
    atk: 2,
    hp: 2,
    keyword: "Rush",
    level: 2,
  },
  {
    name: "Zap!",
    cost: 2,
    type: "spell",
    effect: "damage2",
    keyword: "Spell",
    level: 2,
  },
  {
    name: "Insight",
    cost: 2,
    type: "spell",
    effect: "draw2",
    keyword: "Spell",
    level: 2,
  },
  // L3
  {
    name: "Queens Knight",
    cost: 3,
    type: "unit",
    atk: 2,
    hp: 4,
    keyword: "",
    level: 3,
  },
  {
    name: "Tequila Sunrise",
    cost: 3,
    type: "unit",
    atk: 3,
    hp: 3,
    keyword: "Rush",
    level: 3,
  },
  {
    name: "Banana Brawlers",
    cost: 3,
    type: "unit",
    atk: 2,
    hp: 2,
    keyword: "",
    effect: "banana",
    level: 3,
  },
  {
    name: "Electra",
    cost: 3,
    type: "unit",
    atk: 3,
    hp: 3,
    keyword: "",
    level: 3,
  },
  {
    name: "Edgar",
    cost: 3,
    type: "unit",
    atk: 3,
    hp: 3,
    keyword: "",
    level: 3,
  },
  // L4
  {
    name: "Beach Brawlers",
    cost: 4,
    type: "unit",
    atk: 5,
    hp: 3,
    keyword: "",
    level: 4,
  },
  {
    name: "Beatrice",
    cost: 4,
    type: "unit",
    atk: 2,
    hp: 5,
    keyword: "Lifesteal",
    level: 4,
  },
  {
    name: "Mad Hatter",
    cost: 4,
    type: "unit",
    atk: 4,
    hp: 4,
    keyword: "Rush",
    level: 4,
  },
  {
    name: "Guardbook",
    cost: 4,
    type: "unit",
    atk: 4,
    hp: 4,
    keyword: "Vanguard",
    level: 4,
  },
  {
    name: "Grave Recall",
    cost: 4,
    type: "spell",
    effect: "summonTop2Grave",
    keyword: "Spell",
    level: 4,
  },
  // L5
  {
    name: "Dante",
    cost: 5,
    type: "unit",
    atk: 6,
    hp: 6,
    keyword: "Rush",
    level: 5,
  },
  {
    name: "Pineapple Man",
    cost: 5,
    type: "unit",
    atk: 6,
    hp: 6,
    keyword: "",
    level: 5,
  },
];

const EXTRA_POOL_TEMPLATE = [
  { name: "Extra Goer (Rush)", atk: 1, hp: 1, keyword: "Rush" },
  { name: "Extra Goer (Rush)", atk: 1, hp: 1, keyword: "Rush" },
  { name: "Extra Goer (Lifesteal)", atk: 1, hp: 1, keyword: "Lifesteal" },
  { name: "Extra Goer (Lifesteal)", atk: 1, hp: 1, keyword: "Lifesteal" },
];

/* ───────────────────────── Campaign unlocks (campaign-only) ───────────────────────── */
const UNLOCKS_KEY = "campaignUnlocks_v1"; // stores array of card names that are unlocked (usually L3+)
function loadUnlocks() {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveUnlocks(arr) {
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(arr));
}

/* ───────────────────────── Initial State ───────────────────────── */
const initialState = {
  tab: "mainMenu", // mainMenu | heroSelect | deckBuilder | mulligan | game | artManager | campaignHero | campaignDraft | campaignReward
  hero: { 1: null, 2: null },
  power: { 1: null, 2: null }, // Lib | Goer | Aura
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
    unlocks: loadUnlocks(), // array of card names
  },

  mullSel: { 1: new Set(), 2: new Set() },

  imageMap: JSON.parse(localStorage.getItem("cardImages") || "{}"),
};

/* ───────────────────────── Deck rules & builders ───────────────────────── */
function legalToAdd20(deck, card) {
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
function legalToAdd10(deck, card) {
  const copies = deck.filter((c) => c.name === card.name).length;
  if (copies >= 2) return false;
  if (card.level === 5 && deck.some((c) => c.level === 5)) return false;
  return deck.length < 10;
}

function buildPlayerFromDeck(deck) {
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

function buildLegalDeckFromPool(pool, size = 20) {
  const picks = [];
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
      while (
        picks.length < size &&
        picks.filter((x) => x.name === f.name).length < 2
      ) {
        picks.push({ ...f, id: makeId() });
      }
      if (picks.length >= size) break;
    }
  }
  return picks;
}

function makeFixedAIDeck(stage) {
  let pool;
  if (stage === 1) {
    pool = BASE_CARDS.filter((c) =>
      [
        "10 of Lib",
        "Beach Goer",
        "Beach Goer 3",
        "Guardbook",
        "Queens Knight",
        "Jack Knight",
        "Insight",
        "Zap!",
      ].includes(c.name)
    );
  } else if (stage === 2) {
    pool = BASE_CARDS.filter((c) =>
      [
        "Purple Rain",
        "Book Rust",
        "Mango Warrior",
        "Tequila Sunrise",
        "Mad Hatter",
        "Blue Lagoon",
        "Zap!",
        "Stackways",
      ].includes(c.name)
    );
  } else {
    pool = BASE_CARDS.filter((c) =>
      [
        "Dante",
        "Pineapple Man",
        "Beach Brawlers",
        "Grave Recall",
        "Beatrice",
        "Electra",
        "Edgar",
        "Zap!",
        "Insight",
      ].includes(c.name)
    );
  }
  if (!pool.length) pool = BASE_CARDS;
  return buildLegalDeckFromPool(pool, 20);
}

const randomHeroPower = () =>
  ["Lib", "Goer", "Aura"][Math.floor(Math.random() * 3)];
const randomRewardOptions = () => {
  const seen = new Set();
  const out = [];
  while (out.length < 3) {
    const b = BASE_CARDS[Math.floor(Math.random() * BASE_CARDS.length)];
    if (!seen.has(b.name)) {
      seen.add(b.name);
      out.push({ ...b, id: makeId() });
    }
  }
  return out;
};

/* ───────────────────────── Campaign helpers (pool w/ unlocks) ───────────────────────── */
function campaignDraftPool(unlocks) {
  const unlockedSet = new Set(unlocks);
  // Start pool: Level ≤ 2 cards + any unlocked higher-level cards
  return BASE_CARDS.filter((c) => c.level <= 2 || unlockedSet.has(c.name));
}

/* ───────────────────────── Small UI ───────────────────────── */
const Section = ({ title, children, right }) => (
  <motion.section
    className="sect"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="sect-head">
      <h3>{title}</h3>
      {right}
    </div>
    {children}
  </motion.section>
);

function Art({ name, imageMap }) {
  const src = imageMap?.[name];
  return (
    <div
      className={`art ${src ? "has" : "none"}`}
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    />
  );
}

function Header({
  turn,
  active,
  mana,
  deck1,
  deck2,
  life1,
  life2,
  power,
  onHeroPower,
  onEndTurn,
  onForfeit,
}) {
  return (
    <header className="hdr">
      <div className="status">
        <h2>
          Turn {turn} — P{active}
        </h2>
        <div className="row">
          <span className="pill">P1 ♥ {life1}</span>
          <span className="pill">P2 ♥ {life2}</span>
          <span className="pill">Mana {mana}</span>
        </div>
        <div className="row">
          <span className="chip">P1 Deck {deck1}</span>
          <span className="chip">P2 Deck {deck2}</span>
          {power === "Aura" && (
            <span className="chip">PASSIVE: +1 ATK on 2nd attack</span>
          )}
        </div>
      </div>
      <div className="hdr-buttons">
        {power !== "Aura" && (
          <button className="btn" onClick={onHeroPower}>
            Hero Power
          </button>
        )}
        <button className="btn" onClick={onEndTurn}>
          End Turn
        </button>
        <button className="btn danger" onClick={onForfeit}>
          Concede
        </button>
      </div>
    </header>
  );
}

function FieldPanel({
  field,
  isActive,
  attacked,
  opponentField,
  onAttackUnit,
  onAttackHero,
  active,
  turn,
  imageMap,
}) {
  return (
    <div className="flex">
      {field.map((c) => (
        <div key={c.id} className="minicard">
          <Art name={c.name} imageMap={imageMap} />
          <div className="cardtitle">{c.name}</div>
          <div className="keyword" title={keywordHelp(c.keyword)}>
            {c.keyword}
          </div>
          <div className="field-stats">
            <span>ATK {c.atk}</span>
            <span>HP {c.hp}</span>
          </div>
          {isActive && !(turn === 1 && active === 1) && (
            <div className="actions">
              <button
                className="btn small"
                onClick={() => onAttackHero(c)}
                disabled={
                  attacked[c.id] ||
                  (opponentField.length > 0 && c.keyword !== "Rush")
                }
              >
                Hit Hero
              </button>
              {opponentField.map((d) => (
                <button
                  className="btn small"
                  key={d.id}
                  onClick={() => onAttackUnit(c, d)}
                  disabled={attacked[c.id]}
                >
                  Hit {d.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Hand({ cards, onPlay, mana, imageMap }) {
  return (
    <div className="grid hand">
      {cards.map((c) => (
        <div
          key={c.id}
          className={`cardbox ${c.cost <= mana ? "playable" : ""}`}
        >
          <Art name={c.name} imageMap={imageMap} />
          <div className="cardtitle">{c.name}</div>
          <div className="details">
            Cost {c.cost}
            {c.type === "unit" ? ` • ${c.atk}/${c.hp}` : " • Spell"}
          </div>
          <div className="keyword">{c.keyword}</div>
          <button
            className="btn"
            onClick={() => onPlay(c)}
            disabled={c.cost > mana}
          >
            Play
          </button>
        </div>
      ))}
    </div>
  );
}

const LogPanel = ({ log }) => (
  <aside className="log">
    <h4>Action Log</h4>
    <ul>
      {log.map((l, i) => (
        <li key={i}>{l}</li>
      ))}
    </ul>
  </aside>
);

/* ───────────────────────── Reducer ───────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case "MAIN_MENU":
      return {
        ...initialState,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };
    case "SET_TAB":
      return { ...state, tab: action.tab };

    case "FREEPLAY_HUMAN":
      return {
        ...initialState,
        tab: "heroSelect",
        vsAI: false,
        dbCurrent: 1,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };
    case "FREEPLAY_AI":
      return {
        ...initialState,
        tab: "heroSelect",
        vsAI: true,
        dbCurrent: 1,
        campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
      };

    case "CAMPAIGN_START":
      return {
        ...initialState,
        tab: "campaignHero",
        campaign: {
          active: true,
          stage: 0,
          rewardsLeft: 0,
          rewardOptions: [],
          unlocks: loadUnlocks(),
        },
      };

    case "SELECT_HERO": {
      const p = state.dbCurrent;
      if (!state.hero[p])
        return { ...state, hero: { ...state.hero, [p]: action.hero } };
      const pw = { ...state.power, [p]: action.power };
      if (state.tab === "campaignHero") {
        // Only P1 picks in campaign
        return {
          ...state,
          power: pw,
          tab: "campaignDraft",
          deckBuilder: { ...state.deckBuilder, 1: [] },
          dbCurrent: 1,
        };
      }
      if (state.vsAI && p === 1) {
        const aiHero = Math.random() < 0.5 ? "Library" : "Beach";
        const aiPower = randomHeroPower();
        return {
          ...state,
          power: { ...pw, 2: aiPower },
          hero: { ...state.hero, 2: aiHero },
          tab: "deckBuilder",
          dbCurrent: 1,
        };
      }
      if (p === 1) return { ...state, power: pw, dbCurrent: 2 };
      return { ...state, power: pw, tab: "deckBuilder", dbCurrent: 1 };
    }

    case "ADD_TO_DECK": {
      const p = state.dbCurrent,
        picks = state.deckBuilder[p],
        c = action.card;
      const legal = state.tab === "campaignDraft" ? legalToAdd10 : legalToAdd20;
      if (!legal(picks, c)) return state;
      return {
        ...state,
        deckBuilder: { ...state.deckBuilder, [p]: [...picks, c] },
      };
    }
    case "REMOVE_FROM_DECK": {
      const p = state.dbCurrent,
        picks = [...state.deckBuilder[p]];
      const idx = picks.findIndex((x) => x.id === action.card.id);
      if (idx < 0) return state;
      picks.splice(idx, 1);
      return { ...state, deckBuilder: { ...state.deckBuilder, [p]: picks } };
    }

    case "NEXT_DRAFT": {
      const need = state.tab === "campaignDraft" ? 10 : 20;
      const p = state.dbCurrent;
      if (state.deckBuilder[p].length !== need) return state;

      if (state.tab === "campaignDraft") {
        return reducer({ ...state }, { type: "CAMPAIGN_BUILD_NEXT" });
      }

      // Free Play
      if (state.vsAI) {
        if (p === 1) {
          const aiDeck = buildLegalDeckFromPool(BASE_CARDS, 20);
          return {
            ...state,
            deckBuilder: { 1: state.deckBuilder[1], 2: aiDeck },
            dbCurrent: 2,
          };
        } else {
          return startMulliganFromDecks(
            state,
            state.deckBuilder[1],
            state.deckBuilder[2],
            false
          );
        }
      } else {
        if (p === 1) return { ...state, dbCurrent: 2 };
        return startMulliganFromDecks(
          state,
          state.deckBuilder[1],
          state.deckBuilder[2],
          false
        );
      }
    }

    case "CAMPAIGN_BUILD_NEXT": {
      const nextStage = state.campaign.stage + 1;
      const aiDeck = makeFixedAIDeck(nextStage);
      const heroPowersByStage = { 1: "Lib", 2: "Goer", 3: "Aura" };
      const aiPower = heroPowersByStage[nextStage] || "Lib";
      const s = {
        ...state,
        campaign: { ...state.campaign, stage: nextStage },
        hero: { ...state.hero, 2: Math.random() < 0.5 ? "Library" : "Beach" },
        power: { ...state.power, 2: aiPower },
      };
      return startMulliganFromDecks(s, state.deckBuilder[1], aiDeck, true);
    }

    case "MULL_TOGGLE": {
      const p = action.p;
      const ids = new Set(state.mullSel[p]);
      if (ids.has(action.id)) ids.delete(action.id);
      else ids.add(action.id);
      return { ...state, mullSel: { ...state.mullSel, [p]: ids } };
    }
    case "MULL_CONFIRM": {
      const p = action.p;
      const ids = new Set(state.mullSel[p]);
      const pl = state.players[p];
      const keep = pl.hand.filter((c) => !ids.has(c.id));
      const toss = pl.hand.filter((c) => ids.has(c.id));
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
        tab: "game",
        players,
        mullSel: { ...state.mullSel, 2: new Set() },
        active: 1,
        log: ["— Game Start —"],
      };
    }

    case "DRAW": {
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

    case "PLAY_CARD": {
      const p = state.active,
        pl = state.players[p],
        card = action.card;
      if (card.cost > state.mana[p]) return state;
      const newMana = { ...state.mana, [p]: state.mana[p] - card.cost };
      const newHand = pl.hand.filter((c) => c.id !== card.id);
      const op = state.players[3 - p];

      if (card.effect === "damage2") {
        return {
          ...state,
          mana: newMana,
          players: { ...state.players, [p]: { ...pl, hand: newHand } },
          pendingTarget: { by: p, card },
          log: [`✨ P${p} casts ${card.name}`, ...state.log].slice(0, 20),
        };
      }
      if (card.effect === "draw2") {
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
      if (card.effect === "summon2") {
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
      if (card.effect === "summonTop2Grave") {
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
      if (card.effect === "banana" && card.type === "unit") {
        const summoned = { ...card, id: makeId() };
        let newOpp = [...op.field];
        if (newOpp.length) {
          const idx = Math.floor(Math.random() * newOpp.length);
          newOpp[idx] = { ...newOpp[idx], hp: newOpp[idx].hp - 1 };
          newOpp = newOpp.filter((u) => u.hp > 0);
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
      if (card.type === "unit") {
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

    case "RESOLVE_TARGET": {
      const { by, card } = state.pendingTarget;
      const p = by,
        o = 3 - by;
      const pl = state.players[p],
        op = state.players[o];
      if (card.effect === "damage2") {
        const nf = op.field
          .map((u) => (u.id === action.targetId ? { ...u, hp: u.hp - 2 } : u))
          .filter((u) => u.hp > 0);
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

    case "ATTACK_UNIT": {
      const p = state.active,
        o = 3 - p,
        { att, def } = action;
      const pl = state.players[p],
        op = state.players[o];
      const ac = state.attackCount[p] + 1;
      let atkVal = att.atk;
      if (state.power[p] === "Aura" && ac === 2) atkVal++;
      const d1 = damageAfterVanguard(atkVal, def, true),
        d2 = damageAfterVanguard(def.atk, att, true);
      const nf = op.field
        .map((u) => (u.id === def.id ? { ...u, hp: u.hp - d1 } : u))
        .filter((u) => u.hp > 0);
      const pf = pl.field
        .map((u) => (u.id === att.id ? { ...u, hp: u.hp - d2 } : u))
        .filter((u) => u.hp > 0);
      let lifeHeal = pl.life;
      const defDied = !nf.find((x) => x.id === def.id);
      if (att.keyword === "Lifesteal" && defDied) lifeHeal += atkVal;
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

    case "ATTACK_HERO": {
      const p = state.active,
        o = 3 - p,
        att = action.att;
      const pl = state.players[p],
        op = state.players[o];
      const ac = state.attackCount[p] + 1;
      let atkVal = att.atk;
      if (state.power[p] === "Aura" && ac === 2) atkVal++;
      const life = Math.max(0, op.life - atkVal);
      return {
        ...state,
        attackCount: { ...state.attackCount, [p]: ac },
        players: { ...state.players, [o]: { ...op, life } },
        attacked: { ...state.attacked, [att.id]: true },
        log: [`🎯 ${att.name} hits hero for ${atkVal}`, ...state.log].slice(
          0,
          20
        ),
      };
    }

    case "HERO_POWER": {
      const p = state.active,
        power = state.power[p];
      if (!power || power === "Aura" || state.powerUsed[p]) return state;
      if (state.mana[p] < 1) return state;
      const pl = state.players[p];
      const mana = { ...state.mana, [p]: state.mana[p] - 1 };
      if (power === "Lib") {
        const lib = {
          name: "10 of Lib",
          cost: 1,
          type: "unit",
          atk: 1,
          hp: 1,
          keyword: "Vanguard",
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
      if (power === "Goer") {
        const extra = pl.extra.length
          ? pl.extra
          : EXTRA_POOL_TEMPLATE.map((c) => ({ ...c, id: makeId() }));
        const pick = extra[0];
        const rest = extra.slice(1);
        return {
          ...state,
          mana,
          players: {
            ...state.players,
            [p]: { ...pl, field: [...pl.field, pick], extra: rest },
          },
          powerUsed: { ...state.powerUsed, [p]: true },
          log: [`⭐ P${p} summons a Goer`, ...state.log].slice(0, 20),
        };
      }
      return state;
    }

    case "END_TURN": {
      const next = 3 - state.active;
      const counts = { ...state.turnCount, [next]: state.turnCount[next] + 1 };
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

    case "FORFEIT": {
      if (state.campaign.active)
        return {
          ...initialState,
          tab: "campaignHero",
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

    case "OPEN_ART_MANAGER":
      return { ...state, tab: "artManager" };
    case "SET_CARD_ART": {
      const map = { ...state.imageMap, [action.cardName]: action.objectURL };
      localStorage.setItem("cardImages", JSON.stringify(map));
      return { ...state, imageMap: map };
    }
    case "CLEAR_CARD_ART": {
      const map = { ...state.imageMap };
      delete map[action.cardName];
      localStorage.setItem("cardImages", JSON.stringify(map));
      return { ...state, imageMap: map };
    }

    case "REWARD_BEGIN": {
      // Offer any cards as rewards (including L3+). Choosing an L3+ unlocks it for future campaign drafts.
      return {
        ...state,
        tab: "campaignReward",
        campaign: {
          ...state.campaign,
          rewardsLeft: 3,
          rewardOptions: randomRewardOptions(),
        },
      };
    }

    case "REWARD_PICK": {
      if (state.campaign.rewardsLeft <= 0) return state;
      const chosen = action.card;
      const newDeck = [...state.deckBuilder[1], { ...chosen, id: makeId() }];
      // unlock if Level 3+ and not yet unlocked
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
        return reducer(next, { type: "CAMPAIGN_BUILD_NEXT" });
      }
      return next;
    }

    default:
      return state;
  }
}

/* ───────────────────────── Helpers to start games ───────────────────────── */
function startMulliganFromDecks(state, deck1, deck2, isCampaign) {
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
    tab: "mulligan",
    log: ["— Mulligan — Select cards to replace (each player) —"],
    vsAI: isCampaign ? true : state.vsAI,
  };
}

function endGame(state, winner, isCampaign) {
  if (isCampaign) {
    if (winner === 1)
      return {
        ...state,
        tab: "campaignReward",
        campaign: {
          ...state.campaign,
          rewardsLeft: 3,
          rewardOptions: randomRewardOptions(),
        },
        log: ["🏆 You win! Choose rewards."],
      };
    return {
      ...initialState,
      tab: "campaignHero",
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
    tab: "mainMenu",
    campaign: { ...initialState.campaign, unlocks: loadUnlocks() },
  };
}

/* ───────────────────────── Simple AI ───────────────────────── */
function useSimpleAI(state, dispatch) {
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (
      state.tab !== "game" ||
      !state.vsAI ||
      state.active !== 2 ||
      state.pendingTarget
    )
      return;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const read = () => stateRef.current;

    (async () => {
      if (read().turnCount[2] > 1) {
        dispatch({ type: "DRAW" });
        await wait(180);
      }

      // draw spell first if useful
      {
        const S = read();
        const hand = S.players[2].hand;
        const insight = hand.find(
          (c) => c.effect === "draw2" && c.cost <= S.mana[2]
        );
        if (insight && hand.length <= 2) {
          dispatch({ type: "PLAY_CARD", card: insight });
          await wait(200);
        }
      }
      // zap if target
      {
        const S = read();
        const zap = S.players[2].hand.find(
          (c) => c.effect === "damage2" && c.cost <= S.mana[2]
        );
        if (zap && S.players[1].field.length) {
          dispatch({ type: "PLAY_CARD", card: zap });
          await wait(180);
          const T = read();
          const target = [...T.players[1].field].sort(
            (a, b) => b.atk - a.atk
          )[0];
          if (target) dispatch({ type: "RESOLVE_TARGET", targetId: target.id });
          await wait(160);
        }
      }
      // play a couple cheapest non-target
      for (let i = 0; i < 2; i++) {
        const S = read();
        const playable = [...S.players[2].hand]
          .filter(
            (c) =>
              c.cost <= S.mana[2] &&
              c.effect !== "damage2" &&
              c.effect !== "draw2"
          )
          .sort((a, b) => a.cost - b.cost)[0];
        if (!playable) break;
        dispatch({ type: "PLAY_CARD", card: playable });
        await wait(160);
      }
      // hero power (if not Aura)
      {
        const S = read();
        if (S.power[2] !== "Aura" && !S.powerUsed[2] && S.mana[2] >= 1) {
          dispatch({ type: "HERO_POWER" });
          await wait(140);
        }
      }
      // attacks
      {
        const S = read();
        for (const u of [...S.players[2].field]) {
          const cur = read();
          if (cur.attacked[u.id]) continue;
          const enemies = cur.players[1].field;
          if (!enemies.length) dispatch({ type: "ATTACK_HERO", att: u });
          else
            dispatch({
              type: "ATTACK_UNIT",
              att: u,
              def: [...enemies].sort((a, b) => a.hp - b.hp)[0],
            });
          await wait(140);
        }
      }
      await wait(180);
      dispatch({ type: "END_TURN" });
    })();
  }, [state.tab, state.active, state.vsAI, state.pendingTarget, dispatch]);
}

/* ───────────────────────── Screens ───────────────────────── */
function MainMenu({ onFreeHuman, onFreeAI, onCampaign, onArt }) {
  return (
    <div className="menu">
      <h1>🍹 Beach & Library TCG</h1>
      <div className="menu-buttons">
        <button className="btn primary" onClick={onFreeHuman}>
          Free Play — Human vs Human
        </button>
        <button className="btn" onClick={onFreeAI}>
          Free Play — Human vs AI
        </button>
        <button className="btn ghost" onClick={onCampaign}>
          Campaign
        </button>
        <button className="btn ghost" onClick={onArt}>
          Manage Card Art
        </button>
      </div>
      <p className="muted center">
        Campaign drafts start with Level ≤2 only. Pick higher-level rewards to
        unlock them for all future campaign drafts.
      </p>
    </div>
  );
}

function HeroSelect({ p, heroChosen, onPickHero, onPickPower }) {
  return (
    <div className="menu">
      <h1>Player {p} — Choose Hero</h1>
      {!heroChosen ? (
        <div className="menu-buttons">
          <button className="btn" onClick={() => onPickHero("Library")}>
            Library
          </button>
          <button className="btn" onClick={() => onPickHero("Beach")}>
            Beach
          </button>
        </div>
      ) : (
        <>
          <p className="muted">Pick a power (Aura is passive):</p>
          <div className="menu-buttons">
            <button className="btn" onClick={() => onPickPower("Goer")}>
              Summon Goer (1)
            </button>
            <button className="btn" onClick={() => onPickPower("Lib")}>
              Summon 10 of Lib (1)
            </button>
            <button className="btn" onClick={() => onPickPower("Aura")}>
              Aura (PASSIVE)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DeckBuilder({
  title,
  picks,
  need,
  legalFn,
  onAdd,
  onRemove,
  onNext,
  imageMap,
  pool,
}) {
  const counts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    picks.forEach((x) => c[x.level]++);
    return c;
  }, [picks]);

  return (
    <div className="game">
      <h1 className="title">{title}</h1>
      <Section
        title="Draft"
        right={
          <span className="pill">
            {picks.length}/{need}
          </span>
        }
      >
        {need === 20 ? (
          <>
            <ul className="rules">
              <li>
                Max <b>2</b> copies per card
              </li>
              <li>
                <b>10</b> of L≤2 • <b>6</b> of L3 • <b>4</b> of L4 • <b>1</b> of
                L5
              </li>
            </ul>
            <div className="draft-info">
              <span className="chip">L≤2 {counts[1] + counts[2]}/10</span>
              <span className="chip">L3 {counts[3]}/6</span>
              <span className="chip">L4 {counts[4]}/4</span>
              <span className="chip">L5 {counts[5]}/1</span>
            </div>
          </>
        ) : (
          <p className="muted">
            Campaign start: Level ≤2 only (plus any cards you’ve unlocked).
          </p>
        )}

        <div className="grid">
          {(pool || BASE_CARDS).map((c) => {
            const cnt = picks.filter((x) => x.name === c.name).length;
            const disabled = !legalFn(picks, c);
            return (
              <div key={c.name} className="cardbox">
                <Art name={c.name} imageMap={imageMap} />
                <div className="cardtitle">{c.name}</div>
                <div className="details">
                  L{c.level} • Cost {c.cost}
                  {c.type === "unit" ? ` • ${c.atk}/${c.hp}` : " • Spell"}
                </div>
                <div className="keyword">{c.keyword}</div>
                <div className="stats">{cnt}/2</div>
                <div className="row gap">
                  <button
                    className="btn small"
                    disabled={disabled}
                    onClick={() => onAdd({ ...c, id: makeId() })}
                  >
                    +
                  </button>
                  <button
                    className="btn small ghost"
                    disabled={!cnt}
                    onClick={() =>
                      onRemove(picks.find((x) => x.name === c.name))
                    }
                  >
                    –
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="row center" style={{ marginTop: 12 }}>
          <button
            className="btn primary"
            disabled={picks.length !== need}
            onClick={onNext}
          >
            {picks.length === need ? "Continue" : `Pick ${need - picks.length}`}
          </button>
        </div>
      </Section>
    </div>
  );
}

function MulliganScreen({ p, hand, onToggle, selected, onConfirm, imageMap }) {
  return (
    <div className="game">
      <h1 className="title">Mulligan — Player {p}</h1>
      <Section title="Select cards to replace (once)">
        <div className="grid hand">
          {hand.map((c) => {
            const sel = selected.has(c.id);
            return (
              <div key={c.id} className={`cardbox ${sel ? "selected" : ""}`}>
                <Art name={c.name} imageMap={imageMap} />
                <div className="cardtitle">{c.name}</div>
                <div className="details">
                  {c.type === "unit" ? `${c.atk}/${c.hp}` : "Spell"} • Cost{" "}
                  {c.cost}
                </div>
                <button className="btn" onClick={() => onToggle(c.id)}>
                  {sel ? "Unselect" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
        <div className="row center" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={onConfirm}>
            Confirm Mulligan
          </button>
        </div>
      </Section>
    </div>
  );
}

function RewardScreen({ rewardsLeft, options, onPick, imageMap }) {
  return (
    <div className="menu">
      <h1>Victory Rewards</h1>
      <p className="center muted">
        Choose 1 to add to your deck. Picks remaining: {rewardsLeft}
      </p>
      <div className="grid hand" style={{ maxWidth: 900, margin: "0 auto" }}>
        {options.map((opt) => (
          <div key={opt.id} className="cardbox">
            <Art name={opt.name} imageMap={imageMap} />
            <div className="cardtitle">{opt.name}</div>
            <div className="details">
              L{opt.level} • Cost {opt.cost}
              {opt.type === "unit" ? ` • ${opt.atk}/${opt.hp}` : " • Spell"}
            </div>
            <div className="keyword">{opt.keyword}</div>
            <button className="btn" onClick={() => onPick(opt)}>
              Take
            </button>
          </div>
        ))}
      </div>
      <p className="muted center" style={{ marginTop: 8 }}>
        Picking a Level 3+ card unlocks it permanently for future campaign
        drafts.
      </p>
    </div>
  );
}

function ArtManager({ imageMap, onSet, onClear, onBack }) {
  const names = [...new Set(BASE_CARDS.map((c) => c.name))].sort();
  return (
    <div className="menu">
      <h1>Art Manager</h1>
      <p className="muted center">
        Upload images for cards (persisted in your browser).
      </p>
      <div className="grid hand" style={{ maxWidth: 1000, margin: "0 auto" }}>
        {names.map((n) => (
          <div key={n} className="cardbox">
            <Art name={n} imageMap={imageMap} />
            <div className="cardtitle">{n}</div>
            <div className="row">
              <label className="btn small" style={{ cursor: "pointer" }}>
                Upload
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    onSet(n, url);
                  }}
                />
              </label>
              <button className="btn small ghost" onClick={() => onClear(n)}>
                Clear
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="row center" style={{ marginTop: 12 }}>
        <button className="btn primary" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function GameView({ state, dispatch }) {
  const { players, active, power, imageMap } = state;
  const opp = 3 - active;

  // win/lose overlay
  if (players[1].life <= 0 || players[2].life <= 0) {
    const winner = players[1].life <= 0 ? 2 : 1;
    const onContinue = () => {
      if (state.campaign.active) {
        if (winner === 1) dispatch({ type: "REWARD_BEGIN" });
        else dispatch({ type: "FORFEIT" });
      } else {
        dispatch({ type: "MAIN_MENU" });
      }
    };
    return (
      <div className="menu">
        <h1>{winner === 1 ? "🏆 You Win!" : "💀 You Lose"}</h1>
        <button className="btn primary" onClick={onContinue}>
          {state.campaign.active
            ? winner === 1
              ? "Choose Rewards"
              : "Restart Campaign"
            : "Main Menu"}
        </button>
      </div>
    );
  }

  return (
    <div className="game">
      <h1 className="title">Draft Duel</h1>

      {/* Target overlay */}
      {state.pendingTarget && (
        <div className="overlay">
          <h3>Choose a unit for {state.pendingTarget.card.name}</h3>
          <div className="grid">
            {players[opp].field.map((u) => (
              <button
                className="btn"
                key={u.id}
                onClick={() =>
                  dispatch({ type: "RESOLVE_TARGET", targetId: u.id })
                }
              >
                {u.name} {u.atk}/{u.hp}
              </button>
            ))}
          </div>
        </div>
      )}

      <Header
        turn={state.turnCount[active]}
        active={active}
        mana={state.mana[active]}
        deck1={players[1].deck.length}
        deck2={players[2].deck.length}
        life1={players[1].life}
        life2={players[2].life}
        power={power[active]}
        onHeroPower={() => dispatch({ type: "HERO_POWER" })}
        onEndTurn={() => dispatch({ type: "END_TURN" })}
        onForfeit={() => dispatch({ type: "FORFEIT" })}
      />

      <Section title="Opponent Field">
        <FieldPanel
          field={players[opp].field}
          isActive={false}
          attacked={{}}
          opponentField={[]}
          imageMap={imageMap}
        />
      </Section>

      <Section
        title="Your Field"
        right={<span className="chip">Hand {players[active].hand.length}</span>}
      >
        <FieldPanel
          field={players[active].field}
          isActive
          attacked={state.attacked}
          opponentField={players[opp].field}
          active={active}
          turn={state.turnCount[active]}
          imageMap={imageMap}
          onAttackUnit={(a, d) =>
            dispatch({ type: "ATTACK_UNIT", att: a, def: d })
          }
          onAttackHero={(a) => dispatch({ type: "ATTACK_HERO", att: a })}
        />
      </Section>

      <Section title="Your Hand">
        <Hand
          cards={players[active].hand}
          onPlay={(c) => dispatch({ type: "PLAY_CARD", card: c })}
          mana={state.mana[active]}
          imageMap={imageMap}
        />
      </Section>

      {/* optional action log could be placed here */}
    </div>
  );
}

/* ───────────────────────── App ───────────────────────── */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  useSimpleAI(state, dispatch);

  // auto draw after first turn
  useEffect(() => {
    if (state.tab === "game" && state.turnCount[state.active] > 1)
      dispatch({ type: "DRAW" });
  }, [state.active, state.turnCount, state.tab, dispatch]);

  // main router
  if (state.tab === "mainMenu")
    return (
      <MainMenu
        onFreeHuman={() => dispatch({ type: "FREEPLAY_HUMAN" })}
        onFreeAI={() => dispatch({ type: "FREEPLAY_AI" })}
        onCampaign={() => dispatch({ type: "CAMPAIGN_START" })}
        onArt={() => dispatch({ type: "OPEN_ART_MANAGER" })}
      />
    );

  if (state.tab === "artManager")
    return (
      <ArtManager
        imageMap={state.imageMap}
        onSet={(name, url) =>
          dispatch({ type: "SET_CARD_ART", cardName: name, objectURL: url })
        }
        onClear={(name) => dispatch({ type: "CLEAR_CARD_ART", cardName: name })}
        onBack={() => dispatch({ type: "MAIN_MENU" })}
      />
    );

  if (state.tab === "campaignHero") {
    const p = 1;
    return (
      <HeroSelect
        p={p}
        heroChosen={!!state.hero[p]}
        onPickHero={(hero) => dispatch({ type: "SELECT_HERO", hero })}
        onPickPower={(power) => dispatch({ type: "SELECT_HERO", power })}
      />
    );
  }

  if (state.tab === "campaignDraft") {
    const p = 1,
      picks = state.deckBuilder[p];
    const pool = campaignDraftPool(state.campaign.unlocks); // ≤L2 + unlocked
    return (
      <DeckBuilder
        title="Campaign Draft — Pick 10"
        picks={picks}
        need={10}
        legalFn={legalToAdd10}
        pool={pool}
        onAdd={(card) => dispatch({ type: "ADD_TO_DECK", card })}
        onRemove={(card) => dispatch({ type: "REMOVE_FROM_DECK", card })}
        onNext={() => dispatch({ type: "NEXT_DRAFT" })}
        imageMap={state.imageMap}
      />
    );
  }

  if (state.tab === "heroSelect") {
    const p = state.dbCurrent;
    return (
      <HeroSelect
        p={p}
        heroChosen={!!state.hero[p]}
        onPickHero={(hero) => dispatch({ type: "SELECT_HERO", hero })}
        onPickPower={(power) => dispatch({ type: "SELECT_HERO", power })}
      />
    );
  }

  if (state.tab === "deckBuilder") {
    const p = state.dbCurrent,
      picks = state.deckBuilder[p];
    return (
      <DeckBuilder
        title={`Deck Builder — Player ${p}`}
        picks={picks}
        need={20}
        legalFn={legalToAdd20}
        pool={BASE_CARDS}
        onAdd={(card) => dispatch({ type: "ADD_TO_DECK", card })}
        onRemove={(card) => dispatch({ type: "REMOVE_FROM_DECK", card })}
        onNext={() => dispatch({ type: "NEXT_DRAFT" })}
        imageMap={state.imageMap}
      />
    );
  }

  if (state.tab === "mulligan") {
    const p = state.active;
    return (
      <MulliganScreen
        p={p}
        hand={state.players[p].hand}
        selected={state.mullSel[p]}
        imageMap={state.imageMap}
        onToggle={(id) => dispatch({ type: "MULL_TOGGLE", p, id })}
        onConfirm={() => dispatch({ type: "MULL_CONFIRM", p })}
      />
    );
  }

  if (state.tab === "campaignReward") {
    const { rewardsLeft, rewardOptions } = state.campaign;
    return (
      <RewardScreen
        rewardsLeft={rewardsLeft}
        options={rewardOptions}
        imageMap={state.imageMap}
        onPick={(card) => dispatch({ type: "REWARD_PICK", card })}
      />
    );
  }

  if (state.tab === "game")
    return <GameView state={state} dispatch={dispatch} />;

  return null;
}
