import React, { useMemo } from "react";
import { Card } from "../types";
import { Section } from "./Section";
import { Art } from "./Art";

type DeckBuilderProps = {
  title: string;
  picks: Card[];
  need: number;
  legalFn: (deck: Card[], card: Card) => boolean;
  onAdd: (card: Card) => void;
  onRemove: (card: Card) => void;
  onNext: () => void;
  imageMap: Record<string, string>;
  pool?: Card[];
};

export function DeckBuilder({
  title,
  picks,
  need,
  legalFn,
  onAdd,
  onRemove,
  onNext,
  imageMap,
  pool,
}: DeckBuilderProps) {
  const counts = useMemo(() => {
    const c: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    picks.forEach((x) => c[x.level]++);
    return c;
  }, [picks]);

  return (
    <div className="game">
      <h1 className="title">{title}</h1>
      <Section
        title="Draft"
        right={<span className="pill">{picks.length}/{need}</span>}
      >
        {need === 20 ? (
          <>
            <ul className="rules">
              <li>Max <b>2</b> copies per card</li>
              <li><b>10</b> of L≤2 • <b>6</b> of L3 • <b>4</b> of L4 • <b>1</b> of L5</li>
            </ul>
            <div className="draft-info">
              <span className="chip">L≤2 {counts[1] + counts[2]}/10</span>
              <span className="chip">L3 {counts[3]}/6</span>
              <span className="chip">L4 {counts[4]}/4</span>
              <span className="chip">L5 {counts[5]}/1</span>
            </div>
          </>
        ) : (
          <p className="muted">Campaign start: Level ≤2 only (plus any cards you’ve unlocked).</p>
        )}
        <div className="grid">
          {(pool || []).map((c) => {
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
                  <button className="btn small" disabled={disabled} onClick={() => onAdd({ ...c, id: Math.random() })}>+</button>
                  <button className="btn small ghost" disabled={!cnt} onClick={() => onRemove(picks.find((x) => x.name === c.name)!)}>–</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="row center" style={{ marginTop: 12 }}>
          <button className="btn primary" disabled={picks.length !== need} onClick={onNext}>
            {picks.length === need ? "Continue" : `Pick ${need - picks.length}`}
          </button>
        </div>
      </Section>
    </div>
  );
}
