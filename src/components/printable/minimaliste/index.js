/**
 * Printable Minimaliste Components
 *
 * Composants pour le planning imprimable avec style minimaliste
 * - Couleurs: Noir, gris, blanc uniquement
 * - Police: Serif pour meilleure lisibilite
 * - Layout: A4 paysage optimise pour l'impression
 */

export { PrintableHeader } from './PrintableHeader'
export { WeekGrid } from './WeekGrid'
export { MilestoneSidebar } from './MilestoneSidebar'
export { PrintablePlanning } from './PrintablePlanning'

// Export par defaut du container principal
export { PrintablePlanning as default } from './PrintablePlanning'
