import React from 'react';
import { Card } from '../types';
import { Box, Paper } from '@mui/material';
import { BASE_CARDS } from '../constants';

export type TradingCardProps = {
  card: Card;
  imageUrl?: string;
  count?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  disabledAdd?: boolean;
  disabledRemove?: boolean;
};

export function TradingCard({
  card,
  imageUrl,
  count,
  onAdd,
  onRemove,
  disabledAdd,
  disabledRemove,
}: TradingCardProps) {
  // Compute image path from card name (use exact name)
  const artFile = `/cardArt/${card.name}.png`;
  const fallbackArt = '/cardArt/default.png';
  const [imgSrc, setImgSrc] = React.useState(imageUrl || artFile);
  const handleImgError = () => setImgSrc(fallbackArt);

  // Find base card for comparison
  const base = React.useMemo(() => BASE_CARDS.find((b: Card) => b.name === card.name), [card.name]);
  const showAtk =
    card.type === 'unit' &&
    base &&
    card.atk !== undefined &&
    base.atk !== undefined &&
    card.atk !== base.atk;
  const showHp =
    card.type === 'unit' &&
    base &&
    card.hp !== undefined &&
    base.hp !== undefined &&
    card.hp !== base.hp;

  return (
    <Paper
      elevation={6}
      sx={{
        width: 200,
        minHeight: 300,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        background: '#222',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
        border: '2.5px solid #bfa76a',
        p: 0,
        m: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: 300 }}>
        <img
          src={imgSrc}
          alt={card.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 10,
            display: 'block',
          }}
          onError={handleImgError}
        />
        {/* Overlay atk/hp if changed, styled to match TCG look */}
        {showAtk && (
          <Box
            sx={{
              position: 'absolute',
              left: 10,
              bottom: 10,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 1,
              px: 1.2,
              py: 0.2,
              fontWeight: 900,
              color: (card.atk ?? 0) > (base?.atk ?? 0) ? '#388e3c' : '#b71c1c',
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '2px solid #222',
              minWidth: 32,
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            {card.atk}
          </Box>
        )}
        {showHp && (
          <Box
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              background: 'rgba(255,255,255,0.92)',
              borderRadius: 1,
              px: 1.2,
              py: 0.2,
              fontWeight: 900,
              color: (card.hp ?? 0) > (base?.hp ?? 0) ? '#388e3c' : '#b71c1c',
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              border: '2px solid #222',
              minWidth: 32,
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            {card.hp}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
