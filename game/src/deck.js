// Deck building and drawing for Ember Court.
// Each duellist starts with the same 24-card deck: two copies of every
// card in the catalogue, shuffled. Hands hold at most 7 cards.

import { CARD_DEFS } from './cards.js';

export const HAND_LIMIT = 7;
export const START_HAND = 4;

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildDeck(rng) {
  const deck = [];
  for (const def of CARD_DEFS) {
    deck.push({ ...def, uid: `${def.id}-a` });
    deck.push({ ...def, uid: `${def.id}-b` });
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck;
}

export function drawCards(deck, hand, count) {
  const drawn = [];
  for (let n = 0; n < count; n += 1) {
    if (deck.length === 0 || hand.length >= HAND_LIMIT) break;
    const card = deck.shift();
    hand.push(card);
    drawn.push(card);
  }
  return drawn;
}
