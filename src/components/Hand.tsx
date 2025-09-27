import React from 'react';
import { Card } from '../types';
import Grid from '@mui/material/Grid';
import { TradingCard } from './TradingCard';

type HandProps = {
  cards: Card[];
  onPlay: (c: Card) => void;
  mana: number;
  imageMap: Record<string, string>;
};

export function Hand({ cards, onPlay, mana, imageMap }: HandProps) {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        mt: 2,
        mb: 2,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        justifyContent: 'center',
      }}
    >
      {cards.map((c) => (
        <div key={c.id} style={{ display: 'flex', justifyContent: 'center' }}>
          <TradingCard
            card={c}
            imageUrl={imageMap[c.name]}
            onAdd={() => onPlay(c)}
            disabledAdd={c.cost > mana}
          />
        </div>
      ))}
    </Grid>
  );
}
