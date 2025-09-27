import React from "react";
import { Art } from "./Art";
import { Card } from "../types";

type ArtManagerProps = {
  imageMap: Record<string, string>;
  onSet: (name: string, url: string) => void;
  onClear: (name: string) => void;
  onBack: () => void;
};

export function ArtManager({ imageMap, onSet, onClear, onBack }: ArtManagerProps) {
  // For demo, use a static list. In real app, use BASE_CARDS
  const names = [
    "Purple Rain", "Book Rust", "10 of Lib", "Coconut Champ", "Beach Goer",
    "Jack Knight", "Lifesteal Book", "Blue Lagoon", "Beach Goer 2", "Stackways",
    "Beach Goer 3", "Mango Warrior", "Zap!", "Insight", "Queens Knight",
    "Tequila Sunrise", "Banana Brawlers", "Electra", "Edgar", "Beach Brawlers",
    "Beatrice", "Mad Hatter", "Guardbook", "Grave Recall", "Dante", "Pineapple Man"
  ];
  return (
    <div className="menu">
      <h1>Art Manager</h1>
      <p className="muted center">Upload images for cards (persisted in your browser).</p>
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
                    const file = (e.target.files && e.target.files[0]) || null;
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
