import React from "react";

type HeaderProps = {
  turn: number;
  active: number;
  mana: number;
  deck1: number;
  deck2: number;
  life1: number;
  life2: number;
  power: string | null;
  onHeroPower: () => void;
  onEndTurn: () => void;
  onForfeit: () => void;
};

export function Header({
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
}: HeaderProps) {
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
