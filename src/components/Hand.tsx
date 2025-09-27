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
      {cards.map((c) => {
        const disabled = c.cost > mana;
        return (
          <button
            key={c.id}
            style={{
              display: 'flex',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: disabled ? 'not-allowed' : 'pointer',
              outline: 'none',
              borderRadius: 12,
              boxShadow: !disabled ? '0 0 0 3px #ffd56a' : undefined,
              opacity: disabled ? 0.5 : 1,
              transition: 'box-shadow 0.2s, opacity 0.2s',
            }}
            onClick={() => !disabled && onPlay(c)}
            disabled={disabled}
            tabIndex={0}
            aria-label={disabled ? `${c.name} (not enough mana)` : `Play ${c.name}`}
          >
            <TradingCard card={c} imageUrl={imageMap[c.name]} />
          </button>
        );
      })}
    </Grid>
  );
}
