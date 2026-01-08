/**
 * Generateur d'IDs securises pour le planning
 * Utilise crypto.randomUUID() pour eviter les collisions
 */

/**
 * Genere un ID unique securise
 * @param prefix - Prefixe optionnel pour l'ID
 * @returns ID unique au format UUID ou prefixe
 */
export function generateId(prefix: string = ''): string {
  const uuid = crypto.randomUUID()
  return prefix ? `${prefix}_${uuid}` : uuid
}

/**
 * Genere un ID court (8 caracteres) pour les cas ou un UUID complet n'est pas necessaire
 * @param prefix - Prefixe optionnel pour l'ID
 * @returns ID court
 */
export function generateShortId(prefix: string = ''): string {
  const shortId = crypto.randomUUID().split('-')[0]
  return prefix ? `${prefix}_${shortId}` : shortId
}

/**
 * Verifie si une chaine est un ID temporaire (legacy)
 * @param id - ID a verifier
 * @returns true si c'est un ID temporaire legacy
 */
export function isLegacyTempId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('temp-')
}
