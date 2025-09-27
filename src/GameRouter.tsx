import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { MainMenu } from './components/MainMenu';
import { ArtManager } from './components/ArtManager';
import { HeroSelect } from './components/HeroSelect';
import { DeckBuilder } from './components/DeckBuilder';
import { MulliganScreen } from './components/MulliganScreen';
import { RewardScreen } from './components/RewardScreen';
import { GameView } from './components/GameView';
import { legalToAdd10, legalToAdd20 } from './state/helpers';
import { campaignDraftPool } from './state/campaign';
import { BASE_CARDS } from './constants';
import {
  mainMenu,
  freeplayHuman,
  freeplayAI,
  campaignStart,
  selectHero,
  addToDeck,
  removeFromDeck,
  nextDraft,
  openArtManager,
  setCardArt,
  clearCardArt,
  rewardPick,
  mullToggle,
  mullConfirm,
} from './features/gameSlice';
import type { Card } from './types';

export default function GameRouter() {
  const state = useSelector((s: RootState) => s.game);
  const dispatch = useDispatch();

  if (state.tab === 'mainMenu')
    return (
      <MainMenu
        onFreeHuman={() => dispatch(freeplayHuman())}
        onFreeAI={() => dispatch(freeplayAI())}
        onCampaign={() => dispatch(campaignStart())}
        onArt={() => dispatch(openArtManager())}
      />
    );

  if (state.tab === 'artManager')
    return (
      <ArtManager
        imageMap={state.imageMap}
        onSet={(name, url) => dispatch(setCardArt({ cardName: name, objectURL: url }))}
        onClear={(name) => dispatch(clearCardArt({ cardName: name }))}
        onBack={() => dispatch(mainMenu())}
      />
    );

  if (state.tab === 'campaignHero') {
    const p = 1;
    return (
      <HeroSelect
        p={p}
        heroChosen={!!state.hero[p]}
        onPickHero={(hero) => dispatch(selectHero({ hero }))}
        onPickPower={(power) => dispatch(selectHero({ power }))}
      />
    );
  }

  if (state.tab === 'campaignDraft') {
    const p = 1,
      picks = state.deckBuilder[p];
    const pool = campaignDraftPool(state.campaign.unlocks);
    return (
      <DeckBuilder
        title="Campaign Draft — Pick 10"
        picks={picks}
        need={10}
        legalFn={legalToAdd10}
        pool={pool}
        onAdd={(card) => dispatch(addToDeck(card))}
        onRemove={(card) => dispatch(removeFromDeck(card))}
        onNext={() => dispatch(nextDraft())}
        imageMap={state.imageMap}
      />
    );
  }

  if (state.tab === 'heroSelect') {
    const p = state.dbCurrent;
    return (
      <HeroSelect
        p={p}
        heroChosen={!!state.hero[p]}
        onPickHero={(hero) => dispatch(selectHero({ hero }))}
        onPickPower={(power) => dispatch(selectHero({ power }))}
      />
    );
  }

  if (state.tab === 'deckBuilder') {
    const p = state.dbCurrent,
      picks = state.deckBuilder[p];
    return (
      <DeckBuilder
        title={`Deck Builder — Player ${p}`}
        picks={picks}
        need={20}
        legalFn={legalToAdd20}
        pool={BASE_CARDS}
        onAdd={(card) => dispatch(addToDeck(card))}
        onRemove={(card) => dispatch(removeFromDeck(card))}
        onNext={() => dispatch(nextDraft())}
        imageMap={state.imageMap}
      />
    );
  }

  if (state.tab === 'mulligan') {
    const p = state.active;
    return (
      <MulliganScreen
        p={p}
        hand={state.players[p].hand}
        selected={new Set(state.mullSel[p])}
        imageMap={state.imageMap}
        onToggle={(id) => dispatch(mullToggle({ p, id }))}
        onConfirm={() => dispatch(mullConfirm({ p }))}
      />
    );
  }

  if (state.tab === 'campaignReward') {
    const { rewardsLeft, rewardOptions } = state.campaign;
    return (
      <RewardScreen
        rewardsLeft={rewardsLeft}
        options={rewardOptions}
        imageMap={state.imageMap}
        onPick={(card: Card) => dispatch(rewardPick({ card }))}
      />
    );
  }

  if (state.tab === 'game') {
    // You may need to refactor GameView to use Redux hooks directly, or pass specific action dispatchers
    return <GameView state={state} dispatch={dispatch} />;
  }

  return null;
}
