import React from "react";

type HeroSelectProps = {
  p: number;
  heroChosen: boolean;
  onPickHero: (h: string) => void;
  onPickPower: (p: string) => void;
};

export function HeroSelect({ p, heroChosen, onPickHero, onPickPower }: HeroSelectProps) {
  return (
    <div className="menu">
      <h1>Player {p} — Choose Hero</h1>
      {!heroChosen ? (
        <div className="menu-buttons">
          <button className="btn" onClick={() => onPickHero("Library")}>Library</button>
          <button className="btn" onClick={() => onPickHero("Beach")}>Beach</button>
        </div>
      ) : (
        <>
          <p className="muted">Pick a power (Aura is passive):</p>
          <div className="menu-buttons">
            <button className="btn" onClick={() => onPickPower("Goer")}>Summon Goer (1)</button>
            <button className="btn" onClick={() => onPickPower("Lib")}>Summon 10 of Lib (1)</button>
            <button className="btn" onClick={() => onPickPower("Aura")}>Aura (PASSIVE)</button>
          </div>
        </>
      )}
    </div>
  );
}
