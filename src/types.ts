// Shared type definitions for the TCG app

export type Card = {
  name: string;
  cost: number;
  type: string;
  atk?: number;
  hp?: number;
  keyword: string;
  level: number;
  effect?: string;
  id?: number;
};

export type Player = {
  deck: Card[];
  hand: Card[];
  field: Card[];
  life: number;
  extra: Card[];
  grave: Card[];
};

export type State = {
  tab: string;
  hero: { [key: number]: string | null };
  power: { [key: number]: string | null };
  dbCurrent: number;
  deckBuilder: { [key: number]: Card[] };
  players: { [key: number]: Player };
  active: number;
  turnCount: { [key: number]: number };
  mana: { [key: number]: number };
  attacked: Record<number, boolean>;
  attackCount: { [key: number]: number };
  powerUsed: { [key: number]: boolean };
  pendingTarget: any;
  showLog: boolean;
  log: string[];
  vsAI: boolean;
  campaign: any;
  mullSel: { [key: number]: Set<number> };
  imageMap: Record<string, string>;
};

export type Action = { type: string; [key: string]: any };
