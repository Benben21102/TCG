import React from 'react';
import { State, Action } from '../types';
import { Header } from './Header';
import { FieldPanel } from './FieldPanel';
import { Hand } from './Hand';
import { LogPanel } from './LogPanel';

export function GameView({ state, dispatch }: { state: State; dispatch: React.Dispatch<Action> }) {
  const p = state.active;
  const op = 3 - p;
  const player = state.players[p];
  const opponent = state.players[op];

  // Helper to handle end turn and draw
  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
    dispatch({ type: 'DRAW' });
  };

  return (
    <div className="game">
      <Header
        turn={state.turnCount[p]}
        active={p}
        mana={state.mana[p]}
        deck1={state.players[1].deck.length}
        deck2={state.players[2].deck.length}
        life1={state.players[1].life}
        life2={state.players[2].life}
        power={state.power[p]}
        onHeroPower={() => dispatch({ type: 'HERO_POWER' })}
        onEndTurn={handleEndTurn}
        onForfeit={() => dispatch({ type: 'FORFEIT' })}
      />
      <div className="flex" style={{ gap: 24 }}>
        <div style={{ flex: 2 }}>
          <h3>Opponent Field</h3>
          <FieldPanel
            field={opponent.field}
            isActive={false}
            attacked={{}}
            opponentField={player.field}
            imageMap={state.imageMap}
          />
          <h3>Your Field</h3>
          <FieldPanel
            field={player.field}
            isActive={true}
            attacked={state.attacked}
            opponentField={opponent.field}
            onAttackUnit={(a, d) => dispatch({ type: 'ATTACK_UNIT', att: a, def: d })}
            onAttackHero={(a) => dispatch({ type: 'ATTACK_HERO', att: a })}
            active={p}
            turn={state.turnCount[p]}
            imageMap={state.imageMap}
          />
          <h3>Your Hand</h3>
          <Hand
            cards={player.hand}
            onPlay={(c) => dispatch({ type: 'PLAY_CARD', card: c })}
            mana={state.mana[p]}
            imageMap={state.imageMap}
          />
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <LogPanel log={state.log} />
        </div>
      </div>
    </div>
  );
}
