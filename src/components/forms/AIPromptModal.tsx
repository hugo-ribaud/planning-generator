/**
 * AIPromptModal - Modal for AI-powered planning generation
 * Allows users to describe their planning in natural language
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '../ui'
import { useAIGenerator } from '../../hooks'
import { EXAMPLE_PROMPTS } from '../../services/aiGenerator'
import { AIPromptPreview } from './AIPromptPreview'
import type { TransformedPlanningData } from '../../hooks'

export interface AIPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (data: TransformedPlanningData) => void
}

export function AIPromptModal({ isOpen, onClose, onApply }: AIPromptModalProps): JSX.Element | null {
  const [prompt, setPrompt] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  const {
    loading,
    error,
    transformedResult,
    generate,
    reset,
  } = useAIGenerator()

  const handleClose = (): void => {
    reset()
    setPrompt('')
    setShowExamples(false)
    onClose()
  }

  const handleGenerate = async (): Promise<void> => {
    await generate(prompt)
  }

  const handleApply = (): void => {
    if (transformedResult) {
      onApply(transformedResult)
      handleClose()
    }
  }

  const handleExampleClick = (examplePrompt: string): void => {
    setPrompt(examplePrompt)
    setShowExamples(false)
  }

  const handleRegenerate = (): void => {
    reset()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-violet-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl text-white">
                  <SparklesIcon />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Generer avec l'IA
                  </h2>
                  <p className="text-sm text-gray-600">
                    Decrivez votre planning en quelques phrases
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {!transformedResult ? (
              // Prompt input phase
              <div className="space-y-4">
                {/* Textarea */}
                <div>
                  <label
                    htmlFor="ai-prompt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Decrivez votre planning
                  </label>
                  <textarea
                    id="ai-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Planning hebdomadaire pour Hugo et Delphine. Hugo travaille 9h-17h, Delphine 8h-18h. Taches: courses, menage, cuisine..."
                    className="w-full h-40 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none text-gray-900 placeholder-gray-400"
                    disabled={loading}
                  />
                </div>

                {/* Examples toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowExamples(!showExamples)}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                  >
                    <LightbulbIcon />
                    {showExamples ? 'Masquer les exemples' : 'Voir des exemples'}
                  </button>

                  <AnimatePresence>
                    {showExamples && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        {EXAMPLE_PROMPTS.map((example, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleExampleClick(example.prompt)}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-lg transition-colors group"
                          >
                            <p className="font-medium text-gray-900 group-hover:text-violet-700">
                              {example.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {example.prompt}
                            </p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                {/* Loading state */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-8"
                  >
                    <div className="flex items-center gap-3 text-violet-600">
                      <LoadingSpinner />
                      <span className="font-medium">Generation en cours...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              // Preview phase
              <AIPromptPreview data={transformedResult} />
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
            <Button variant="ghost" onClick={handleClose}>
              Annuler
            </Button>

            <div className="flex gap-3">
              {transformedResult ? (
                <>
                  <Button variant="secondary" onClick={handleRegenerate}>
                    Regenerer
                  </Button>
                  <Button variant="primary" onClick={handleApply}>
                    Appliquer
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? 'Generation...' : 'Generer'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Icons
function SparklesIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
}

function CloseIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function LightbulbIcon(): JSX.Element {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function LoadingSpinner(): JSX.Element {
  return (
    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export default AIPromptModal
