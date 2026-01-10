/**
 * CreationModeSelector - Initial choice between AI and Manual planning creation
 * AI is the primary/featured option, Manual is secondary
 */

import { motion } from 'motion/react'

export interface CreationModeSelectorProps {
  onSelectAI: () => void
  onSelectManual: () => void
}

export function CreationModeSelector({
  onSelectAI,
  onSelectManual,
}: CreationModeSelectorProps): JSX.Element {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Creer un nouveau planning
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Choisissez comment vous souhaitez commencer
        </p>
      </motion.div>

      {/* Cards container */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* AI Card - Primary */}
        <motion.button
          type="button"
          onClick={onSelectAI}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-left
            bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700
            text-white shadow-lg shadow-violet-500/25
            ring-2 ring-violet-400/50 ring-offset-2 ring-offset-white
            cursor-pointer group"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            Recommande
          </div>

          {/* Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          {/* Content */}
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Generer avec l'IA
          </h2>
          <p className="text-violet-100 text-sm sm:text-base leading-relaxed">
            Decrivez votre situation en quelques phrases et laissez l'IA creer votre planning automatiquement.
          </p>

          {/* Features */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-violet-100">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>Configuration automatique</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-violet-100">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>Taches et objectifs suggeres</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-violet-100">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>Liste de courses incluse</span>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRightIcon className="w-5 h-5" />
          </div>
        </motion.button>

        {/* Manual Card - Secondary */}
        <motion.button
          type="button"
          onClick={onSelectManual}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-left
            bg-white border-2 border-gray-200
            text-gray-900 shadow-sm
            cursor-pointer group hover:border-gray-300 hover:shadow-md
            transition-all"
        >
          {/* Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PencilIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600" />
          </div>

          {/* Content */}
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Creer manuellement
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            Configurez chaque element de votre planning etape par etape selon vos besoins.
          </p>

          {/* Features */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>Controle total</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>Formulaire guide</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>Etapes optionnelles</span>
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="absolute bottom-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:translate-x-1 group-hover:bg-gray-200 transition-all">
            <ArrowRightIcon className="w-5 h-5 text-gray-600" />
          </div>
        </motion.button>
      </div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-sm text-gray-500 text-center"
      >
        Vous pourrez toujours modifier votre planning apres creation
      </motion.p>
    </div>
  )
}

// Icons
function SparklesIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function PencilIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'w-5 h-5' }: { className?: string }): JSX.Element {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default CreationModeSelector
