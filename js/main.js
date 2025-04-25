// --- START OF FILE js/main.js ---
import { setupModalTriggers, openModal } from './ui/modalHandler.js';
import { setupAuthListeners, loadAuthState, updateLoginStateUI } from './features/auth.js';
import { setupWalletListeners, loadWalletState, updateWalletModalUI, updateTokenDisplayUI } from './features/wallet.js';
import { setupContentLoader, loadContent } from './features/contentLoader.js';
import { contentLibrary } from './config/contentLibrary.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Starting initialization...");

    // ** DEBUG: Verifica diretta degli elementi **
    const dynamicContentAreaCheck = document.getElementById('dynamic-content-area');
    const mainNavCheck = document.getElementById('main-nav');
    console.log("DEBUG: Check #dynamic-content-area ->", dynamicContentAreaCheck);
    console.log("DEBUG: Check #main-nav ->", mainNavCheck);
    // ** FINE DEBUG **

    // Ora usa le variabili di check nel controllo
    if (!dynamicContentAreaCheck || !mainNavCheck) {
        console.error("Errore critico: Elementi #dynamic-content-area o #main-nav non trovati nel DOM all'interno di DOMContentLoaded.");
        document.body.innerHTML = `<p style="color: red; padding: 20px;">Errore critico: Struttura pagina non valida. Controllare ID elementi in HTML e console (F12).</p>`;
        return; // Interrompe l'inizializzazione
    }

    // Se gli elementi esistono, procedi
    console.log("Elementi DOM principali trovati. Procedendo con il resto...");
    const dynamicContentAreaElement = dynamicContentAreaCheck; // Usa gli elementi verificati
    const mainNavElement = mainNavCheck;

    try {
        // 1. Load State
        const initialState = loadAuthState();
        const initialWalletState = loadWalletState();
        console.log("State Loaded.");

        // 2. Setup UI Handlers
        setupModalTriggers();
        console.log("Modal triggers set up.");

        // 3. Setup Feature Listeners - Passa gli elementi DOM
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
        let initialContentKey = 'mentalita-trader';
        const hash = window.location.hash.substring(1);
        let updateHistoryState = false;

        if (hash && contentLibrary.hasOwnProperty(hash)) {
            initialContentKey = hash;
        } else {
            if (hash) console.warn(`Hash "#${hash}" invalid, using default.`);
            else console.log("No hash found, using default content key.");
            if (!window.history.state?.contentKey || window.history.state?.contentKey !== initialContentKey) {
                updateHistoryState = true;
            }
        }

        if (updateHistoryState) {
            try {
                history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
            } catch (e) { console.warn("History replaceState failed during initial load.", e); }
        }

        // Chiama loadContent iniziale - Passando gli elementi DOM
        console.log(`Loading initial content for: ${initialContentKey}`);
        loadContent(initialContentKey, dynamicContentAreaElement, mainNavElement);

        console.log("Initialization sequence complete.");

    } catch (error) {
        console.error("Error during application initialization (after DOM checks):", error);
        dynamicContentAreaElement.innerHTML = `<p style="color: red; padding: 20px;">Errore durante l'inizializzazione. Controlla la console (F12).</p>`;
    }
});
// --- END OF FILE js/main.js ---