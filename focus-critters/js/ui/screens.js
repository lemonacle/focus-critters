export function showTab(tabName) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const tab = document.getElementById(tabName);
  const button = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);

  if (tab) {
    tab.classList.add("active");
  }

  if (button) {
    button.classList.add("active");
  }
}