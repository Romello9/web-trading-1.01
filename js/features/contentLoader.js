// --- START OF FILE js/features/contentLoader.js ---
// js/features/contentLoader.js
import { contentLibrary } from '../config/contentLibrary.js'; // Importa la libreria dei contenuti
import { handleChallengeClick } from './challenges.js';
import { hasAchievement } from './wallet.js';

const dynamicContentArea = document.getElementById('dynamic-content-area');
const mainNav = document.getElementById('main-nav');

// Funzione helper per creare elementi DOM sicuri (evita innerHTML per contenuti complessi)
function createAndAppend(parent, tag, properties = {}, textContent = null) {
    const element = document.createElement(tag);
    Object.assign(element, properties);
    if (textContent) {
        element.textContent = textContent;
    }
    parent.appendChild(element);
    return element;
}


function renderContentSection(sectionData) {
    const sectionElement = document.createElement('section');
    sectionElement.id = sectionData?.id || `section-${Math.random().toString(36).substring(7)}`;

    const titleElement = createAndAppend(sectionElement, 'h2');
    createAndAppend(titleElement, 'i', { className: `fas ${sectionData?.icon || 'fa-file-alt'}` });
    titleElement.appendChild(document.createTextNode(` ${sectionData?.title || 'Sezione senza titolo'}`)); // Aggiungi spazio

    // Usa innerHTML solo per il contenuto HTML fidato proveniente dai tuoi file
    const contentDiv = createAndAppend(sectionElement, 'div');
    contentDiv.innerHTML = sectionData?.content || '<p>Contenuto non disponibile.</p>'; // Attenzione a XSS se il contenuto non è fidato

    if (sectionData.challenges && sectionData.challenges.length > 0) {
        sectionData.challenges.forEach(challenge => {
            const challengeId = challenge?.id;
            if (!challengeId) {
                console.warn("Challenge data missing ID:", challenge);
                return;
            }
            const isCompleted = hasAchievement(challengeId);
            const linkText = isCompleted ? 'Completata' : (challenge.linkText || 'Inizia Sfida');
            const linkClass = `resource-link challenge-link ${isCompleted ? 'completed' : ''}`;
            const reward = challenge.reward || 0;
            const title = challenge.title || 'Sfida senza titolo';
            const description = challenge.description || '';

            const challengeDiv = createAndAppend(sectionElement, 'div', { className: 'challenge' });
            const rewardDiv = createAndAppend(challengeDiv, 'div', { className: 'token-reward' });
            createAndAppend(rewardDiv, 'i', { className: 'fas fa-coins' });
            rewardDiv.appendChild(document.createTextNode(` ${reward} TRAD`));

            const challengeTitle = createAndAppend(challengeDiv, 'h4');
            createAndAppend(challengeTitle, 'i', { className: 'fas fa-tasks' });
            challengeTitle.appendChild(document.createTextNode(` ${title}`));

            const challengeDesc = createAndAppend(challengeDiv, 'p');
            challengeDesc.textContent = description; // Usa textContent per sicurezza
            challengeDesc.appendChild(document.createTextNode(' ')); // Spazio prima del link

            const challengeLink = createAndAppend(challengeDesc, 'a', {
                href: '#',
                className: linkClass,
                textContent: linkText
            });
            challengeLink.dataset.challengeId = challengeId;
            challengeLink.dataset.reward = reward;

            // Aggiungi listener direttamente qui invece di riattaccarli globalmente dopo
             if (!isCompleted) {
                challengeLink.addEventListener('click', handleChallengeClick);
             }
        });
    }

    return sectionElement; // Ritorna l'elemento DOM invece di una stringa HTML
}

function reAttachEventListeners() {
    // Questa funzione non è più necessaria se aggiungiamo i listener
    // direttamente in renderContentSection. Può essere rimossa o lasciata vuota.
    console.log("Re-attaching listeners (ora gestito in render)");
}

function highlightActiveNavLink(activeKey) {
    if (!mainNav) return;
    mainNav.querySelectorAll('ul li a').forEach(link => {
        link.classList.remove('active');
        if (activeKey && link.dataset.contentKey === activeKey) {
            link.classList.add('active');
        }
    });
}

