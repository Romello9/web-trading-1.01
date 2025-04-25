// --- START OF FILE js/main.js ---
// js/main.js (Entry Point)
import { setupModalTriggers, openModal } from './ui/modalHandler.js';
import { setupAuthListeners, loadAuthState, updateLoginStateUI } from './features/auth.js';
import { setupWalletListeners, loadWalletState, updateWalletModalUI, updateTokenDisplayUI } from './features/wallet.js';
import { setupContentLoader, loadContent } from './features/contentLoader.js';
import { contentLibrary } from './config/contentLibrary.js'; // Importa per check hash

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Trading Mindset Platform...");

    try {
        // 1. Load State (Auth and Wallet/Achievements)
        const initialState = loadAuthState();
        const initialWalletState = loadWalletState();
        console.log("Initial State Loaded:", { auth: initialState, wallet: initialWalletState });

        // 2. Setup UI Handlers
        setupModalTriggers(); // Listeners for close/switch modals

        // 3. Setup Feature Listeners
        setupAuthListeners();   // Listeners for login/signup forms, logout button
        setupWalletListeners(); // Listeners for connect/disconnect wallet buttons
        setupContentLoader(); // Listeners for main navigation and history API (popstate)

        // 4. Setup Global Triggers (Buttons in Toolbar opening modals)
        document.getElementById('login-btn')?.addEventListener('click', () => openModal('loginModal'));
        document.getElementById('signup-btn')?.addEventListener('click', () => openModal('signupModal'));
        document.getElementById('wallet-button')?.addEventListener('click', () => openModal('walletModal'));

        // 5. Initial UI Update based on loaded state
        updateLoginStateUI();
        updateWalletModalUI();
        updateTokenDisplayUI();

        // 6. Load Initial Content
        let initialContentKey = 'mentalita-trader'; // Default key
        const hash = window.location.hash.substring(1);

        if (hash && contentLibrary.hasOwnProperty(hash)) {
            initialContentKey = hash;
            console.log(`Loading content from valid hash: #${initialContentKey}`);
        } else if (hash) {
            console.warn(`Hash "#${hash}" not found or invalid, loading default content.`);
             // Rimuovi hash non valido e imposta quello di default
             history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
        } else {
             // Se non c'è hash, imposta quello di default nell'URL
             console.log(`No hash found, setting default content key: ${initialContentKey}`);
             history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
        }

        loadContent(initialContentKey);

        console.log("Trading Mindset Platform Initialized Successfully.");

    } catch (error) {
        console.error("Error during application initialization:", error);
        // Potresti voler mostrare un messaggio di errore all'utente qui
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = `<p style="color: red; padding: 20px;">Errore critico durante l'inizializzazione dell'applicazione. Controlla la console.</p>`;
        }
    }
});
// --- END OF FILE js/main.js ---