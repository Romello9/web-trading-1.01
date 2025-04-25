// --- START OF FILE js/features/contentLoader.js ---
import { contentLibrary } from '../config/contentLibrary.js';
import { handleChallengeClick } from './challenges.js';
import { hasAchievement } from './wallet.js';

// Funzione helper per creare elementi DOM
function createAndAppend(parent, tag, properties = {}, textContent = null) {
    const element = document.createElement(tag);
    Object.keys(properties).forEach(key => element[key] = properties[key]);
    if (textContent !== null) element.textContent = textContent;
    parent.appendChild(element);
    return element;
}

// Renderizza una singola sezione
function renderContentSection(sectionData) {
    const sectionElement = document.createElement('section');
    sectionElement.id = sectionData?.id || `section-${Math.random().toString(36).substring(7)}`;

    const titleElement = createAndAppend(sectionElement, 'h2');
    createAndAppend(titleElement, 'i', { className: `fas ${sectionData?.icon || 'fa-file-alt'}` });
    titleElement.appendChild(document.createTextNode(` ${sectionData?.title || 'Sezione senza titolo'}`));

    const contentDiv = createAndAppend(sectionElement, 'div', { className: 'section-content' });
    contentDiv.innerHTML = sectionData?.content || '<p>Contenuto non disponibile.</p>';

    if (sectionData.challenges && Array.isArray(sectionData.challenges) && sectionData.challenges.length > 0) {
        sectionData.challenges.forEach(challenge => {
            const challengeId = challenge?.id;
            if (!challengeId) return;
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
            challengeDesc.textContent = description;
            challengeDesc.appendChild(document.createTextNode(' '));
            const challengeLink = createAndAppend(challengeDesc, 'a', { href: '#', className: linkClass, textContent: linkText });
            challengeLink.dataset.challengeId = challengeId;
            challengeLink.dataset.reward = reward;
            if (!isCompleted) {
                challengeLink.addEventListener('click', handleChallengeClick);
            } else {
                challengeLink.addEventListener('click', (e) => e.preventDefault());
            }
        });
    }
    return sectionElement;
}

// Evidenzia link attivo nel nav - **ACCETTA mainNavElement COME ARGOMENTO**
function highlightActiveNavLink(activeKey, mainNavElement) {
    if (!mainNavElement) {
        console.warn("highlightActiveNavLink: mainNavElement non fornito.");
        return;
    }
    try {
        mainNavElement.querySelectorAll('ul li a').forEach(link => {
            link.classList.remove('active');
            if (activeKey && link.dataset.contentKey === activeKey) {
                link.classList.add('active');
            }
        });
    } catch (e) {
        console.error("Errore in highlightActiveNavLink:", e, "Elemento ricevuto:", mainNavElement);
    }
}

// Carica e renderizza il contenuto - **ACCETTA dynamicContentAreaElement e mainNavElement COME ARGOMENTI**
export function loadContent(contentKey, dynamicContentAreaElement, mainNavElement) {
    if (!dynamicContentAreaElement) {
        console.error("loadContent: dynamicContentAreaElement non fornito!");
        return;
    }

    dynamicContentAreaElement.innerHTML = `<div class="loading-placeholder"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Caricamento...</p></div>`;

    setTimeout(() => {
        try {
            const contentData = contentLibrary[contentKey];
            if (!contentData) throw new Error(`Dati non trovati per: "${contentKey}"`);
            if (!Array.isArray(contentData.sections)) throw new Error(`Sezioni non valide per: "${contentKey}"`);

            console.log(`Rendering content for: ${contentKey}`);
            document.title = contentData.pageTitle || 'Trading Mindset Platform';
            dynamicContentAreaElement.innerHTML = ''; // Pulisci

            contentData.sections.forEach(section => {
                if (typeof section === 'object' && section !== null) {
                    dynamicContentAreaElement.appendChild(renderContentSection(section));
                } else {
                    console.warn(`Dati sezione non validi per "${contentKey}":`, section);
                }
            });

            highlightActiveNavLink(contentKey, mainNavElement); // Passa mainNavElement
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (window.history.state?.contentKey !== contentKey) {
                history.pushState({ contentKey: contentKey }, contentData.pageTitle || '', `#${contentKey}`);
            }
        } catch (error) {
            console.error(`Errore caricamento/render "${contentKey}":`, error);
            dynamicContentAreaElement.innerHTML = `<p style="color: red; text-align: center;">Errore: ${error.message}. Controlla console (F12).</p>`;
            document.title = 'Trading Mindset Platform - Errore';
            highlightActiveNavLink(contentKey, mainNavElement); // Passa mainNavElement anche in caso di errore
        }
    }, 50);
}

// Setup listeners - **ACCETTA dynamicContentAreaElement e mainNavElement COME ARGOMENTI**
export function setupContentLoader(dynamicContentAreaElement, mainNavElement) {
    if (!mainNavElement || !dynamicContentAreaElement) {
        console.error("setupContentLoader: Elementi DOM necessari non forniti.");
        return;
    }

    // Listener per click su nav
    mainNavElement.addEventListener('click', (e) => {
        const navLink = e.target.closest('a[data-content-key]');
        if (navLink) {
            e.preventDefault();
            const contentKey = navLink.dataset.contentKey;
            if (window.history.state?.contentKey !== contentKey) {
                console.log(`Navigating to: ${contentKey} (click)`);
                // Passa gli elementi DOM a loadContent
                loadContent(contentKey, dynamicContentAreaElement, mainNavElement);
            } else {
                 console.log(`Content key ${contentKey} già attivo.`);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
             }
        }
    });

    // Listener per history back/forward
    window.addEventListener('popstate', (event) => {
        console.log("Popstate event. State:", event.state);
        const contentKey = event.state?.contentKey;
        const defaultKey = 'mentalita-trader';

        let keyToLoad = defaultKey;
        if (contentKey && contentLibrary.hasOwnProperty(contentKey)) {
            keyToLoad = contentKey;
        } else {
            console.log("Popstate: Stato nullo o invalido, caricamento default.");
            // Aggiorna history state solo se diverso dal default per evitare loop
            if(window.history.state?.contentKey !== defaultKey) {
                try {
                    history.replaceState({ contentKey: defaultKey }, contentLibrary[defaultKey]?.pageTitle || document.title, `#${defaultKey}`);
                } catch(e) { console.warn("History replaceState fallito su popstate default.", e); }
            }
        }
        console.log(`Popstate: Loading: ${keyToLoad}`);
        // Passa gli elementi DOM a loadContent
        loadContent(keyToLoad, dynamicContentAreaElement, mainNavElement);
    });
}
// --- END OF FILE js/features/contentLoader.js ---