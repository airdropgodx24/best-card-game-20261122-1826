// Game state and turn rules for Ember Court.
// A duel: two sides with 20 life each. Energy starts at 1 and grows by
// 1 every one of your turns, up to 7. Playing a card spends its cost.
// Attack hits the rival's guard first, then life. The element cycle
// (Ember > Leaf > Stone > Tide > Ember) grants +2 attack when a card's
// element beats the court's current element, which is the element of
// the last card played. First side to 0 life loses.

import { BEATS, describeCard } from './cards.js';
import { buildDeck, drawCards, mulberry32 } from './deck.js';

export const MAX_LIFE = 20;
export const MAX_ENERGY = 7;

export function newSide(rng) {
  return {
    life: MAX_LIFE,
    guard: 0,
    energy: 1,
    maxEnergy: 1,
    deck: buildDeck(rng),
    hand: [],
    played: [],
    cardsPlayed: 0,
  };
}

export function newGame(seed) {
  const rng = mulberry32(seed || (Date.now() % 2147483647));
  const game = {
    seed,
    rng,
    player: newSide(rng),
    foe: newSide(rng),
    turn: 1,
    phase: 'title',
    courtElement: null,
    log: ['Welcome to the Ember Court.'],
    winner: null,
    turnsPlayed: 0,
    lastPlay: null,
  };
  drawCards(game.player.deck, game.player.hand, 4);
  drawCards(game.foe.deck, game.foe.hand, 4);
  return game;
}

export function startDuel(game) {
  game.phase = 'player';
  game.log = ['Your turn. Play a card, then end your turn.'];
}

export function advantageBonus(card, courtElement) {
  if (!courtElement) return 0;
  return BEATS[card.element] === courtElement ? 2 : 0;
}

export function dealDamage(target, amount) {
  let left = amount;
  if (target.guard > 0) {
    const absorbed = Math.min(target.guard, left);
    target.guard -= absorbed;
    left -= absorbed;
  }
  target.life = Math.max(0, target.life - left);
  return left;
}

// Play hand[index] for `side` against `other`. Returns a log line or null.
export function playCard(game, side, other, index) {
  const card = side.hand[index];
  if (!card || game.phase === 'over' || game.phase === 'title') return null;
  if (side.energy < card.cost) return null;
  side.hand.splice(index, 1);
  side.energy -= card.cost;
  side.cardsPlayed += 1;
  side.played.push(card);
  const bonus = advantageBonus(card, game.courtElement);
  const who = side === game.player ? 'You play' : 'Rival plays';
  const lines = [];
  if (bonus > 0) {
    lines.push(`${who} ${card.name} (+${bonus} elemental advantage)!`);
  } else {
    lines.push(`${who} ${card.name} (${describeCard(card)}).`);
  }
  if (card.attack > 0) {
    const dealt = dealDamage(other, card.attack + bonus);
    lines.push(`It strikes for ${card.attack + bonus} — ${dealt} past guard.`);
  }
  if (card.shield > 0) {
    side.guard += card.shield;
    lines.push(`Guard rises to ${side.guard}.`);
  }
  if (card.heal > 0) {
    side.life = Math.min(MAX_LIFE, side.life + card.heal);
    lines.push(`Life restored to ${side.life}.`);
  }
  if (card.draw > 0) {
    drawCards(side.deck, side.hand, card.draw);
  }
  game.courtElement = card.element;
  game.lastPlay = { card, byPlayer: side === game.player, at: Date.now() };
  game.log = lines.concat(game.log).slice(0, 4);
  checkEnd(game);
  return lines.join(' ');
}

export function checkEnd(game) {
  if (game.foe.life <= 0) {
    game.phase = 'over';
    game.winner = 'player';
    game.log = ['Victory! The Ember Court is yours.'].concat(game.log).slice(0, 4);
  } else if (game.player.life <= 0) {
    game.phase = 'over';
    game.winner = 'foe';
    game.log = ['Defeat. The rival takes the court.'].concat(game.log).slice(0, 4);
  }
}

export function beginPlayerTurn(game) {
  game.turn += 1;
  game.turnsPlayed += 1;
  const p = game.player;
  p.maxEnergy = Math.min(MAX_ENERGY, p.maxEnergy + 1);
  p.energy = p.maxEnergy;
  drawCards(p.deck, p.hand, 1);
  game.phase = 'player';
  game.log = [`Turn ${game.turn} — ${p.maxEnergy} energy. Your move.`].concat(game.log).slice(0, 4);
}

export function beginFoeTurn(game) {
  const f = game.foe;
  f.maxEnergy = Math.min(MAX_ENERGY, f.maxEnergy + 1);
  f.energy = f.maxEnergy;
  drawCards(f.deck, f.hand, 1);
  game.phase = 'foe';
  game.log = ['Rival is thinking…'].concat(game.log).slice(0, 4);
}

// The rival plays one reasonable card: the strongest affordable strike,
// preferring elemental advantage, then a guard or heal when hurt.
export function foeChooseCard(game) {
  const f = game.foe;
  const affordable = f.hand
    .map((card, index) => ({ card, index }))
    .filter((entry) => entry.card.cost <= f.energy);
  if (affordable.length === 0) return -1;
  const scored = affordable.map((entry) => {
    const c = entry.card;
    let score = c.attack * 2 + advantageBonus(c, game.courtElement) * 2;
    score += c.shield * 1.2 + c.heal * 1.5 + c.draw * 1.5;
    if (f.life <= 8 && c.heal > 0) score += 6;
    if (f.life <= 10 && c.shield > 0) score += 4;
    if (c.cost > f.energy - 1 && affordable.length > 1) score -= 1;
    return { ...entry, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].index;
}
