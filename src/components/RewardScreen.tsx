import React from "react";
import { Card } from "../types";
import { Art } from "./Art";

type RewardScreenProps = {
  rewardsLeft: number;
  options: Card[];
  onPick: (card: Card) => void;
  imageMap: Record<string, string>;
};

export function RewardScreen({ rewardsLeft, options, onPick, imageMap }: RewardScreenProps) {
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
        Picking a Level 3+ card unlocks it permanently for future campaign drafts.
      </p>
    </div>
  );
}
