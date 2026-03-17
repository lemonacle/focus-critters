export function renderLog(state) {
  const el = document.getElementById("logList");

  if (!el) return;

  if (state.log.length === 0) {
    el.innerHTML = `<div class="empty">No activity yet.</div>`;
    return;
  }

  el.innerHTML = state.log.map((item) => `
    <div class="log-item">
      <div>${item.text}</div>
      <div class="small" style="margin-top:4px;">${item.time}</div>
    </div>
  `).join("");
}