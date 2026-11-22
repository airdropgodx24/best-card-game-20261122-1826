// Mouse and keyboard input for Ember Court.
// Click a card in your hand to play it (keys 1-7 do the same),
// click END TURN or press Space to end your turn, Enter to start,
// R to restart after a duel ends.

import { LAYOUT, VIEW_W, VIEW_H, cardRect } from './render.js';

function toView(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_W,
    y: ((clientY - rect.top) / rect.height) * VIEW_H,
  };
}

function inside(point, box) {
  return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
}

export function attachInput(canvas, hooks) {
  canvas.addEventListener('mousemove', (event) => {
    const p = toView(canvas, event.clientX, event.clientY);
    hooks.onHover(hoveredCardIndex(p, hooks));
  });
  canvas.addEventListener('click', (event) => {
    const p = toView(canvas, event.clientX, event.clientY);
    handleClick(p, hooks);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key >= '1' && event.key <= '7') {
      hooks.onPlayCard(Number(event.key) - 1);
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      hooks.onConfirm();
    } else if (event.key === 'r' || event.key === 'R') {
      hooks.onRestart();
    }
  });
}

function hoveredCardIndex(p, hooks) {
  const game = hooks.getGame();
  if (game.phase !== 'player') return -1;
  for (let i = 0; i < game.player.hand.length; i += 1) {
    const rect = cardRect(i, game.player.hand.length, LAYOUT.playerHandY);
    if (inside(p, rect)) return i;
  }
  return -1;
}

function handleClick(p, hooks) {
  const game = hooks.getGame();
  if (game.phase === 'title') {
    if (inside(p, LAYOUT.startButton)) hooks.onStart();
    return;
  }
  if (game.phase === 'over') {
    if (inside(p, LAYOUT.restartButton)) hooks.onRestart();
    return;
  }
  if (game.phase === 'player') {
    if (inside(p, LAYOUT.endButton)) {
      hooks.onEndTurn();
      return;
    }
    const index = hoveredCardIndex(p, hooks);
    if (index >= 0) hooks.onPlayCard(index);
  }
}
