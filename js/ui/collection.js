import { critters } from "../data/critters.js";

export function renderCollection(state) {
  const el = document.getElementById("collectionGrid");

  if (!el) return;

  if (state.owned.length === 0) {
    el.innerHTML = `<div class="empty">No critters yet. Finish a focus run, earn Nectar, and buy one.</div>`;
    return;
  }

  const ownedCritters = critters.filter((c) => state.owned.includes(c.name));

  el.innerHTML = ownedCritters.map((c) => `
    <div class="critter">
      <div class="emoji">${c.emoji}</div>
      <div class="name">${c.name}</div>
      <div class="owned-badge">Owned</div>
    </div>
  `).join("");
}