--- START OF FILE js/config/contentLibrary.js ---
// js/config/contentLibrary.js

// Importa i contenuti specifici dai file separati
import { mentalitaTraderContent } from './content/mentalitaTrader.js';
import { analisiTecnicaMurphyContent } from './content/analisiTecnicaMurphy.js';
import { gestioneRischioContent } from './content/gestioneRischio.js';
import { giocoInterioreContent } from './content/giocoInteriore.js'; // <-- NUOVO IMPORT

// Esporta un unico oggetto che aggrega tutti i contenuti
// Le chiavi ('mentalita-trader', 'analisi-tecnica-murphy', ecc.)
// sono quelle usate negli attributi data-content-key in index.html
export const contentLibrary = {
    'mentalita-trader': mentalitaTraderContent,
    'analisi-tecnica-murphy': analisiTecnicaMurphyContent,
    'gestione-rischio': gestioneRischioContent,
    'gioco-interiore': giocoInterioreContent // <-- NUOVA CHIAVE/CONTENUTO
    // Aggiungi qui altre chiavi e contenuti importati quando creeremo nuove pagine
};

// Nota: Il file js/config/content.js originale (se esisteva) ora non serve più.
// Il modulo contentLoader.js ora importerà da questo file.
--- END OF FILE js/config/contentLibrary.js ---