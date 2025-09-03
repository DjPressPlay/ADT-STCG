// dealer.js
import { CardLibrary } from "./assets/card_library.js";

const $ = id => document.getElementById(id);

function renderMiniSummoner(card) {
  if (!card) return "";
  const img = card.card_images?.[0]?.image_url || "";

  return `
    <div class="mini-card frameType" ${card.frameType ? `data-frame="${card.frameType}"` : ""}>
      <div class="frameType-inner">
        <div class="card-header">
          <div class="card-id">${card.id}</div>
          <div class="card-name"><span>${card.name}</span></div>
          <div class="card-icon">${card.icon}</div>
        </div>
        <div class="card-art">
          <img src="${img}" alt="${card.name}">
          <div class="stat-orb stat-blue">${card.level || ""}</div>
          <div class="stat-orb stat-red">${card.atk || ""}</div>
          <div class="stat-orb stat-green">${card.def || ""}</div>
        </div>
        <div class="type-banner">
          <div><span>${card.tribute || ""}</span></div>
          <div><span>${card.about || ""}</span></div>
          <div><span>${card.icon || ""}</span></div>
        </div>
        <div class="effect-box">
          ${(card.effects || []).map(e => `
            <div class="effect-entry">
              <div class="effect-bar"><div>${e.icons}</div><div>${e.emoji}</div></div>
              <div class="effect-text">${e.text}</div>
            </div>
          `).join("")}
        </div>
        <div class="meta-block">
          <div class="meta-line"><div class="meta-label">Sets -</div><div>${(card.card_sets||[]).join(" ")}</div></div>
          <div class="meta-line"><div class="meta-label">Tags -</div><div>${(card.tags||[]).join(" ")}</div></div>
        </div>
        <div class="meta-bottom">
          <div class="meta-footer-text">${card.footer || ""}</div>
          <div class="rarity">${card.rarity || ""}</div>
        </div>
      </div>
    </div>
  `;
}

const Dealer = {
  allCards: [],
  playerDeck: [],
  cpuDeck: [],

  init() {
    this.allCards = [...CardLibrary];

    // 1 card each
    this.playerDeck = [this.allCards[0]];
    this.cpuDeck    = [this.allCards[0]]; // same for now

    // 🚩 Drop the card into player-hand-2
    this.placeCard("player-hand-2", this.playerDeck[0]);

    // You can also drop one into CPU hand-2 if needed:
    // this.placeCard("cpu-hand-2", this.cpuDeck[0]);
  },

  placeCard(slotId, card) {
    const slot = $(slotId);
    if (!slot) return;
    slot.innerHTML = renderMiniSummoner(card);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  Dealer.init();
  window.Dealer = Dealer; // for console debug
});
