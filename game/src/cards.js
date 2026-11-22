// Ember Court card catalogue: every card is an original design.
// Four elements in a cycle: Ember beats Leaf, Leaf beats Stone,
// Stone beats Tide, Tide beats Ember. A card whose element beats the
// court's current element deals +2 attack. Suits are told apart by
// colour AND symbol, never by text alone.

export const ELEMENTS = {
  ember: { name: 'Ember', symbol: '🔥', color: '#e2483d', dark: '#7a1d16', light: '#ffb199' },
  tide: { name: 'Tide', symbol: '💧', color: '#2f7fd0', dark: '#123f6e', light: '#a8d4ff' },
  leaf: { name: 'Leaf', symbol: '🍃', color: '#3f9e4d', dark: '#174d22', light: '#b5e8b0' },
  stone: { name: 'Stone', symbol: '⛰️', color: '#8a7f72', dark: '#453d33', light: '#e0d6c8' },
};

export const BEATS = { ember: 'leaf', leaf: 'stone', stone: 'tide', tide: 'ember' };

// cost: energy to play. attack: damage to the rival. shield: guard gained.
// heal: life restored to self. draw: cards drawn after playing.
export const CARD_DEFS = [
  { id: 'imp', name: 'Cinder Imp', element: 'ember', cost: 1, attack: 2, shield: 0, heal: 0, draw: 0, text: 'A spark with teeth.' },
  { id: 'sprite', name: 'Spark Sprite', element: 'ember', cost: 2, attack: 2, shield: 0, heal: 0, draw: 1, text: 'Draw a card.' },
  { id: 'knight', name: 'Ember Knight', element: 'ember', cost: 3, attack: 4, shield: 0, heal: 0, draw: 0, text: 'Sworn to the flame.' },
  { id: 'drake', name: 'Flame Drake', element: 'ember', cost: 4, attack: 6, shield: 0, heal: 0, draw: 0, text: 'The court holds its breath.' },
  { id: 'seedling', name: 'Seedling', element: 'leaf', cost: 1, attack: 1, shield: 0, heal: 0, draw: 1, text: 'Draw a card.' },
  { id: 'vine', name: 'Thorn Vine', element: 'leaf', cost: 2, attack: 3, shield: 0, heal: 0, draw: 0, text: 'It grows where it lands.' },
  { id: 'warden', name: 'Grove Warden', element: 'leaf', cost: 4, attack: 5, shield: 0, heal: 3, draw: 0, text: 'Heal 3 life.' },
  { id: 'caller', name: 'Tide Caller', element: 'tide', cost: 3, attack: 3, shield: 0, heal: 2, draw: 0, text: 'Heal 2 life.' },
  { id: 'serpent', name: 'Wave Serpent', element: 'tide', cost: 5, attack: 7, shield: 0, heal: 0, draw: 0, text: 'The tide answers no one.' },
  { id: 'bubble', name: 'Bubble Guard', element: 'tide', cost: 2, attack: 0, shield: 4, heal: 0, draw: 0, text: 'Gain 4 guard.' },
  { id: 'hound', name: 'Rock Hound', element: 'stone', cost: 2, attack: 2, shield: 3, heal: 0, draw: 0, text: 'Gain 3 guard.' },
  { id: 'golem', name: 'Stone Golem', element: 'stone', cost: 4, attack: 4, shield: 5, heal: 0, draw: 0, text: 'Gain 5 guard.' },
  { id: 'king', name: 'Mountain King', element: 'stone', cost: 6, attack: 8, shield: 0, heal: 0, draw: 0, text: 'The mountain stands up.' },
];

export function describeCard(def) {
  const parts = [];
  if (def.attack > 0) parts.push(`${def.attack} attack`);
  if (def.shield > 0) parts.push(`+${def.shield} guard`);
  if (def.heal > 0) parts.push(`heal ${def.heal}`);
  if (def.draw > 0) parts.push(`draw ${def.draw}`);
  return parts.join(', ') || 'no effect';
}
