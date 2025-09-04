// slot_card_renderer.js
export function renderSlotCard(slotId, card) {
  const slot = document.getElementById(slotId);
  if (!slot) return;

  slot.innerHTML = `
    <div class="mini-card frameType" data-frame="${card.frameType || ""}">
      <div class="frameType-inner">
        <div class="card-header">
          <div class="card-id">${card.id || ""}</div>
          <div class="card-name"><span>${card.name || ""}</span></div>
          <div class="card-icon">${card.icon || ""}</div>
        </div>
        <div class="card-art">
          <img src="${card.card_images?.[0]?.image_url || ""}" alt="${card.name || ""}">
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
              <div class="effect-bar"><div>${e.icons || ""}</div><div>${e.emoji || ""}</div></div>
              <div class="effect-text">${e.text || ""}</div>
            </div>`).join("")}
        </div>
        <div class="meta-block">
          <div class="meta-line"><div class="meta-label">Sets -</div><div>${(card.card_sets || []).join(" ")}</div></div>
          <div class="meta-line"><div class="meta-label">Tags -</div><div>${(card.tags || []).join(" ")}</div></div>
        </div>
        <div class="meta-bottom">
          <div class="meta-footer-text">${card.footer || ""}</div>
          <div class="rarity">${card.rarity || ""}</div>
        </div>
      </div>
    </div>
  `;
}
