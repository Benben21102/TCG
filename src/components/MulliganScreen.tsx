import React from "react";
import { Card } from "../types";
import { Section } from "./Section";
import { Art } from "./Art";

type MulliganScreenProps = {
  p: number;
  hand: Card[];
  onToggle: (id: number) => void;
  selected: Set<number>;
  onConfirm: () => void;
  imageMap: Record<string, string>;
};

export function MulliganScreen({ p, hand, onToggle, selected, onConfirm, imageMap }: MulliganScreenProps) {
  return (
    <div className="game">
      <h1 className="title">Mulligan — Player {p}</h1>
      <Section title="Select cards to replace (once)">
        <div className="grid hand">
          {hand.map((c) => {
            const sel = selected.has(c.id!);
            return (
              <div key={c.id} className={`cardbox ${sel ? "selected" : ""}`}>
                <Art name={c.name} imageMap={imageMap} />
                <div className="cardtitle">{c.name}</div>
                <div className="details">
                  {c.type === "unit" ? `${c.atk}/${c.hp}` : "Spell"} • Cost {c.cost}
                </div>
                <button className="btn" onClick={() => onToggle(c.id!)}>
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
