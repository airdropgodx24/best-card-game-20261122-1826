// Deterministic screenshot scenes for Ember Court.
// ?shot=start shows the title, ?shot=play a mid-duel table with both
// hands and life totals, ?shot=win the victory screen, ?shot=loss the
// defeat screen. Plain play (no query) starts on the title screen.

import { newGame, startDuel } from './state.js';
import { drawCards } from './deck.js';

export function sceneFor(query) {
  const shot = query.get('shot') || 'start';
  const seed = Number(query.get('seed') || 7);
  const game = newGame(seed);
  if (shot === 'start') return game;
  if (shot === 'play') {
    startDuel(game);
    game.turn = 3;
    game.turnsPlayed = 2;
    game.player.maxEnergy = 3;
    game.player.energy = 3;
    game.foe.maxEnergy = 3;
    game.foe.energy = 1;
    game.player.life = 16;
    game.player.guard = 3;
    game.foe.life = 13;
    game.foe.guard = 0;
    game.courtElement = 'ember';
    drawCards(game.player.deck, game.player.hand, 2);
    drawCards(game.foe.deck, game.foe.hand, 2);
    game.log = [
      'You play Ember Knight (4 attack).',
      'It strikes for 4 — 4 past guard.',
      'Rival plays Thorn Vine.',
    ];
    game.lastPlay = { card: game.player.hand[0], byPlayer: true, at: 0 };
    return game;
  }
  if (shot === 'win') {
    startDuel(game);
    game.turn = 6;
    game.turnsPlayed = 5;
    game.foe.life = 0;
    game.player.life = 11;
    game.player.cardsPlayed = 9;
    game.courtElement = 'ember';
    game.phase = 'over';
    game.winner = 'player';
    game.log = ['Victory! The Ember Court is yours.'];
    return game;
  }
  if (shot === 'loss') {
    startDuel(game);
    game.turn = 5;
    game.turnsPlayed = 4;
    game.player.life = 0;
    game.foe.life = 9;
    game.player.cardsPlayed = 7;
    game.courtElement = 'tide';
    game.phase = 'over';
    game.winner = 'foe';
    game.log = ['Defeat. The rival takes the court.'];
    return game;
  }
  return game;
}
