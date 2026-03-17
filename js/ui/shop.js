import { critters, CRITTER_COST } from "../data/critters.js";

export function renderShop(state, onBuy) {
  const el = document.getElementById("shopGrid");

  if (!el) return;

  el.innerHTML = critters.map((c) => {
    const owned = state.owned.includes(c.name);

    return `
      <div class="critter">
        <div class="emoji">${c.emoji}</div>
        <div class="name">${c.name}</div>
        <div class="cost">${owned ? "Already owned" : `${CRITTER_COST} Nectar`}</div>
        ${
          owned
            ? `<div class="owned-badge">Owned</div>`
            : `<button class="buy-critter-btn" data-critter-name="${escapeAttribute(c.name)}">Buy</button>`
        }
      </div>
    `;
  }).join("");

  el.querySelectorAll(".buy-critter-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const critterName = button.dataset.critterName;
      if (onBuy) {
        onBuy(critterName);
      }
    });
  });
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}