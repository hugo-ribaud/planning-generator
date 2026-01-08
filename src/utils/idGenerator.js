/**
 * Générateur d'IDs sécurisés pour le planning
 * Utilise crypto.randomUUID() pour éviter les collisions
 */

/**
 * Génère un ID unique sécurisé
 * @param {string} [prefix] - Préfixe optionnel pour l'ID
 * @returns {string} ID unique au format UUID ou préfixé
 */
export function generateId(prefix = '') {
  const uuid = crypto.randomUUID()
  return prefix ? `${prefix}_${uuid}` : uuid
}

/**
 * Génère un ID court (8 caractères) pour les cas où un UUID complet n'est pas nécessaire
 * @param {string} [prefix] - Préfixe optionnel pour l'ID
 * @returns {string} ID court
 */
export function generateShortId(prefix = '') {
  const shortId = crypto.randomUUID().split('-')[0]
  return prefix ? `${prefix}_${shortId}` : shortId
}

/**
 * Vérifie si une chaîne est un ID temporaire (legacy)
 * @param {string} id - ID à vérifier
 * @returns {boolean} true si c'est un ID temporaire legacy
 */
export function isLegacyTempId(id) {
  return typeof id === 'string' && id.startsWith('temp-')
}
