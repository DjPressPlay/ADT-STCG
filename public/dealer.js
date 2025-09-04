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

    // Deal two cards into player-hand-1 and player-hand-2
    const c1 = this.drawCard();
    if (c1) renderSlotCard("player-hand-1", c1);

    const c2 = this.drawCard();
    if (c2) renderSlotCard("player-hand-2", c2);

    // Deal one card into cpu-hand-1
    const cpuC1 = this.drawCard();
    if (cpuC1) renderSlotCard("cpu-hand-1", cpuC1);
  },
};

// Auto-run
window.addEventListener("DOMContentLoaded", () => {
  Dealer.init();
});
