# Ember Court — a duel of cards

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/airdropgodx24/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/airdropgodx24/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An original turn-based card battler for the [make.fun](https://make.fun/bounty/best-card-game-20261122-1826) best card game bounty.
Two rivals, 20 life each, one court. Spend energy, play cards, break the
other side first.

## How to play

- **Start:** click the button or press Enter on the title screen.
- **Play a card:** click it in your hand, or press keys 1–7.
- **End your turn:** click END TURN or press Space. The rival then plays.
- **Restart:** press R or click Play Again on the victory or defeat screen.

## The rules

- Both sides start at **20 life** with a 24-card deck (two copies of each
  of the 12 original cards) and a hand of 4.
- Energy starts at 1 and grows by 1 each of your turns, up to 7. Every
  card costs energy to play; you draw a card at the start of each turn.
- Cards deal attack damage, raise guard (which absorbs damage first),
  heal life, or draw extra cards.
- Four elements run in a cycle — **Ember beats Leaf, Leaf beats Stone,
  Stone beats Tide, Tide beats Ember**. The last card played sets the
  court's element; a card whose element beats it deals **+2 attack**.
- The rival is a simple AI: it plays its strongest affordable cards,
  guards and heals when hurt, and ends its turn.
- First side to 0 life loses.

## Run it

Static files only — no build step, no network request.

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
```

Or serve `game/` with any static HTTP server and open `game/index.html`.

## Files

- `game/index.html` — page shell and canvas.
- `game/src/cards.js` — the 12-card catalogue and the element cycle.
- `game/src/deck.js` — deck building, shuffling and drawing.
- `game/src/state.js` — duel state, turn rules, combat and the rival AI.
- `game/src/render.js` — all canvas drawing: title, table, cards, end screens.
- `game/src/input.js` — mouse and keyboard input.
- `game/src/audio.js` — WebAudio synth sounds, built in code.
- `game/src/shots.js` — deterministic scenes for screenshots
  (`?shot=start|play|win|loss`).
- `game/src/main.js` — bootstrap, render loop and turn flow.
- `main.ts` — hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`.
- `screenshots/` — real renders of the game in a browser:
  1-title, 2-play, 3-win, 4-loss.

## make.fun

- Competition: best-card-game-20261122-1826
- Entry: Ember Court
- License: MIT (see LICENSE)

Made with plain canvas, plain JavaScript and no libraries.
