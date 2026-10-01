// @ts-check

/**
 * Utilitaires partagés par les tests e2e de l'application de gestion des congés.
 */

/**
 * Retourne la date du prochain lundi (jour ouvré garanti) à partir d'une date donnée.
 * @param {Date} fromDate
 * @param {number} weeksAhead Nombre de semaines supplémentaires à décaler (pour obtenir des
 *   périodes distinctes et non chevauchantes entre plusieurs tests).
 * @returns {Date}
 */
function prochainLundi(fromDate = new Date(), weeksAhead = 0) {
  const date = new Date(fromDate);
  const jour = date.getDay(); // 0 = dimanche ... 6 = samedi
  const decalage = ((8 - jour) % 7) || 7;
  date.setDate(date.getDate() + decalage + weeksAhead * 7);
  return date;
}

/**
 * Formate une date au format attendu par un `<input type="date">` (yyyy-MM-dd).
 * @param {Date} date
 * @returns {string}
 */
function auFormatISO(date) {
  return date.toISOString().slice(0, 10);
}

/** Noms des utilisateurs créés par défaut (seed) lors du premier chargement de l'application. */
const UTILISATEURS_SEED = [
  { nom: 'Jean Dupont', email: 'jean.dupont@formation.local' },
  { nom: 'Sophie Martin', email: 'sophie.martin@formation.local' },
  { nom: 'Luc Bernard', email: 'luc.bernard@formation.local' },
];

module.exports = { prochainLundi, auFormatISO, UTILISATEURS_SEED };
