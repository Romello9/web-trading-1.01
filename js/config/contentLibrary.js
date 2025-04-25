// --- START OF FILE js/config/contentLibrary.js ---
// js/config/contentLibrary.js

// Importa i contenuti specifici dai file separati
import { mentalitaTraderContent } from './content/mentalitaTrader.js';
import { analisiTecnicaMurphyContent } from './content/analisiTecnicaMurphy.js';
import { gestioneRischioContent } from './content/gestioneRischio.js';
import { giocoInterioreContent } from './content/giocoInteriore.js'; // Assicurati che questo file esista

// Esporta un unico oggetto che aggrega tutti i contenuti
// Le chiavi devono corrispondere agli attributi data-content-key in index.html
export const contentLibrary = {
    'mentalita-trader': mentalitaTraderContent,
    'analisi-tecnica-murphy': analisiTecnicaMurphyContent,
    'gestione-rischio': gestioneRischioContent,
    'gioco-interiore': giocoInterioreContent
    // Aggiungi qui altre chiavi e contenuti importati
};
// --- END OF FILE js/config/contentLibrary.js ---