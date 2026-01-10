/**
 * AI Generator Service
 * Client for calling the Supabase Edge Function that proxies Claude API
 */

import { supabase } from '../lib/supabase'
import type { User, Task, PlanningConfig, Milestone, ShoppingList, ShoppingCategory, ShoppingItem } from '../types'

// Shopping list category slug type from Claude
export type ShoppingCategorySlug =
  | 'fruits_legumes'
  | 'viandes_poissons'
  | 'produits_laitiers'
  | 'boulangerie'
  | 'epicerie'
  | 'hygiene_maison'
  | 'surgeles'
  | 'boissons'

// Map Claude's category slugs to app category names and icons
const CATEGORY_MAP: Record<ShoppingCategorySlug, { name: string; icon: string; order: number }> = {
  fruits_legumes: { name: 'Fruits & Legumes', icon: '🥬', order: 0 },
  viandes_poissons: { name: 'Viandes & Poissons', icon: '🥩', order: 1 },
  produits_laitiers: { name: 'Produits Laitiers', icon: '🧀', order: 2 },
  boulangerie: { name: 'Boulangerie', icon: '🥖', order: 3 },
  epicerie: { name: 'Epicerie', icon: '🥫', order: 4 },
  hygiene_maison: { name: 'Hygiene & Maison', icon: '🧴', order: 5 },
  surgeles: { name: 'Surgeles', icon: '❄️', order: 6 },
  boissons: { name: 'Boissons', icon: '🍷', order: 7 },
}

// Response types from the Edge Function
export interface GeneratedPlanningData {
  config: {
    name: string
    period: 'week' | 'month'
    startDate: string
    workStart: string
    workEnd: string
    lunchStart: string
    lunchEnd: string
    slotDuration: 30 | 60 | 90
  }
  users: Array<{
    id: string
    name: string
    color: string
    daysOff: string[]
    constraints?: string
  }>
  tasks: Array<{
    id: string
    name: string
    duration: 30 | 60 | 90 | 120 | 180
    priority: 1 | 2 | 3 | 4
    type: 'solo' | 'common' | 'flexible'
    recurrence: 'daily' | 'weekly' | 'once' | 'custom'
    assignedTo?: string
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'any'
    preferredDays?: string[]
    color?: string
  }>
  milestones?: Array<{
    id: string
    name: string
    description: string
    status: 'not_started' | 'in_progress' | 'completed'
    color: string
  }>
  shoppingList?: Array<{
    category: ShoppingCategorySlug
    items: string[]
  }>
}

export interface GenerateResponse {
  success: boolean
  data: GeneratedPlanningData
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export interface GenerateError {
  error: string
  details?: string
  rawResponse?: string
}

/**
 * Call the Edge Function to generate planning from a natural language prompt
 */
export async function generatePlanningFromPrompt(
  prompt: string
): Promise<GeneratedPlanningData> {
  // Get current session for auth token
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Vous devez etre connecte pour utiliser cette fonctionnalite')
  }

  // Build URL, ensuring no double slashes
  const baseUrl = import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')
  const functionUrl = `${baseUrl}/functions/v1/generate-planning`

  // Call the Edge Function
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ prompt }),
  })

  const result = await response.json()

  if (!response.ok) {
    const error = result as GenerateError
    throw new Error(error.details || error.error || 'Erreur lors de la generation')
  }

  const successResult = result as GenerateResponse

  if (!successResult.success || !successResult.data) {
    throw new Error('Reponse invalide du serveur')
  }

  return successResult.data
}

/**
 * Transform generated data to match app types with proper ID generation
 */
