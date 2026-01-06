/**
 * PrintablePlanning - Container principal pour le planning imprimable minimaliste
 * Layout A4 paysage (297mm x 210mm)
 * CSS print-specific (@media print)
 */

import { PrintableHeader } from './PrintableHeader'
import { WeekGrid } from './WeekGrid'
import { MilestoneSidebar } from './MilestoneSidebar'

/**
 * Calcule la date de debut de semaine (lundi)
 * @param {Date} date - Date de reference
 * @returns {Date} - Date du lundi
 */
function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Composant principal du planning imprimable
 * @param {Object} props
 * @param {Array} props.users - Liste des utilisateurs
 * @param {Array} props.tasks - Liste des taches
 * @param {Array} props.milestones - Liste des objectifs
 * @param {Object} props.config - Configuration du planning
 * @param {Date} [props.weekStart] - Date de debut de semaine (optionnel)
 * @param {boolean} [props.showPrintButton=true] - Afficher le bouton imprimer
 * @param {function} [props.onClose] - Callback de fermeture
 */
export function PrintablePlanning({
  users = [],
  tasks = [],
  milestones = [],
  config = {},
  weekStart,
  showPrintButton = true,
  onClose
}) {
  const startDate = weekStart || getWeekStart()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="printable-planning-wrapper">
      {/* Barre d'actions (cachee a l'impression) */}
      {(showPrintButton || onClose) && (
        <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
          {showPrintButton && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
            >
              Imprimer
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-lg"
            >
              Fermer
            </button>
          )}
        </div>
      )}

      {/* Container A4 paysage */}
      <div className="printable-page bg-white mx-auto my-4 p-6 shadow-lg print:shadow-none print:m-0 print:p-4">
        {/* En-tete */}
        <PrintableHeader users={users} weekStart={startDate} />

        {/* Corps: Grille + Sidebar */}
        <div className="flex gap-4">
          {/* Grille principale (prend l'espace restant) */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <WeekGrid
              users={users}
              tasks={tasks}
              config={config}
              weekStart={startDate}
            />
          </div>

          {/* Sidebar des objectifs */}
          <MilestoneSidebar
            milestones={milestones}
            users={users}
          />
        </div>

        {/* Pied de page */}
        <footer className="mt-4 pt-3 border-t border-gray-200 text-center">
          <p className="text-xs font-serif text-gray-400">
            Planning Familial - Imprime le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </footer>
      </div>

      {/* Styles CSS specifiques a l'impression */}
      <style>{`
        /* Styles pour le container A4 paysage */
        .printable-page {
          width: 297mm;
          min-height: 210mm;
          box-sizing: border-box;
        }

        /* Police serif pour l'impression */
        .printable-page,
        .printable-page * {
          font-family: Georgia, 'Times New Roman', serif;
        }

        /* Styles d'impression */
        @media print {
          /* Masquer les elements non imprimables */
          .no-print {
            display: none !important;
          }

          /* Configuration de la page A4 paysage */
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          /* Reset du body */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Container principal */
          .printable-planning-wrapper {
            width: 100%;
            margin: 0;
            padding: 0;
          }

          .printable-page {
            width: 100%;
            min-height: auto;
            margin: 0;
            padding: 5mm;
            box-shadow: none !important;
          }

          /* Forcer les couleurs en impression */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Eviter les coupures de page indesirables */
          .week-grid,
          .milestone-sidebar,
          .print-header {
            page-break-inside: avoid;
          }

          /* Bordures plus fines en impression */
          table, th, td {
            border-color: #ccc !important;
          }

          /* Texte plus sombre pour meilleure lisibilite */
          .text-gray-500 {
            color: #4a4a4a !important;
          }

          .text-gray-400 {
            color: #666 !important;
          }

          /* Reduire la taille de police si necessaire */
          .week-grid table {
            font-size: 9px !important;
          }

          .week-grid th,
          .week-grid td {
            padding: 2px 4px !important;
          }
        }

        /* Mode apercu (non-print) */
        @media screen {
          .printable-planning-wrapper {
            background-color: #f3f4f6;
            min-height: 100vh;
            padding: 20px 0;
          }

          .printable-page {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
          }
        }
      `}</style>
    </div>
  )
}

export default PrintablePlanning
