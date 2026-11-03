const projectContainer = document.querySelector("#project-list");
const filterButtons = [...document.querySelectorAll(".filter-button")];
let projects = [];
let activeFilter = "Alle";

function renderProjects() {
  const visible = projects.filter(project => {
    if (activeFilter === "Alle") return true;
    if (activeFilter === "Interaktiv") return project.subject === "Interaktiv" || /interaktiv|spiel|simulation|quiz/i.test(project.type || "");
    return project.subject === activeFilter;
  });

  if (!visible.length) {
    projectContainer.innerHTML = '<p class="empty-message">Für diesen Bereich sind noch keine Inhalte veröffentlicht.</p>';
    return;
  }

  projectContainer.innerHTML = visible.map(project => `
    <a class="project-card" href="${escapeAttribute(project.path)}">
      <div class="project-meta"><span>${escapeHtml(project.subject || "Material")}</span><span>${escapeHtml(project.grade || "")}</span></div>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description || project.type || "")}</p>
      <div class="project-open"><span>${escapeHtml(project.type || "Material öffnen")}</span><span aria-hidden="true">↗</span></div>
    </a>
  `).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function escapeAttribute(value) {
  // Paths in projects.json should be relative paths inside this site.
  return escapeHtml(value || "#");
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle("active", item === button));
    renderProjects();
  });
});

fetch("projects.json")
  .then(response => {
    if (!response.ok) throw new Error("Projektübersicht konnte nicht geladen werden.");
    return response.json();
  })
  .then(data => {
    projects = Array.isArray(data) ? data : [];
    renderProjects();
  })
  .catch(() => {
    projectContainer.innerHTML = '<p class="empty-message">Die Projektübersicht konnte nicht geladen werden. Bitte projects.json prüfen.</p>';
  });

document.querySelector("#year").textContent = new Date().getFullYear();
