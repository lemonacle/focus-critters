import { critters } from "../data/critters.js";

export function renderCollection(state) {
  const el = document.getElementById("collectionGrid");

  if (!el) return;

  const stable = state.stable || {};
  const ownedCritters = critters.filter((c) => (stable[c.id] || 0) > 0);

  if (ownedCritters.length === 0) {
    el.innerHTML = `<div class="empty">No critters in your stable yet. Try Explore to find one.</div>`;
    return;
  }

  el.innerHTML = ownedCritters.map((c) => {
    const qty = stable[c.id] || 0;
    const isCompanion = state.activeCompanionId === c.id;

    return `
      <div class="critter">
        <div class="emoji">${c.emoji}</div>
        <div class="name">${c.name}</div>
        <div class="small">Group: ${c.group}</div>
        <div class="small">Qty: ${qty}</div>
        ${isCompanion ? `<div class="owned-badge">Companion</div>` : ``}
      </div>
    `;
  }).join("");
}