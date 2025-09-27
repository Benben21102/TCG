import React from 'react';
import { Card } from '../types';
import { Box, Paper, Typography, Chip } from '@mui/material';

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
  return (
    <Paper
      elevation={6}
      sx={{
        width: 200,
        minHeight: 300,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(180deg, #f8e8c8 0%, #e0c080 100%)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
        border: '2.5px solid #bfa76a',
        p: 1.5,
        m: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '92%',
          height: 110,
          background: imageUrl ? `url(${imageUrl}) center/cover` : '#d8d8d8',
          borderRadius: 2,
          border: '1.5px solid #bfa76a',
          mt: 1,
          mb: 1,
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
        {card.name}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
        <Chip label={`Lv.${card.level}`} size="small" color="warning" />
        <Chip label={`Cost ${card.cost}`} size="small" color="info" />
        {card.type === 'unit' && (
          <Chip label={`${card.atk}/${card.hp}`} size="small" color="success" />
        )}
        {card.type === 'spell' && <Chip label="Spell" size="small" color="primary" />}
      </Box>
      <Typography variant="body2" sx={{ color: '#7a5c1b', fontStyle: 'italic', mb: 0.5 }}>
        {card.keyword}
      </Typography>
      {typeof count === 'number' && (
        <Typography variant="caption" sx={{ color: '#bfa76a', mb: 1 }}>
          {count}/2
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, mt: 'auto', mb: 1 }}>
        {onAdd && (
          <button className="btn small" disabled={disabledAdd} onClick={onAdd}>
            +
          </button>
        )}
        {onRemove && (
          <button className="btn small ghost" disabled={disabledRemove} onClick={onRemove}>
            –
          </button>
        )}
      </Box>
    </Paper>
  );
}
