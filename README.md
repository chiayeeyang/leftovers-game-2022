# Leftovers Game 2022

This repository contains only the standalone, single-player Leftovers game companion. It is independent of the revisited Monopoly tool and multiplayer companion.

## Run
Open `dist/index.html` in a modern browser, or serve `dist/` with any static web server. No dependencies or build step are required.

## Features
- Handwritten Leftovers title and supplied card artwork.
- Chance and Community Chest cards flip in place, with 10 food-waste scenarios per deck. Each deck shows all 10 before reshuffling.
- Balance calculator starting at 1500, plus Pass GO +200 and Jail −50 actions.
- One six-sided die with matching pips.
- Responsive mobile and desktop layouts, keyboard controls, and reduced-motion support.

Choose an operator before entering a calculator amount. AC cancels a calculation without changing the balance. The reset button restores 1500 after confirmation. Cards do not automatically change the balance. Reloading the page starts a fresh session.

## Deploy
The included `vercel.json` serves `dist/` with no build command or environment variables. Connect this repository to its own Vercel project.

## Files
- `dist/index.html`: website layout.
- `dist/style.css`: responsive styling and card flips.
- `dist/app.js`: calculator, food-waste decks, and die.
- `dist/assets/`: the three images used by this website. The full board images supply the original handwritten wordmark and fork artwork; they are not another website.
