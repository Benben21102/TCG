import React from "react";

type MainMenuProps = {
  onFreeHuman: () => void;
  onFreeAI: () => void;
  onCampaign: () => void;
  onArt: () => void;
};

export function MainMenu({ onFreeHuman, onFreeAI, onCampaign, onArt }: MainMenuProps) {
  return (
    <div className="menu">
      <h1>🍹 Beach & Library TCG</h1>
      <div className="menu-buttons">
        <button className="btn primary" onClick={onFreeHuman}>
          Free Play — Human vs Human
        </button>
        <button className="btn" onClick={onFreeAI}>
          Free Play — Human vs AI
        </button>
        <button className="btn ghost" onClick={onCampaign}>
          Campaign
        </button>
        <button className="btn ghost" onClick={onArt}>
          Manage Card Art
        </button>
      </div>
      <p className="muted center">
        Campaign drafts start with Level ≤2 only. Pick higher-level rewards to
        unlock them for all future campaign drafts.
      </p>
    </div>
  );
}
