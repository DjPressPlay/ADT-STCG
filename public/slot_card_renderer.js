// public/slot_card_renderer.js
export function renderSlotCard(zoneId, card, { mini = true } = {}) {
  const zone = document.getElementById(zoneId);
  if (!zone) return;

  // Clear slot if it already exists (avoid stacking multiple cards)
  const slot = document.getElementById(zoneId);
  if (!slot) return;

  const wrapper = document.createElement("div");
  wrapper.classList.add("card-wrapper");

  wrapper.innerHTML = `
    <div class="frameType ${mini ? "mini-card" : ""}" data-frame="${card.frameType || ""}">
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
          ${(card.effects || [])
            .map(
              e => `
              <div class="effect-entry">
                <div class="effect-bar">
                  <div>${e.icons || ""}</div>
                  <div>${e.emoji || ""}</div>
                </div>
                <div class="effect-text">${e.text || ""}</div>
              </div>
            `
            )
            .join("")}
        </div>
        <div class="meta-block">
          <div class="meta-line">
            <div class="meta-label">Sets -</div>
            <div>${(card.card_sets || []).join(" ")}</div>
          </div>
          <div class="meta-line">
            <div class="meta-label">Tags -</div>
            <div>${(card.tags || []).join(" ")}</div>
          </div>
        </div>
        <div class="meta-bottom">
          <div class="meta-footer-text">${card.footer || ""}</div>
          <div class="rarity">${card.rarity || ""}</div>
        </div>
      </div>
    </div>
  `;

  // attach overlay behavior
  wrapper.querySelector(".frameType").addEventListener("click", () => {
    const overlay = document.getElementById("card-overlay");
    const overlayCard = overlay.querySelector(".overlay-card");
    overlayCard.innerHTML = wrapper.innerHTML; // copy card
    overlay.style.display = "flex";
  });

  // put card inside slot (slot already exists in adt.html)
  zone.innerHTML = ""; // clear slot before appending
  zone.appendChild(wrapper);
}

// Overlay close handler (once, globally)
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("card-overlay");
  if (overlay) {
    const bg = overlay.querySelector(".overlay-bg");
    if (bg) {
      bg.addEventListener("click", () => {
        overlay.style.display = "none";
      });
    }
  }
});
