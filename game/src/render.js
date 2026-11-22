// Canvas rendering for Ember Court. Everything is drawn with canvas
// shapes and text: no images, no fonts loaded over the network.
// Layout is fixed at 1280x720 and scaled to the window.

import { ELEMENTS, BEATS } from './cards.js';
import { MAX_LIFE } from './state.js';

export const VIEW_W = 1280;
export const VIEW_H = 720;

export const CARD_W = 132;
export const CARD_H = 188;

export const LAYOUT = {
  foeHandY: 88,
  playerHandY: 492,
  endButton: { x: 1120, y: 330, w: 132, h: 52 },
  restartButton: { x: 540, y: 470, w: 200, h: 56 },
  startButton: { x: 490, y: 545, w: 300, h: 60 },
};

export function cardRect(index, count, y) {
  const total = count * (CARD_W + 10) - 10;
  const x0 = (VIEW_W - total) / 2;
  return { x: x0 + index * (CARD_W + 10), y, w: CARD_W, h: CARD_H };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function lifeBar(ctx, x, y, w, label, life, guard, alignRight) {
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillStyle = '#f5e9d0';
  ctx.textAlign = alignRight ? 'right' : 'left';
  ctx.fillText(`${label}  ♥ ${life}/${MAX_LIFE}`, alignRight ? x + w : x, y + 24);
  if (guard > 0) {
    ctx.fillStyle = '#7ec8ff';
    ctx.fillText(`🛡 ${guard}`, alignRight ? x + w : x, y + 48);
  }
  ctx.fillStyle = '#3a2418';
  roundRect(ctx, x, y + 56, w, 14, 7);
  ctx.fill();
  if (life > 0) {
    ctx.fillStyle = life > 10 ? '#e2483d' : '#ff5a3c';
    roundRect(ctx, x, y + 56, (w * life) / MAX_LIFE, 14, 7);
    ctx.fill();
  }
}

export function drawCard(ctx, card, rect, opts) {
  const el = ELEMENTS[card.element];
  const hover = opts && opts.hover;
  const playable = !opts || opts.playable !== false;
  const y = hover ? rect.y - 14 : rect.y;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = hover ? 18 : 8;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, rect.x, y, rect.w, rect.h, 12);
  ctx.fillStyle = playable ? '#fdf6e3' : '#cfc4ae';
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, rect.x, y, rect.w, rect.h, 12);
  ctx.clip();
  ctx.fillStyle = el.color;
  ctx.fillRect(rect.x, y, rect.w, 46);
  ctx.fillStyle = el.dark;
  ctx.fillRect(rect.x, y + 46, rect.w, 4);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(card.name, rect.x + 10, y + 30, rect.w - 52);
  ctx.beginPath();
  ctx.arc(rect.x + rect.w - 22, y + 23, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#2b6cb0';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), rect.x + rect.w - 22, y + 30);
  ctx.font = '44px serif';
  ctx.fillText(el.symbol, rect.x + rect.w / 2, y + 108);
  if (card.attack > 0) {
    ctx.fillStyle = '#b3261e';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText(`⚔ ${card.attack}`, rect.x + rect.w / 2, y + 152);
  } else {
    ctx.fillStyle = '#2b6cb0';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(`🛡 ${card.shield}`, rect.x + rect.w / 2, y + 150);
  }
  ctx.fillStyle = '#4a3527';
  ctx.font = 'italic 13px Georgia, serif';
  ctx.fillText(card.text, rect.x + rect.w / 2, y + 176, rect.w - 16);
  ctx.restore();
  if (hover && !playable) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    roundRect(ctx, rect.x, y, rect.w, rect.h, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Not enough energy', rect.x + rect.w / 2, y + rect.h / 2);
  }
}

