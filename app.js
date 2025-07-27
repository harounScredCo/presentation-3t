/*
 * Script principal pour générer la présentation interactive à partir du
 * sommaire défini dans summary.js. Ce script crée dynamiquement les
 * sections du sommaire, gère l’ouverture et la fermeture des parties
 * ainsi que l’affichage de la fenêtre modale. L’interface reste
 * indépendante d’un framework afin de simplifier le déploiement dans
 * des environnements restreints (par exemple GitHub Pages ou Codespaces
 * sans accès réseau).
 */

// summary.js définit window.SUMMARY. Aucune importation n’est nécessaire ici.

/**
 * Crée et retourne un élément HTML à partir d’une chaîne et d’attributs.
 * @param {string} tag Le nom de la balise à créer.
 * @param {object} attributes Un objet contenant les attributs à définir.
 * @param {Array<Node|string>} children Les éléments enfants ou texte.
 */
function createElement(tag, attributes = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  children.forEach((child) => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child) {
      el.appendChild(child);
    }
  });
  return el;
}

/**
 * Initialise l’application en générant les sections et en attachant les
 * gestionnaires d’événements.
 */
function init() {
  const app = document.getElementById('app');
  (window.SUMMARY || []).forEach((section) => {
    const secEl = createSection(section);
    app.appendChild(secEl);
  });
  initModal();
}

/**
 * Crée un élément de section représentant un chapitre du sommaire.
 * @param {object} section Objet représentant une entrée du sommaire.
 */
function createSection(section) {
  const container = createElement('section', {
    class: 'collapsed',
    'data-id': section.id,
  });
  // Titre de la section
  const title = createElement(
    'div',
    { class: 'section-title' },
    [createElement('h3', {}, [section.title]), createElement('span', { class: 'toggle-icon' }, ['▸'])],
  );
  // Contenu réduit (citation)
  const content = createElement('div', { class: 'section-content' }, [section.citation]);
  container.appendChild(title);
  container.appendChild(content);

  // Gestion du clic sur la section (ouvrir/fermer)
  title.addEventListener('click', (e) => {
    e.stopPropagation();
    container.classList.toggle('collapsed');
  });
  // Double clic pour ouvrir la modale avec le chapitre complet
  title.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    openModal(section);
  });

  return container;
}

/**
 * Initialise la fenêtre modale et les gestionnaires de fermeture.
 */
function initModal() {
  const modal = document.getElementById('modal');
  const closeBtn = document.getElementById('modal-close');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**
 * Ouvre la fenêtre modale et insère le titre et le texte complet du chapitre.
 * @param {object} section Objet représentant une entrée du sommaire.
 */
function openModal(section) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  modalTitle.textContent = section.title;
  // Retours à la ligne doivent être convertis en balises <p>
  modalBody.innerHTML = '';
  section.fullText.split('\n\n').forEach((paragraph) => {
    const p = document.createElement('p');
    p.textContent = paragraph.trim();
    modalBody.appendChild(p);
  });
  modal.style.display = 'block';
}

// Lancement de l’application lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', init);