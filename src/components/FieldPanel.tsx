import React from 'react';
import { Card } from '../types';
import Grid from '@mui/material/Grid';
import { TradingCard } from './TradingCard';
import { keywordHelp } from '../utils';

type FieldPanelProps = {
  field: Card[];
  isActive: boolean;
  attacked: Record<number, boolean>;
  opponentField: Card[];
  onAttackUnit?: (a: Card, d: Card) => void;
  onAttackHero?: (a: Card) => void;
  active?: number;
  turn?: number;
  imageMap: Record<string, string>;
};

export function FieldPanel({
  field,
  isActive,
  attacked,
  opponentField,
  onAttackUnit,
  onAttackHero,
  active,
  turn,
  imageMap,
}: FieldPanelProps) {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        mt: 1,
        mb: 2,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
        justifyContent: 'center',
      }}
    >
      {field.map((c) => (
        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TradingCard card={c} imageUrl={imageMap[c.name]} />
          <div
            style={{
              marginTop: 8,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{ fontSize: 12, color: '#7a5c1b', marginBottom: 4 }}
              title={keywordHelp(c.keyword)}
            >
              {c.keyword}
            </div>
            <div style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>
              ATK {c.atk} &nbsp;|&nbsp; HP {c.hp}
            </div>
            {isActive && !(turn === 1 && active === 1) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  className="btn small"
                  onClick={() => onAttackHero && onAttackHero(c)}
                  disabled={attacked[c.id!] || (opponentField.length > 0 && c.keyword !== 'Rush')}
                >
                  Hit Hero
                </button>
                {opponentField.map((d) => (
                  <button
                    className="btn small"
                    key={d.id}
                    onClick={() => onAttackUnit && onAttackUnit(c, d)}
                    disabled={attacked[c.id!]}
                  >
                    Hit {d.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </Grid>
  );
}