function drawTable(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#2a160c');
  g.addColorStop(1, '#1a0f0a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#274d2d';
  roundRect(ctx, 30, 200, VIEW_W - 60, 280, 24);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  roundRect(ctx, 30, 200, VIEW_W - 60, 280, 24);
  ctx.stroke();
  ctx.fillStyle = '#c9a227';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('— THE EMBER COURT —', VIEW_W / 2, 232);
}

function drawCourt(ctx, game) {
  const el = game.courtElement ? ELEMENTS[game.courtElement] : null;
  // The advantaged element is the one that beats the court element.
  const advantaged = el
    ? ELEMENTS[Object.keys(BEATS).find((key) => BEATS[key] === game.courtElement)]
    : null;
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f5e9d0';
  if (el) {
    ctx.fillText(`Court element: ${el.symbol} ${el.name}  —  ${advantaged.symbol} ${advantaged.name} cards gain +2 attack`, VIEW_W / 2, 290);
  } else {
    ctx.fillText('Court element: none yet — play any card to set it', VIEW_W / 2, 290);
  }
  if (game.lastPlay) {
    const c = game.lastPlay.card;
    const by = game.lastPlay.byPlayer ? 'You' : 'Rival';
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = '#ffe9b0';
    ctx.fillText(`Last played: ${by} — ${c.name} (${ELEMENTS[c.element].name})`, VIEW_W / 2, 318);
  }
}

function drawLog(ctx, game) {
  ctx.textAlign = 'left';
  ctx.font = '16px Georgia, serif';
  game.log.slice(0, 3).forEach((line, i) => {
    ctx.fillStyle = i === 0 ? '#ffe9b0' : '#cbb894';
    ctx.fillText(line, 40, 386 + i * 21);
  });
}

function drawEnergy(ctx, game) {
  const p = game.player;
  ctx.textAlign = 'left';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillStyle = '#f5e9d0';
  ctx.fillText(`Energy: ${'●'.repeat(p.energy)}${'○'.repeat(Math.max(0, p.maxEnergy - p.energy))}  ${p.energy}/${p.maxEnergy}`, 40, 452);
  ctx.fillStyle = '#cbb894';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(`Turn ${game.turn}  •  Deck: ${p.deck.length} cards  •  Keys 1–7 play a card, Space ends turn`, 40, 474);
}

function drawEndButton(ctx, game) {
  const b = LAYOUT.endButton;
  const enabled = game.phase === 'player';
  ctx.save();
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fillStyle = enabled ? '#c9a227' : '#6b5a3a';
  ctx.fill();
  ctx.strokeStyle = '#f5e9d0';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = enabled ? '#241708' : '#d8cbb0';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('END TURN', b.x + b.w / 2, b.y + 33);
  ctx.restore();
}

export function drawTitle(ctx, game) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#3a1408');
  g.addColorStop(0.55, '#1a0f0a');
  g.addColorStop(1, '#0d0705');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const samples = [game.player.hand[0], game.player.hand[1], game.player.hand[2]].filter(Boolean);
  samples.forEach((card, i) => {
    drawCard(ctx, card, { x: 470 + i * 150, y: 250, w: CARD_W, h: CARD_H }, { playable: true });
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('EMBER COURT', VIEW_W / 2, 130);
  ctx.fillStyle = '#f5e9d0';
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('A duel of cards, elements and nerve', VIEW_W / 2, 180);
  ctx.font = '20px Georgia, serif';
  ctx.fillStyle = '#ffe9b0';
  ctx.fillText('Both sides start at 20 life. Spend energy, play cards, break the rival first.', VIEW_W / 2, 480);
  ctx.fillText('Ember beats Leaf • Leaf beats Stone • Stone beats Tide • Tide beats Ember (+2 attack)', VIEW_W / 2, 512);
  const b = LAYOUT.startButton;
  ctx.save();
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = '#c9a227';
  ctx.fill();
  ctx.strokeStyle = '#f5e9d0';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#241708';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('CLICK OR PRESS ENTER', b.x + b.w / 2, b.y + 38);
  ctx.restore();
  ctx.fillStyle = '#cbb894';
  ctx.font = '17px Georgia, serif';
  ctx.fillText('Mouse or keys 1–7 to play • Space to end turn • R to restart', VIEW_W / 2, 630);
}

export function drawEnd(ctx, game) {
  ctx.fillStyle = 'rgba(10,5,2,0.82)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  const won = game.winner === 'player';
  ctx.fillStyle = won ? '#ffd94d' : '#ff6b5e';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.fillText(won ? '👑 VICTORY!' : '💔 DEFEAT', VIEW_W / 2, 250);
  ctx.fillStyle = '#f5e9d0';
  ctx.font = '26px Georgia, serif';
  ctx.fillText(
    won
      ? `The Ember Court is yours — rival at 0 life after ${game.turnsPlayed + 1} turns.`
      : `The rival takes the court — you fell at 0 life after ${game.turnsPlayed + 1} turns.`,
    VIEW_W / 2, 320,
  );
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`Final life — You ${game.player.life}  •  Rival ${game.foe.life}  •  Cards played: ${game.player.cardsPlayed}`, VIEW_W / 2, 360);
  ctx.fillText('Press R or click Play Again to duel once more.', VIEW_W / 2, 400);
  const b = LAYOUT.restartButton;
  ctx.save();
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fillStyle = '#c9a227';
  ctx.fill();
  ctx.strokeStyle = '#f5e9d0';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#241708';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText('PLAY AGAIN', b.x + b.w / 2, b.y + 36);
  ctx.restore();
}

export function drawGame(ctx, game, hoverIndex) {
  drawTable(ctx);
  // Both life totals live in the top bar, always visible, clear of the hands.
  lifeBar(ctx, 40, 10, 300, 'RIVAL', game.foe.life, game.foe.guard, false);
  lifeBar(ctx, 940, 10, 300, 'YOU', game.player.life, game.player.guard, true);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`TURN ${game.turn}`, VIEW_W / 2, 34);
  game.foe.hand.forEach((card, i) => {
    drawCard(ctx, card, cardRect(i, game.foe.hand.length, LAYOUT.foeHandY), { playable: false });
  });
  drawCourt(ctx, game);
  drawLog(ctx, game);
  drawEnergy(ctx, game);
  drawEndButton(ctx, game);
  game.player.hand.forEach((card, i) => {
    const rect = cardRect(i, game.player.hand.length, LAYOUT.playerHandY);
    const playable = game.phase === 'player' && card.cost <= game.player.energy;
    drawCard(ctx, card, rect, { hover: hoverIndex === i, playable });
  });
  if (game.phase === 'foe') {
    ctx.fillStyle = '#ffe9b0';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rival is playing…', VIEW_W / 2, 348);
  }
  if (game.phase === 'over') drawEnd(ctx, game);
}
