// --- START OF FILE js/main.js ---
import { setupModalTriggers, openModal } from './ui/modalHandler.js';
import { setupAuthListeners, loadAuthState, updateLoginStateUI } from './features/auth.js';
import { setupWalletListeners, loadWalletState, updateWalletModalUI, updateTokenDisplayUI } from './features/wallet.js';
import { setupContentLoader, loadContent } from './features/contentLoader.js'; // loadContent non viene più chiamato da qui all'inizio
import { contentLibrary } from './config/contentLibrary.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Initializing...");

    // ** CERCA GLI ELEMENTI DOM QUI DOPO DOMContentLoaded **
    const dynamicContentAreaElement = document.getElementById('dynamic-content-area');
    const mainNavElement = document.getElementById('main-nav');

    // Verifica se gli elementi principali sono stati trovati
    if (!dynamicContentAreaElement || !mainNavElement) {
        console.error("Errore critico: Elementi #dynamic-content-area o #main-nav non trovati nel DOM.");
        document.body.innerHTML = `<p style="color: red; padding: 20px;">Errore critico: Struttura pagina non valida. Contattare supporto.</p>`;
        return; // Interrompe l'inizializzazione
    }

    console.log("Elementi DOM principali trovati.");

    try {
        // 1. Load State
        const initialState = loadAuthState();
        const initialWalletState = loadWalletState();
        console.log("State Loaded.");

        // 2. Setup UI Handlers
        setupModalTriggers();
        console.log("Modal triggers set up.");

        // 3. Setup Feature Listeners - **PASSA GLI ELEMENTI DOM**
        setupAuthListeners();
        setupWalletListeners();
        setupContentLoader(dynamicContentAreaElement, mainNavElement); // Passa gli elementi
        console.log("Feature listeners set up.");

        // 4. Setup Global Button Triggers (Toolbar)
        document.getElementById('login-btn')?.addEventListener('click', () => openModal('loginModal'));
        document.getElementById('signup-btn')?.addEventListener('click', () => openModal('signupModal'));
        document.getElementById('wallet-button')?.addEventListener('click', () => openModal('walletModal'));
        console.log("Global button triggers set up.");

        // 5. Initial UI Updates
        updateLoginStateUI();
        updateWalletModalUI();
        updateTokenDisplayUI();
        console.log("Initial UI updated.");

        // 6. Determine Initial Content Key
        let initialContentKey = 'mentalita-trader'; // Default key
        const hash = window.location.hash.substring(1);
        let updateHistoryState = false;

        if (hash && contentLibrary.hasOwnProperty(hash)) {
            initialContentKey = hash;
        } else {
            if (hash) console.warn(`Hash "#${hash}" invalid, using default.`);
            else console.log("No hash found, using default content key.");
            // Aggiorna la history solo se mancava un hash valido
            if (!window.history.state?.contentKey || window.history.state?.contentKey !== initialContentKey) {
                updateHistoryState = true;
            }
        }

        // Aggiorna lo stato della history *prima* di caricare, se necessario
        if (updateHistoryState) {
            try {
                history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
                console.log(`History state replaced for default key: ${initialContentKey}`);
            } catch (e) { console.warn("History replaceState failed during initial load.", e); }
        }

        // ** CHIAMA loadContent INIZIALE ** - Passando gli elementi DOM
        console.log(`Loading initial content for: ${initialContentKey}`);
        loadContent(initialContentKey, dynamicContentAreaElement, mainNavElement);

        console.log("Initialization sequence complete.");

    } catch (error) {
        console.error("Error during application initialization:", error);
        dynamicContentAreaElement.innerHTML = `<p style="color: red; padding: 20px;">Errore critico durante l'inizializzazione. Controlla la console (F12).</p>`;
    }
});
// --- END OF FILE js/main.js ---