import { CardLibrary } from "./card_library.js";

function fillSummonSlot(card, prefix) {
  document.getElementById(`card-id-${prefix}`).textContent   = card.id || "";
  document.getElementById(`card-name-${prefix}`).textContent = card.name || "";
  document.getElementById(`card-icon-${prefix}`).textContent = card.icon || "";
  document.getElementById(`card-image-${prefix}`).src        = card.card_images?.[0]?.image_url || "";
  document.getElementById(`level-${prefix}`).textContent     = card.level || "";
  document.getElementById(`atk-${prefix}`).textContent       = card.atk || "";
  document.getElementById(`def-${prefix}`).textContent       = card.def || "";
  document.getElementById(`tribute-${prefix}`).textContent   = card.tribute || "";
  document.getElementById(`about-${prefix}`).textContent     = card.about || "";
  document.getElementById(`type-emoji-${prefix}`).textContent= card.icon || "";

  const effBox = document.getElementById(`effect-box-${prefix}`);
  effBox.innerHTML = "";
  (card.effects||[]).forEach(e=>{
    const entry = document.createElement("div");
    entry.className = "effect-entry";
    entry.innerHTML = `
      <div class="effect-bar"><div>${e.icons||""}</div><div>${e.emoji||""}</div></div>
      <div class="effect-text">${e.text||""}</div>`;
    effBox.appendChild(entry);
  });

  document.getElementById(`sets-line-${prefix}`).textContent = (card.card_sets||[]).join(" ");
  document.getElementById(`tags-line-${prefix}`).textContent = (card.tags||[]).join(" ");
  document.getElementById(`footer-${prefix}`).textContent    = card.footer || "";
  document.getElementById(`rarity-${prefix}`).textContent    = card.rarity || "";

  const frame = document.getElementById(`summon-card-${prefix}`);
  if (card.frameType) frame.setAttribute("data-frame", card.frameType);
}

const Dealer = {
  init() {
    const card = CardLibrary[0]; // just grab first card for now
    fillSummonSlot(card, "2");   // 🚩 fill player-hand-2
  }
};

window.addEventListener("DOMContentLoaded", () => Dealer.init());
