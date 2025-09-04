// public/dealer.js
import { Deck } from "./assets/deck.js";
import { renderSlotCard } from "./slot_card_renderer.js";

export const Dealer = {
  deck: [],

  init() {
    this.loadDeck();
    this.startGame();
  },

  loadDeck() {
    this.deck = [...Deck];
    // shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  },

  drawCard() {
    if (!this.deck.length) return null;
    return this.deck.shift();
  },

  startGame() {
    console.log("🎮 Dealing cards...");

    // Example: deal 2 cards to player hand zone
    for (let i = 0; i < 2; i++) {
      const card = this.drawCard();
      if (card) renderSlotCard("player-hand", card);
    }

    // Example: deal 1 card to cpu hand zone
    const cpuCard = this.drawCard();
    if (cpuCard) renderSlotCard("cpu-hand", cpuCard);
  },
};

// Auto-run
window.addEventListener("DOMContentLoaded", () => {
  Dealer.init();
});
