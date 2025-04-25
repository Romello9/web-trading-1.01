// --- START OF FILE js/main.js ---
// js/main.js (Entry Point)
import { setupModalTriggers, openModal } from './ui/modalHandler.js';
import { setupAuthListeners, loadAuthState, updateLoginStateUI } from './features/auth.js';
import { setupWalletListeners, loadWalletState, updateWalletModalUI, updateTokenDisplayUI } from './features/wallet.js';
import { setupContentLoader, loadContent } from './features/contentLoader.js';
import { contentLibrary } from './config/contentLibrary.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired. Initializing...");

    try {
        // 1. Load State
        const initialState = loadAuthState();
        const initialWalletState = loadWalletState();
        console.log("State Loaded:", { auth: initialState, wallet: initialWalletState });

        // 2. Setup UI Handlers
        setupModalTriggers();
        console.log("Modal triggers set up.");

        // 3. Setup Feature Listeners
        setupAuthListeners();
        setupWalletListeners();
        setupContentLoader(); // Setup listener per nav click e popstate
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
        let updateHistoryState = false; // Flag per evitare replaceState non necessario

        if (hash && contentLibrary.hasOwnProperty(hash)) {
            initialContentKey = hash;
            console.log(`Using content key from valid hash: #${initialContentKey}`);
        } else {
             // Se l'hash non è valido o assente, impostiamo il default
            if (hash) {
                 console.warn(`Hash "#${hash}" invalid, using default.`);
            } else {
                 console.log("No hash found, using default content key.");
            }
            // Segna che dobbiamo aggiornare l'URL/history se siamo atterrati senza un hash valido
            if (!window.history.state?.contentKey || window.history.state?.contentKey !== initialContentKey) {
                 updateHistoryState = true;
            }
        }

        // ** NUOVA PARTE: Chiama loadContent con un piccolo ritardo **
        console.log(`Scheduling initial content load for: ${initialContentKey}`);
        setTimeout(() => {
            console.log("Executing scheduled initial content load.");
            // Aggiorna lo stato della history *prima* di caricare, se necessario
            if (updateHistoryState) {
                 try {
                     history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
                     console.log(`History state replaced for default key: ${initialContentKey}`);
                 } catch (e) { console.warn("History replaceState failed during initial load scheduling.", e); }
            }
            loadContent(initialContentKey); // Carica il contenuto iniziale
        }, 0); // Ritardo di 0ms per spostare alla fine del ciclo eventi

        console.log("Initialization sequence complete (initial load scheduled).");

    } catch (error) {
        console.error("Error during application initialization:", error);
        document.body.innerHTML = `<p style="color: red; padding: 20px;">Errore critico durante l'inizializzazione. Controlla la console (F12).</p>`;
    }
});
// --- END OF FILE js/main.js ---