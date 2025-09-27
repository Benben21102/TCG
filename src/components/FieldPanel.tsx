import React from "react";
import { Card } from "../types";
import { Art } from "./Art";
import { keywordHelp } from "../utils";

type FieldPanelProps = {
  field: Card[];
  isActive: boolean;
  attacked: Record<number, boolean>;
  opponentField: Card[];
  onAttackUnit?: (a: Card, d: Card) => void;
  onAttackHero?: (a: Card) => void;
  active?: number;
  turn?: number;
  imageMap: Record<string, string>;
};

export function FieldPanel({
  field,
  isActive,
  attacked,
  opponentField,
  onAttackUnit,
  onAttackHero,
  active,
  turn,
  imageMap,
}: FieldPanelProps) {
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
                onClick={() => onAttackHero && onAttackHero(c)}
                disabled={
                  attacked[c.id!] ||
                  (opponentField.length > 0 && c.keyword !== "Rush")
                }
              >
                Hit Hero
              </button>
              {opponentField.map((d) => (
                <button
                  className="btn small"
                  key={d.id}
                  onClick={() => onAttackUnit && onAttackUnit(c, d)}
                  disabled={attacked[c.id!]}
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
