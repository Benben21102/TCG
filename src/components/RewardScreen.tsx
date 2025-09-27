import React from 'react';
import { Card } from '../types';
import Grid from '@mui/material/Grid';
import { TradingCard } from './TradingCard';

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
      <p className="center muted">Choose 1 to add to your deck. Picks remaining: {rewardsLeft}</p>
      <Grid
        container
        spacing={2}
        sx={{
          maxWidth: 900,
          margin: '0 auto',
          mt: 2,
          mb: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr',
          },
          justifyContent: 'center',
        }}
      >
        {options.map((opt) => (
          <div
            key={opt.id}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <TradingCard card={opt} imageUrl={imageMap[opt.name]} />
            <button className="btn" style={{ marginTop: 8 }} onClick={() => onPick(opt)}>
              Take
            </button>
          </div>
        ))}
      </Grid>
      <p className="muted center" style={{ marginTop: 8 }}>
        Picking a Level 3+ card unlocks it permanently for future campaign drafts.
      </p>
    </div>
  );
}
