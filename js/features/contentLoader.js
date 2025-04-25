--- START OF FILE js/features/contentLoader.js ---
// js/features/contentLoader.js
import { contentLibrary } from '../config/contentLibrary.js'; // <-- ***** RIGA MANCANTE AGGIUNTA *****
import { handleChallengeClick } from './challenges.js';
import { hasAchievement } from './wallet.js'; // Per verificare se le challenge sono completate al render

const dynamicContentArea = document.getElementById('dynamic-content-area');
const mainNav = document.getElementById('main-nav');

/**
 * Renders a single section based on the data provided.
 * @param {object} sectionData - The data object for the section.
 * @returns {string} - The HTML string for the section.
 */
function renderContentSection(sectionData) {
    let challengesHTML = '';
    if (sectionData.challenges && sectionData.challenges.length > 0) {
        challengesHTML = sectionData.challenges.map(challenge => {
            // Verifica se l'achievement esiste e ha un ID valido prima di chiamare hasAchievement
            const challengeId = challenge?.id;
            if (!challengeId) {
                console.warn("Challenge data missing ID:", challenge);
                return ''; // Salta questa challenge se manca l'ID
            }
            const isCompleted = hasAchievement(challengeId);
            const linkText = isCompleted ? 'Completata' : (challenge.linkText || 'Inizia Sfida');
            const linkClass = `resource-link challenge-link ${isCompleted ? 'completed' : ''}`;

            return `
                <div class="challenge">
                    <div class="token-reward"><i class="fas fa-coins"></i> ${challenge.reward || 0} TRAD</div>
                    <h4><i class="fas fa-tasks"></i> ${challenge.title || 'Sfida senza titolo'}</h4>
                    <p>${challenge.description || ''}
                       <a href="#" class="${linkClass}" data-challenge-id="${challengeId}" data-reward="${challenge.reward || 0}">
                          ${linkText}
                       </a>
                    </p>
                </div>
            `;
        }).join('');
    }

    // Aggiungi controlli per proprietà mancanti in sectionData
    const sectionId = sectionData?.id || `section-${Math.random().toString(36).substring(7)}`;
    const sectionIcon = sectionData?.icon || 'fa-file-alt';
    const sectionTitle = sectionData?.title || 'Sezione senza titolo';
    const sectionContent = sectionData?.content || '<p>Contenuto non disponibile.</p>';


    return `
        <section id="${sectionId}">
            <h2><i class="fas ${sectionIcon}"></i> ${sectionTitle}</h2>
            ${sectionContent}
            ${challengesHTML}
        </section>
    `;
}


/**
 * Attacca gli event listener agli elementi dinamici (es. link sfide).
 */
function reAttachEventListeners() {
    if (!dynamicContentArea) return; // Esce se l'area non esiste

    const currentChallengeLinks = dynamicContentArea.querySelectorAll('.challenge-link:not(.completed)');
    currentChallengeLinks.forEach(link => {
        // Rimuovi listener precedenti per sicurezza (opzionale ma buona pratica)
        // Non strettamente necessario se l'elemento viene ricreato, ma previene duplicati se si modifica l'innerHTML parzialmente
        link.replaceWith(link.cloneNode(true)); // Clona per rimuovere vecchi listener
    });
    // Riapplica listener ai nodi clonati
     dynamicContentArea.querySelectorAll('.challenge-link:not(.completed)').forEach(link => {
         link.addEventListener('click', handleChallengeClick);
     });


    // Eventuali altri listener dinamici (tooltip, etc.)
}

/**
 * Evidenzia il link di navigazione attivo.
 * @param {string | null} activeKey - La chiave del contenuto attivo o null.
 */
function highlightActiveNavLink(activeKey) {
    if (!mainNav) return;
    mainNav.querySelectorAll('ul li a').forEach(link => {
        link.classList.remove('active');
        if (activeKey && link.dataset.contentKey === activeKey) {
            link.classList.add('active');
        }
    });
}

/**
 * Carica e renderizza il contenuto principale.
 * @param {string} contentKey - La chiave del contenuto da caricare.
 */
