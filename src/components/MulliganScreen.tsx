import React from 'react';
import { Card } from '../types';
import { Section } from './Section';
import Grid from '@mui/material/Grid';
import { TradingCard } from './TradingCard';

type MulliganScreenProps = {
  p: number;
  hand: Card[];
  onToggle: (id: number) => void;
  selected: Set<number>;
  onConfirm: () => void;
  imageMap: Record<string, string>;
};

export function MulliganScreen({
  p,
  hand,
  onToggle,
  selected,
  onConfirm,
  imageMap,
}: MulliganScreenProps) {
  return (
    <div className="game">
      <h1 className="title">Mulligan — Player {p}</h1>
      <Section title="Select cards to replace (once)">
        <Grid
          container
          spacing={2}
          sx={{
            mt: 1,
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
          {hand.map((c) => {
            const sel = selected.has(c.id!);
            return (
              <button
                key={c.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: sel ? '3px solid #1976d2' : '2px solid transparent',
                  borderRadius: 12,
                  background: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: sel ? '0 0 0 3px #90caf9' : undefined,
                  transition: 'box-shadow 0.2s, border 0.2s',
                }}
                onClick={() => onToggle(c.id!)}
                tabIndex={0}
                aria-label={sel ? `Unselect ${c.name}` : `Select ${c.name}`}
              >
                <TradingCard card={c} imageUrl={imageMap[c.name]} />
              </button>
            );
          })}
        </Grid>
        <div className="row center" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={onConfirm}>
            Confirm Mulligan
          </button>
        </div>
      </Section>
    </div>
  );
}
