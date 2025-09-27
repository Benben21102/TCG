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
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: sel ? '2px solid #1976d2' : undefined,
                  borderRadius: 8,
                }}
              >
                <TradingCard card={c} imageUrl={imageMap[c.name]} />
                <button className="btn" style={{ marginTop: 8 }} onClick={() => onToggle(c.id!)}>
                  {sel ? 'Unselect' : 'Select'}
                </button>
              </div>
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