export function loadContent(contentKey) {
     if (!dynamicContentArea) {
        console.error("Dynamic content area not found in the DOM!");
        return;
     }
     // Mostra un indicatore di caricamento (se non già presente)
     dynamicContentArea.innerHTML = `<div class="loading-placeholder" style="text-align: center; padding: 5rem 0;">
            <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--secondary-color);"></i>
            <p style="margin-top: 1rem; color: var(--grey-text);">Caricamento contenuti...</p>
        </div>`;


    // Usa try...catch per gestire errori durante il recupero/rendering
    try {
        const contentData = contentLibrary[contentKey];

        if (!contentData) {
            console.error(`Content data not found for key: ${contentKey}`);
            dynamicContentArea.innerHTML = `<p style="color: var(--danger-color); text-align: center; padding: 3rem 0;">Errore: Contenuto "${contentKey}" non trovato.</p>`;
            document.title = 'Trading Mindset Platform - Errore';
            highlightActiveNavLink(null);
            return;
        }

         if (!Array.isArray(contentData.sections)) {
             console.error(`Content data for key "${contentKey}" does not have a valid 'sections' array.`);
             dynamicContentArea.innerHTML = `<p style="color: var(--danger-color); text-align: center; padding: 3rem 0;">Errore: Dati sezione non validi per "${contentKey}".</p>`;
             document.title = 'Trading Mindset Platform - Errore Dati';
             highlightActiveNavLink(contentKey); // Evidenzia comunque il link cliccato
             return;
         }


        console.log(`Loading content for: ${contentKey}`);
        document.title = contentData.pageTitle || 'Trading Mindset Platform';

        // Costruisci l'HTML in una stringa prima di aggiornare il DOM
        let generatedHtml = '';
        contentData.sections.forEach(section => {
            // Aggiungi un controllo per assicurarti che section sia un oggetto
            if (typeof section === 'object' && section !== null) {
                 generatedHtml += renderContentSection(section);
            } else {
                 console.warn(`Invalid section data encountered for key "${contentKey}":`, section);
            }
        });

        // Aggiorna il DOM solo una volta alla fine
        dynamicContentArea.innerHTML = generatedHtml;


        reAttachEventListeners();
        highlightActiveNavLink(contentKey);

        // Scroll to top of content area or page
        window.scrollTo({ top: 0, behavior: 'smooth' });


        // History API basic update (optional)
        // Metti questo in un blocco try...catch separato
        try {
             // Evita push se lo stato corrente è già quello desiderato
             if (window.history.state?.contentKey !== contentKey) {
                history.pushState({ contentKey: contentKey }, contentData.pageTitle || '', `#${contentKey}`);
            }
        } catch (e) {
            console.warn("History API pushState failed.", e);
        }

     } catch (error) {
         console.error(`Error loading or rendering content for key "${contentKey}":`, error);
          dynamicContentArea.innerHTML = `<p style="color: var(--danger-color); text-align: center; padding: 3rem 0;">Si è verificato un errore durante il caricamento del contenuto. Controlla la console per i dettagli.</p>`;
         document.title = 'Trading Mindset Platform - Errore Caricamento';
         // Potresti voler evidenziare il link anche in caso di errore
         highlightActiveNavLink(contentKey);
     }
}


/**
 * Inizializza il content loader: listener navigazione e gestione history back/forward.
 */
export function setupContentLoader() {
     if (!mainNav) {
         console.warn("Main navigation element not found. Content loading via nav clicks disabled.");
         return;
     }

     // Listener per la navigazione principale
     mainNav.addEventListener('click', (e) => {
        const navLink = e.target.closest('a[data-content-key]');
        if (navLink) {
            e.preventDefault();
            const contentKey = navLink.dataset.contentKey;
            console.log(`Navigating to: ${contentKey}`); // Log per debug
            loadContent(contentKey); // Carica e aggiorna history (la logica pushState è ora dentro loadContent)
        }
    });

    // Listener per i pulsanti avanti/indietro del browser
    window.addEventListener('popstate', (event) => {
         console.log("Popstate event:", event.state); // Log per debug
         const contentKey = event.state?.contentKey; // Usa optional chaining

         if (contentKey && contentLibrary.hasOwnProperty(contentKey)) {
             console.log(`Popstate: Loading content for key: ${contentKey}`);
             // Carica il contenuto senza pushare nello storico di nuovo
             // La funzione loadContent ora gestisce il rendering, il titolo, etc.
             loadContent(contentKey);
         } else {
              // Se lo stato è nullo o la chiave non è valida, carica il contenuto di default
              console.log("Popstate to initial/unknown state, loading default.");
              const defaultKey = 'mentalita-trader'; // Assicurati sia la chiave corretta
              loadContent(defaultKey);
              // Aggiorna l'URL per riflettere lo stato caricato
               try {
                   history.replaceState({ contentKey: defaultKey }, contentLibrary[defaultKey]?.pageTitle || 'Trading Mindset Platform', `#${defaultKey}`);
               } catch(e) { console.warn("History replaceState failed on popstate default.", e); }
         }
     });
}
--- END OF FILE js/features/contentLoader.js ---