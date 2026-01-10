/**
 * AICreationFlow - Full-page AI planning generation experience
 * Adapted from AIPromptModal for embedded use
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '../ui'
import { useAIGenerator } from '../../hooks'
import { EXAMPLE_PROMPTS } from '../../services/aiGenerator'
import { AIPromptPreview } from '../forms/AIPromptPreview'
import type { TransformedPlanningData } from '../../hooks'

export interface AICreationFlowProps {
  onApply: (data: TransformedPlanningData) => void
  onBack: () => void
}

export function AICreationFlow({ onApply, onBack }: AICreationFlowProps): JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  const {
    loading,
    error,
    transformedResult,
    generate,
    reset,
  } = useAIGenerator()

  const handleGenerate = async (): Promise<void> => {
    await generate(prompt)
  }

  const handleApply = (): void => {
    if (transformedResult) {
      onApply(transformedResult)
    }
  }

  const handleRegenerate = (): void => {
    reset()
  }

  const handleExampleClick = (examplePrompt: string): void => {
    setPrompt(examplePrompt)
    setShowExamples(false)
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6"
      >
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Retour"
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl text-white">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Generer avec l'IA
            </h1>
            <p className="text-sm text-gray-600">
              Decrivez votre planning en quelques phrases
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {!transformedResult ? (
            // Prompt input phase
            <motion.div
              key="input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Textarea */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
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
                  className="w-full h-48 sm:h-56 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none text-gray-900 placeholder-gray-400"
                  disabled={loading}
                />

                {/* Examples toggle */}
                <div className="mt-4">
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
                        className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-hidden"
                      >
                        {EXAMPLE_PROMPTS.map((example, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleExampleClick(example.prompt)}
                            className="text-left p-3 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-lg transition-colors group"
                          >
                            <p className="font-medium text-gray-900 group-hover:text-violet-700">
                              {example.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {example.prompt.slice(0, 80)}...
                            </p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                  className="flex items-center justify-center py-12"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-violet-200 rounded-full" />
                      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-violet-600 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-violet-600">Generation en cours...</p>
                      <p className="text-sm text-gray-500 mt-1">L'IA analyse votre demande</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Generate button */}
              {!loading && (
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={onBack}>
                    Retour
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="!bg-gradient-to-r !from-violet-500 !to-indigo-600 hover:!from-violet-600 hover:!to-indigo-700"
                  >
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Generer
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            // Preview phase
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <AIPromptPreview data={transformedResult} />
              </div>

              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={onBack}>
                  Annuler
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleRegenerate}>
                    Regenerer
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleApply}
                    className="!bg-gradient-to-r !from-violet-500 !to-indigo-600 hover:!from-violet-600 hover:!to-indigo-700"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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

function ArrowLeftIcon(): JSX.Element {
  return (
    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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

export default AICreationFlow
