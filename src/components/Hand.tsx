import React from "react";
import { Card } from "../types";
import { Art } from "./Art";

type HandProps = {
  cards: Card[];
  onPlay: (c: Card) => void;
  mana: number;
  imageMap: Record<string, string>;
};

export function Hand({ cards, onPlay, mana, imageMap }: HandProps) {
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
