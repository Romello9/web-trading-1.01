// js/config/contentLibrary.js
import { mentalitaTraderContent } from './content/mentalitaTrader.js';
import { analisiTecnicaMurphyContent } from './content/analisiTecnicaMurphy.js';
import { gestioneRischioContent } from './content/gestioneRischio.js';
import { giocoInterioreContent } from './content/giocoInteriore.js';
import { jimSimonsContent } from './content/jimSimons.js'; // <-- NUOVO IMPORT

export const contentLibrary = {
    'mentalita-trader': mentalitaTraderContent,
    'analisi-tecnica-murphy': analisiTecnicaMurphyContent,
    'gestione-rischio': gestioneRischioContent,
    'gioco-interiore': giocoInterioreContent,
    'jim-simons': jimSimonsContent // <-- NUOVA CHIAVE
};