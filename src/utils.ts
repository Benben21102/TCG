// Utility functions for TCG app
import { Card } from "./types";

export let nextId = 1;
export const makeId = (): number => nextId++;
export const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

export const damageAfterVanguard = (dmg: number, def: Card, isAttack: boolean): number =>
  def.keyword === "Vanguard" && isAttack ? Math.max(0, dmg - 1) : dmg;

export const keywordHelp = (k: string): string =>
  k === "Rush"
    ? "Can attack the turn it is summoned."
    : k === "Vanguard"
    ? "Takes 1 less damage when defending."
    : k === "Lifesteal"
    ? "Heals your hero equal to damage dealt."
    : "";
