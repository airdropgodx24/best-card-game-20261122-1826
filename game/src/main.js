// Ember Court bootstrap: canvas setup, render loop, turn flow and
// the rival's timed turns. No network, no storage, no cookies.

import { newGame, startDuel, playCard, beginPlayerTurn, beginFoeTurn, foeChooseCard } from './state.js';
import { drawGame, drawTitle, VIEW_W, VIEW_H } from './render.js';
import { attachInput } from './input.js';
import { sceneFor } from './shots.js';
import { ensureAudio, playSound } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let game = sceneFor(new URLSearchParams(window.location.search));
let hoverIndex = -1;
let foeTimer = 0;
let lastPhase = game.phase;

function resize() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = Math.round(VIEW_W * scale * window.devicePixelRatio);
  canvas.height = Math.round(VIEW_H * scale * window.devicePixelRatio);
  canvas.style.width = `${Math.round(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.round(VIEW_H * scale)}px`;
}

function announce() {
  statusEl.textContent = game.log[0] || '';
}

function restart() {
  game = newGame((Math.random() * 2147483647) | 0);
  hoverIndex = -1;
  foeTimer = 0;
  lastPhase = game.phase;
  announce();
}

function endPlayerTurn() {
  if (game.phase !== 'player') return;
  playSound('turn');
  beginFoeTurn(game);
  foeTimer = 900;
  announce();
}

function runFoeTurn() {
  const index = foeChooseCard(game);
  if (index >= 0) {
    const card = game.foe.hand[index];
    playCard(game, game.foe, game.player, index);
    playSound(card.attack > 0 ? 'hit' : 'play');
    if (game.phase === 'over') {
      playSound('lose');
      announce();
      return;
    }
    foeTimer = 900;
    return;
  }
  beginPlayerTurn(game);
  playSound('turn');
  announce();
}

function tryPlayCard(index) {
  if (game.phase !== 'player') return;
  const card = game.player.hand[index];
  if (!card) return;
  if (card.cost > game.player.energy) {
    game.log = [`Not enough energy for ${card.name} (cost ${card.cost}).`].concat(game.log).slice(0, 4);
    announce();
    return;
  }
  ensureAudio();
  playCard(game, game.player, game.foe, index);
  playSound(card.attack > 0 ? 'hit' : card.heal > 0 ? 'heal' : 'play');
  if (game.phase === 'over') playSound('win');
  announce();
}

attachInput(canvas, {
  getGame: () => game,
  onHover: (index) => {
    hoverIndex = index;
  },
  onStart: () => {
    ensureAudio();
    startDuel(game);
    playSound('turn');
    announce();
  },
  onConfirm: () => {
    if (game.phase === 'title') {
      ensureAudio();
      startDuel(game);
      playSound('turn');
    } else if (game.phase === 'player') {
      endPlayerTurn();
    } else if (game.phase === 'over') {
      restart();
    }
    announce();
  },
  onPlayCard: tryPlayCard,
  onEndTurn: endPlayerTurn,
  onRestart: () => {
    if (game.phase === 'over' || game.phase === 'title') restart();
  },
});

window.addEventListener('resize', resize);
resize();

let lastTime = 0;
function frame(time) {
  const dt = time - lastTime;
  lastTime = time;
  if (game.phase === 'foe') {
    foeTimer -= dt;
    if (foeTimer <= 0) runFoeTurn();
  }
  if (game.phase !== lastPhase) {
    lastPhase = game.phase;
    announce();
  }
  ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
  if (game.phase === 'title') {
    drawTitle(ctx, game);
  } else {
    drawGame(ctx, game, hoverIndex);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
announce();