export function loadContent(contentKey) {
    if (!dynamicContentArea) {
        console.error("Dynamic content area not found in the DOM!");
        return;
    }

    // Mostra indicatore di caricamento
    dynamicContentArea.innerHTML = `<div class="loading-placeholder" style="text-align: center; padding: 5rem 0;">
           <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--secondary-color);"></i>
           <p style="margin-top: 1rem; color: var(--grey-text);">Caricamento contenuti...</p>
       </div>`;

    // Ritarda leggermente il caricamento per far vedere lo spinner (opzionale, per UX)
    setTimeout(() => {
        try {
            const contentData = contentLibrary[contentKey];

            if (!contentData) {
                throw new Error(`Content data not found for key: ${contentKey}`);
            }
            if (!Array.isArray(contentData.sections)) {
                throw new Error(`Content data for key "${contentKey}" does not have a valid 'sections' array.`);
            }

            console.log(`Rendering content for: ${contentKey}`);
            document.title = contentData.pageTitle || 'Trading Mindset Platform';
            dynamicContentArea.innerHTML = ''; // Pulisci l'area prima di aggiungere nuovo contenuto

            contentData.sections.forEach(section => {
                 if (typeof section === 'object' && section !== null) {
                     const sectionElement = renderContentSection(section);
                     dynamicContentArea.appendChild(sectionElement);
                 } else {
                     console.warn(`Invalid section data encountered for key "${contentKey}":`, section);
                 }
            });

            // reAttachEventListeners(); // Non più necessario se i listener sono nel render

            highlightActiveNavLink(contentKey);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Aggiorna History API solo se necessario
            if (window.history.state?.contentKey !== contentKey) {
                 history.pushState({ contentKey: contentKey }, contentData.pageTitle || '', `#${contentKey}`);
            }

        } catch (error) {
            console.error(`Error loading or rendering content for key "${contentKey}":`, error);
            dynamicContentArea.innerHTML = `<p style="color: var(--danger-color); text-align: center; padding: 3rem 0;">Si è verificato un errore: ${error.message}. Controlla la console.</p>`;
            document.title = 'Trading Mindset Platform - Errore Caricamento';
            highlightActiveNavLink(contentKey); // Evidenzia comunque
        }
    }, 50); // Piccolo ritardo di 50ms
}


export function setupContentLoader() {
    if (!mainNav) {
        console.warn("Main navigation element not found. Content loading via nav clicks disabled.");
        return;
    }

    // Listener per la navigazione principale
    mainNav.addEventListener('click', (e) => {
        const navLink = e.target.closest('a[data-content-key]');
        if (navLink && !navLink.classList.contains('active')) { // Evita ricarica se già attivo
            e.preventDefault();
            const contentKey = navLink.dataset.contentKey;
            console.log(`Navigating to: ${contentKey}`);
            loadContent(contentKey);
        } else if (navLink) {
            e.preventDefault(); // Previene comunque il salto all'hash se è già attivo
            console.log(`Content key ${navLink.dataset.contentKey} is already active.`);
        }
    });

    // Listener per i pulsanti avanti/indietro del browser
    window.addEventListener('popstate', (event) => {
        console.log("Popstate event:", event.state);
        const contentKey = event.state?.contentKey;
        const defaultKey = 'mentalita-trader'; // Chiave di default

        if (contentKey && contentLibrary.hasOwnProperty(contentKey)) {
            console.log(`Popstate: Loading content for key: ${contentKey}`);
            loadContent(contentKey);
        } else {
            console.log("Popstate to initial/unknown state, loading default.");
            loadContent(defaultKey);
            // Aggiorna URL/history per riflettere lo stato caricato
            try {
                 history.replaceState({ contentKey: defaultKey }, contentLibrary[defaultKey]?.pageTitle || document.title, `#${defaultKey}`);
            } catch(e) { console.warn("History replaceState failed on popstate default.", e); }
        }
    });
}
// --- END OF FILE js/features/contentLoader.js ---