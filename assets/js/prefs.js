(() => {
  const KEY = "lernportal.prefs";
  const OPTIONS = {
    size: [["normal", "Normal"], ["gross", "Groß"], ["sehr-gross", "Sehr groß"]],
    spacing: [["normal", "Normal"], ["weit", "Weit"]],
    theme: [["auto", "Auto"], ["light", "Hell"], ["dark", "Dunkel"]]
  };
  const LABELS = { size: "Schriftgröße", spacing: "Zeilenabstand", theme: "Darstellung" };
  const DEFAULTS = { size: "normal", spacing: "normal", theme: "auto" };

  function valid(key, value) {
    return OPTIONS[key].some(option => option[0] === value);
  }
  function load() {
    const prefs = { ...DEFAULTS };
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
      Object.keys(DEFAULTS).forEach(key => { if (valid(key, stored[key])) prefs[key] = stored[key]; });
    } catch (error) { /* Speicher nicht verfügbar: Standardwerte */ }
    return prefs;
  }
  function save(prefs) {
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (error) { /* ignorieren */ }
  }
  function apply(prefs) {
    const root = document.documentElement;
    Object.keys(DEFAULTS).forEach(key => { root.dataset[key] = prefs[key]; });
  }

  let prefs = load();
  apply(prefs);

  document.addEventListener("DOMContentLoaded", () => {
    const slot = document.querySelector("#prefs-slot");
    if (!slot) return;

    const groups = Object.keys(OPTIONS).map(key => `
      <fieldset>
        <legend>${LABELS[key]}</legend>
        <div class="segmented" data-pref="${key}">
          ${OPTIONS[key].map(([value, label]) =>
            `<button type="button" data-value="${value}" aria-pressed="${prefs[key] === value}">${label}</button>`).join("")}
        </div>
      </fieldset>`).join("");

    slot.innerHTML = `
      <button type="button" class="icon-btn" id="prefs-btn" aria-haspopup="dialog" aria-expanded="false" aria-controls="prefs-panel" aria-label="Lesemodus und Darstellung">Aa</button>
      <div class="prefs-panel" id="prefs-panel" role="dialog" aria-label="Lesemodus und Darstellung" hidden>
        <div class="prefs-head"><h2>Lesemodus</h2>
          <button type="button" class="icon-btn" id="prefs-close" aria-label="Schließen">&#10005;</button></div>
        ${groups}
        <button type="button" class="prefs-reset" id="prefs-reset">Zurücksetzen</button>
      </div>`;

    const button = slot.querySelector("#prefs-btn");
    const panel = slot.querySelector("#prefs-panel");

    function setOpen(open) {
      panel.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      if (open) panel.querySelector("button").focus();
    }
    function refresh() {
      panel.querySelectorAll("[data-pref]").forEach(group => {
        group.querySelectorAll("button").forEach(item => {
          item.setAttribute("aria-pressed", String(prefs[group.dataset.pref] === item.dataset.value));
        });
      });
    }

    button.addEventListener("click", () => setOpen(panel.hidden));
    slot.querySelector("#prefs-close").addEventListener("click", () => { setOpen(false); button.focus(); });
    slot.querySelector("#prefs-reset").addEventListener("click", () => {
      prefs = { ...DEFAULTS }; apply(prefs); save(prefs); refresh();
    });
    panel.addEventListener("click", event => {
      const item = event.target.closest("[data-pref] button");
      if (!item) return;
      const key = item.parentElement.dataset.pref;
      if (!valid(key, item.dataset.value)) return;
      prefs[key] = item.dataset.value;
      apply(prefs); save(prefs); refresh();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !panel.hidden) { setOpen(false); button.focus(); }
    });
    document.addEventListener("click", event => {
      if (!panel.hidden && !slot.contains(event.target)) setOpen(false);
    });
  });
})();