export function transformGeneratedData(data: GeneratedPlanningData): {
  config: Partial<PlanningConfig>
  users: User[]
  tasks: Task[]
  milestones: Milestone[]
  shoppingList: ShoppingList | null
} {
  // Map users with app-compatible structure
  const users: User[] = data.users.map((u, index) => ({
    id: `user-${Date.now()}-${index}`,
    name: u.name,
    color: u.color,
    daysOff: u.daysOff,
    constraints: u.constraints,
  }))

  // Create a mapping from generated IDs to new IDs
  const userIdMap = new Map<string, string>()
  data.users.forEach((u, index) => {
    userIdMap.set(u.id, users[index].id)
  })

  // Map tasks with proper ID references
  const tasks: Task[] = data.tasks.map((t, index) => ({
    id: `task-${Date.now()}-${index}`,
    name: t.name,
    duration: t.duration,
    priority: t.priority,
    type: t.type,
    recurrence: t.recurrence,
    assignedTo: t.assignedTo ? userIdMap.get(t.assignedTo) : undefined,
    preferredTime: t.preferredTime,
    preferredDays: t.preferredDays,
    color: t.color || '',
  }))

  // Map milestones
  const milestones: Milestone[] = (data.milestones || []).map((m, index) => ({
    id: `milestone-${Date.now()}-${index}`,
    name: m.name,
    description: m.description,
    status: m.status,
    color: m.color,
    isFocused: false,
  }))

  // Map config
  const config: Partial<PlanningConfig> = {
    name: data.config.name,
    period: data.config.period,
    startDate: data.config.startDate,
    workStart: data.config.workStart,
    workEnd: data.config.workEnd,
    lunchStart: data.config.lunchStart,
    lunchEnd: data.config.lunchEnd,
    slotDuration: data.config.slotDuration,
  }

  // Map shopping list
  let shoppingList: ShoppingList | null = null
  if (data.shoppingList && data.shoppingList.length > 0) {
    const categories: ShoppingCategory[] = data.shoppingList
      .filter(cat => cat.items && cat.items.length > 0)
      .map((cat) => {
        const categoryInfo = CATEGORY_MAP[cat.category] || {
          name: cat.category,
          icon: '📦',
          order: 99,
        }

        const items: ShoppingItem[] = cat.items.map((itemName, itemIndex) => ({
          id: `item-${Date.now()}-${categoryInfo.order}-${itemIndex}`,
          name: itemName,
          quantity: '1',
          unit: '',
          isChecked: false,
          is_checked: false,
        }))

        return {
          id: `cat-${Date.now()}-${categoryInfo.order}`,
          name: categoryInfo.name,
          icon: categoryInfo.icon,
          order: categoryInfo.order,
          items,
        }
      })
      .sort((a, b) => a.order - b.order)

    if (categories.length > 0) {
      shoppingList = {
        id: `shopping-${Date.now()}`,
        title: 'Liste de courses',
        categories,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  return { config, users, tasks, milestones, shoppingList }
}

/**
 * Example prompts for user guidance
 */
export const EXAMPLE_PROMPTS = [
  {
    title: 'Couple avec chien',
    prompt: `Planning hebdomadaire pour Hugo et Delphine, couple avec un chien.

TÂCHES RÉGULIÈRES :
- Ménage de la maison (2h, 2x/semaine, priorité haute)
- Préparer les repas du soir (1h, tous les jours)
- Promener le chien (30min, matin et soir, quotidien)
- Faire une séance de sport (1h, 3x/semaine pour Hugo)

COURSES À FAIRE :
- Fruits : pommes, bananes, oranges, kiwis
- Légumes : tomates, courgettes, carottes, salade
- Viandes : poulet, steaks hachés
- Produits laitiers : lait, yaourts, beurre, fromage râpé
- Boulangerie : pain de mie, baguettes

OBJECTIFS DU MOIS :
- Perdre 3 kilos avant l'été (en cours)
- Avoir une maison toujours rangée (pas encore commencé)

Hugo travaille 9h-18h, Delphine 8h-17h. Weekend off.`,
  },
  {
    title: 'Colocation étudiante',
    prompt: `Organisation pour une coloc de 3 étudiants : Alex, Sam et Jordan.

ACTIVITÉS À PLANIFIER :
- Nettoyage des parties communes (1h30, 2x/semaine, en rotation)
- Courses communes au supermarché (1h30, 1x/semaine, le samedi matin)
- Sortir les poubelles (15min, 2x/semaine)
- Révisions en groupe (2h, 3x/semaine le soir)

LISTE DE COURSES PARTAGÉE :
- Épicerie : pâtes, riz, huile d'olive, sauce tomate, céréales
- Produits laitiers : lait, crème fraîche, œufs
- Hygiène/maison : papier toilette, liquide vaisselle, éponges, lessive
- Boissons : jus d'orange, café, thé
- Surgelés : pizzas, légumes surgelés, glaces

OBJECTIFS DE LA COLOC :
- Maintenir la cuisine propre en permanence (en cours)
- Économiser 100€/mois sur les courses (pas commencé)

Emplois du temps flexibles, cours principalement le matin.`,
  },
  {
    title: 'Famille avec enfants',
    prompt: `Planning familial pour Marc, Sophie et leurs 2 enfants (Léo 8 ans, Emma 12 ans).

TÂCHES QUOTIDIENNES :
- Préparer le petit-déjeuner (30min, Marc)
- Emmener les enfants à l'école (30min, Sophie)
- Préparer le dîner (1h, en alternance)
- Aide aux devoirs (1h, tous les soirs)

TÂCHES HEBDOMADAIRES :
- Courses alimentaires (2h, samedi matin)
- Ménage complet (3h, samedi, toute la famille)
- Lessive et repassage (2h, dimanche)
- Activités extra-scolaires : foot Léo mercredi, danse Emma samedi

COURSES FAMILLE :
- Fruits : pommes, clémentines, bananes, compotes
- Produits laitiers : lait, yaourts enfants, fromage
- Boulangerie : pain, brioche, céréales
- Surgelés : nuggets, frites, poissons panés

OBJECTIFS :
- Passer plus de temps en famille le weekend (en cours)
- Les enfants font leur lit tous les matins (pas commencé)

Marc travaille 8h30-18h, Sophie 9h-17h (télétravail mercredi). Mercredi après-midi off.`,
  },
  {
    title: 'Freelance solo',
    prompt: `Planning hebdomadaire pour Julie, freelance graphiste travaillant de la maison.

ROUTINE DE TRAVAIL :
- Bloc travail client (3h, matin, lundi à vendredi)
- Prospection et admin (1h, après-midi, 3x/semaine)
- Formation et veille (1h, vendredi après-midi)

VIE QUOTIDIENNE :
- Sport / yoga (1h, matin, 4x/semaine)
- Courses et repas (1h, quotidien)
- Ménage appartement (1h30, 2x/semaine)

COURSES :
- Fruits et légumes : avocats, épinards, tomates cerises, citrons
- Épicerie : quinoa, lentilles, thé vert, amandes
- Produits laitiers : lait d'avoine, yaourt grec
- Boissons : eau gazeuse, café

OBJECTIFS DU MOIS :
- Décrocher 2 nouveaux clients (en cours)
- Finir la refonte de mon portfolio (pas commencé)
- Faire du sport régulièrement (en cours)

Horaires flexibles, préfère travailler 9h-18h avec pause longue le midi.`,
  },
]
