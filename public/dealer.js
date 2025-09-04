
// DealerController.js
// New Dealer — pulls cards from Deck and renders them into slots.

import { Deck } from "./deck.js";
import { renderSlotCard } from "./slot_card_renderer.js";

export const Dealer = {
  deck: [],
  graveyard: [],
  hand: [],

  init() {
    this.loadDeck();
    this.startGame();
  },

  loadDeck() {
    this.deck = [...Deck]; // copy deck
    // optional shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  },

  drawCard() {
    if (this.deck.length === 0) return null;
    const card = this.deck.shift();
    this.hand.push(card);
    return card;
  },

  startGame() {
    console.log("🎮 Game started");

    // Example → deal 2 cards into player hand slots
    const c1 = this.drawCard();
    if (c1) renderSlotCard("player-hand-1", c1);

    const c2 = this.drawCard();
    if (c2) renderSlotCard("player-hand-2", c2);

    // Example → deal 1 card into CPU hand slot
    const cpuC1 = this.drawCard();
    if (cpuC1) renderSlotCard("cpu-hand-1", cpuC1);
  },
};

// Auto-init when DOM ready
window.addEventListener("DOMContentLoaded", () => {
  Dealer.init();
});
