// js/main.js (Entry Point)
import { setupModalTriggers, openModal } from './ui/modalHandler.js';
import { setupAuthListeners, loadAuthState, updateLoginStateUI } from './features/auth.js';
import { setupWalletListeners, loadWalletState, updateWalletModalUI, updateTokenDisplayUI } from './features/wallet.js';
import { setupContentLoader, loadContent } from './features/contentLoader.js';
import { contentLibrary } from './config/contentLibrary.js'; // Necessario per check hash

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Trading Mindset Platform...");
    try {
        const initialState = loadAuthState();
        const initialWalletState = loadWalletState();
        setupModalTriggers();
        setupAuthListeners();
        setupWalletListeners();
        setupContentLoader();

        document.getElementById('login-btn')?.addEventListener('click', () => openModal('loginModal'));
        document.getElementById('signup-btn')?.addEventListener('click', () => openModal('signupModal'));
        document.getElementById('wallet-button')?.addEventListener('click', () => openModal('walletModal'));

        updateLoginStateUI();
        updateWalletModalUI();
        updateTokenDisplayUI();

        let initialContentKey = 'mentalita-trader'; // Default key aggiornata
        const hash = window.location.hash.substring(1);

        if (hash && contentLibrary.hasOwnProperty(hash)) {
            initialContentKey = hash;
        } else {
             history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
        }
        if (!window.history.state?.contentKey && !hash) { // Aggiungi stato iniziale solo se manca e non c'è hash
            history.replaceState({ contentKey: initialContentKey }, contentLibrary[initialContentKey]?.pageTitle || document.title, `#${initialContentKey}`);
        }

        loadContent(initialContentKey);
        console.log("Initialization complete.");

    } catch (error) {
        console.error("Initialization error:", error);
        document.body.innerHTML = `<p style="color: red; padding: 20px;">Errore inizializzazione. Controlla console (F12).</p>`;
    }
});