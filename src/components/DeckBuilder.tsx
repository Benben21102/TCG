import React, { useMemo } from 'react';
import { Card } from '../types';
import { Box, Typography, Button, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { TradingCard } from './TradingCard';

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
  // Calculate counts by level for deckbuilding rules
  const counts = useMemo(() => {
    const byLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    picks.forEach((c) => {
      if (c.level && byLevel[c.level] !== undefined) byLevel[c.level]++;
    });
    return byLevel;
  }, [picks]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 700 }}>
        {title}
      </Typography>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Draft</Typography>
          <Chip label={`${picks.length}/${need}`} color="primary" sx={{ fontWeight: 700 }} />
        </Box>
        {need === 20 ? (
          <>
            <Box component="ul" sx={{ color: '#8fa1c1', mb: 2, pl: 3 }}>
              <li>
                Max <b>2</b> copies per card
              </li>
              <li>
                <b>10</b> of L≤2 • <b>6</b> of L3 • <b>4</b> of L4 • <b>1</b> of L5
              </li>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip label={`L≤2 ${counts[1] + counts[2]}/10`} color="info" />
              <Chip label={`L3 ${counts[3]}/6`} color="info" />
              <Chip label={`L4 ${counts[4]}/4`} color="info" />
              <Chip label={`L5 ${counts[5]}/1`} color="info" />
            </Box>
          </>
        ) : (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Campaign start: Level ≤2 only (plus any cards you’ve unlocked).
          </Typography>
        )}
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
          {(pool || []).map((c) => {
            const cnt = picks.filter((x) => x.name === c.name).length;
            const disabled = !legalFn(picks, c);
            return (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'center' }}>
                <TradingCard
                  card={c}
                  imageUrl={imageMap[c.name]}
                  count={cnt}
                  onAdd={() => onAdd({ ...c, id: Math.random() })}
                  onRemove={() => onRemove(picks.find((x) => x.name === c.name)!)}
                  disabledAdd={disabled}
                  disabledRemove={!cnt}
                />
              </div>
            );
          })}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={picks.length !== need}
            onClick={onNext}
            sx={{ fontWeight: 700, px: 4 }}
          >
            {picks.length === need ? 'Continue' : `Pick ${need - picks.length}`}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
