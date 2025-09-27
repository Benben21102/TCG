import React, { useReducer, useEffect } from "react";
import { initialState, reducer } from "./state";
import { State, Action } from "./types";
import { MainMenu } from "./components/MainMenu";
import { ArtManager } from "./components/ArtManager";
import { HeroSelect } from "./components/HeroSelect";
import { DeckBuilder } from "./components/DeckBuilder";
import { MulliganScreen } from "./components/MulliganScreen";
import { RewardScreen } from "./components/RewardScreen";

import { campaignDraftPool, legalToAdd10, legalToAdd20 } from "./state";

export default function App() {
	const [state, dispatch] = useReducer(reducer, initialState);

	// ...AI hooks, auto-draw, etc. can be modularized and imported as hooks

	// main router
	if (state.tab === "mainMenu")
		return (
			<MainMenu
				onFreeHuman={() => dispatch({ type: "FREEPLAY_HUMAN" })}
				onFreeAI={() => dispatch({ type: "FREEPLAY_AI" })}
				onCampaign={() => dispatch({ type: "CAMPAIGN_START" })}
				onArt={() => dispatch({ type: "OPEN_ART_MANAGER" })}
			/>
		);

	if (state.tab === "artManager")
		return (
			<ArtManager
				imageMap={state.imageMap}
				onSet={(name, url) => dispatch({ type: "SET_CARD_ART", cardName: name, objectURL: url })}
				onClear={(name) => dispatch({ type: "CLEAR_CARD_ART", cardName: name })}
				onBack={() => dispatch({ type: "MAIN_MENU" })}
			/>
		);

	if (state.tab === "campaignHero") {
		const p = 1;
		return (
			<HeroSelect
				p={p}
				heroChosen={!!state.hero[p]}
				onPickHero={(hero) => dispatch({ type: "SELECT_HERO", hero })}
				onPickPower={(power) => dispatch({ type: "SELECT_HERO", power })}
			/>
		);
	}


	// Add remaining tab routes
	if (state.tab === "campaignDraft") {
		const p = 1, picks = state.deckBuilder[p];
		const pool = campaignDraftPool(state.campaign.unlocks);
		return (
			<DeckBuilder
				title="Campaign Draft — Pick 10"
				picks={picks}
				need={10}
				legalFn={legalToAdd10}
				pool={pool}
				onAdd={(card) => dispatch({ type: "ADD_TO_DECK", card })}
				onRemove={(card) => dispatch({ type: "REMOVE_FROM_DECK", card })}
				onNext={() => dispatch({ type: "NEXT_DRAFT" })}
				imageMap={state.imageMap}
			/>
		);
	}

	if (state.tab === "heroSelect") {
		const p = state.dbCurrent;
		return (
			<HeroSelect
				p={p}
				heroChosen={!!state.hero[p]}
				onPickHero={(hero) => dispatch({ type: "SELECT_HERO", hero })}
				onPickPower={(power) => dispatch({ type: "SELECT_HERO", power })}
			/>
		);
	}

	if (state.tab === "deckBuilder") {
		const p = state.dbCurrent, picks = state.deckBuilder[p];
		return (
			<DeckBuilder
				title={`Deck Builder — Player ${p}`}
				picks={picks}
				need={20}
				legalFn={legalToAdd20}
				pool={undefined}
				onAdd={(card) => dispatch({ type: "ADD_TO_DECK", card })}
				onRemove={(card) => dispatch({ type: "REMOVE_FROM_DECK", card })}
				onNext={() => dispatch({ type: "NEXT_DRAFT" })}
				imageMap={state.imageMap}
			/>
		);
	}

	if (state.tab === "mulligan") {
		const p = state.active;
		return (
			<MulliganScreen
				p={p}
				hand={state.players[p].hand}
				selected={state.mullSel[p]}
				imageMap={state.imageMap}
				onToggle={(id) => dispatch({ type: "MULL_TOGGLE", p, id })}
				onConfirm={() => dispatch({ type: "MULL_CONFIRM", p })}
			/>
		);
	}

	if (state.tab === "campaignReward") {
		const { rewardsLeft, rewardOptions } = state.campaign;
		return (
			<RewardScreen
				rewardsLeft={rewardsLeft}
				options={rewardOptions}
				imageMap={state.imageMap}
				onPick={(card) => dispatch({ type: "REWARD_PICK", card })}
			/>
		);
	}

	// TODO: Add GameView and other screens as needed

	return null;
	}
