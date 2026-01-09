/**
 * Supabase Edge Function: generate-planning
 * Proxies requests to Claude API for AI-powered planning generation
 *
 * Security: API key stored in Supabase secrets, never exposed to frontend
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

// System prompt for planning generation
const SYSTEM_PROMPT = `Tu es un assistant expert en organisation familiale qui genere des plannings en JSON.

CONTEXTE:
- Application de planning familial en francais
- Jours de la semaine: lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche

DISTINCTION IMPORTANTE DES TYPES D'ELEMENTS:
Tu dois IMPERATIVEMENT distinguer ces 4 categories d'elements:

1. TACHES (tasks) - Activites PLANIFIABLES dans le temps avec duree et recurrence:
   - Menage, cuisine, lessive, repassage, jardinage
   - Sport, exercice, activites physiques regulieres
   - Travail, reunions, rendez-vous
   - Activites qui prennent du temps et doivent etre planifiees
   - Durees valides: 30, 60, 90, 120, 180 minutes
   - Priorites: 1=Urgent, 2=Haute, 3=Normale, 4=Basse
   - Types: "solo" (une personne), "common" (bloque tous), "flexible" (remplit les espaces)
   - Recurrence: "daily", "weekly", "once", "custom"
   - Preferences horaires: "morning", "afternoon", "evening", "any"

2. LISTE DE COURSES (shoppingList) - Articles a ACHETER:
   - Nourriture: fruits, legumes, viande, poisson, pain, lait, fromage, etc.
   - Produits menagers: lessive, liquide vaisselle, eponges, etc.
   - Hygiene: savon, shampoing, dentifrice, etc.
   - Ce sont des ARTICLES, pas des activites !
   - "Acheter du lait" = article "lait", PAS une tache !
   - Categories: fruits_legumes, viandes_poissons, produits_laitiers, boulangerie, epicerie, hygiene_maison, surgeles, boissons

3. MILESTONES/OBJECTIFS - Buts a ATTEINDRE sur le long terme:
   - "Avoir une maison bien rangee"
   - "Manger plus sainement"
   - "Faire plus de sport"
   - Ce sont des OBJECTIFS de vie, pas des taches planifiables
   - Status: "not_started", "in_progress", "completed"

4. A NE PAS CONFONDRE:
   - "Faire les courses" = TACHE (activite planifiable, ~90min)
   - "Acheter du lait, pain, fromage" = LISTE DE COURSES (articles)
   - "Mieux manger" = MILESTONE (objectif)
   - "Preparer le diner" = TACHE (activite)

SCHEMA JSON REQUIS:
{
  "config": {
    "name": "string - nom du planning",
    "period": "week" | "month",
    "startDate": "YYYY-MM-DD - prochain lundi",
    "workStart": "HH:MM - debut journee (ex: 08:00)",
    "workEnd": "HH:MM - fin journee (ex: 18:00)",
    "lunchStart": "HH:MM - debut pause (ex: 12:00)",
    "lunchEnd": "HH:MM - fin pause (ex: 13:00)",
    "slotDuration": 30 | 60 | 90
  },
  "users": [
    {
      "id": "user-1",
      "name": "string",
      "color": "#hexcode (ex: #3B82F6 bleu, #EC4899 rose, #10B981 vert)",
      "daysOff": ["samedi", "dimanche"],
      "constraints": "string optionnel"
    }
  ],
  "tasks": [
    {
      "id": "task-1",
      "name": "string - nom de l'activite",
      "duration": 30 | 60 | 90 | 120 | 180,
      "priority": 1 | 2 | 3 | 4,
      "type": "solo" | "common" | "flexible",
      "recurrence": "daily" | "weekly" | "once" | "custom",
      "assignedTo": "user-id ou undefined",
      "preferredTime": "morning" | "afternoon" | "evening" | "any",
      "preferredDays": ["lundi", "mercredi"] | undefined,
      "color": "#hexcode optionnel"
    }
  ],
  "milestones": [
    {
      "id": "milestone-1",
      "name": "string - objectif a atteindre",
      "description": "string - description detaillee",
      "status": "not_started" | "in_progress" | "completed",
      "color": "#hexcode"
    }
  ],
  "shoppingList": [
    {
      "category": "fruits_legumes" | "viandes_poissons" | "produits_laitiers" | "boulangerie" | "epicerie" | "hygiene_maison" | "surgeles" | "boissons",
      "items": ["article1", "article2"]
    }
  ]
}

REGLES STRICTES:
- Reponds UNIQUEMENT avec le JSON valide, sans texte avant ou apres
- DISTINGUE BIEN les taches (activites) des articles de courses
- "acheter X" ou "il faut X" pour de la nourriture/produits = shoppingList, PAS tasks
- Utilise des couleurs harmonieuses et distinctes
- Les IDs doivent suivre le format "type-numero"
- La startDate doit etre le prochain lundi
- Durees realistes: courses ~90min, menage ~60min, cuisine ~60min, sport ~60min
- Si l'utilisateur mentionne des aliments/produits, mets-les dans shoppingList`

interface GeneratePlanningRequest {
  prompt: string
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeResponse {
  content: Array<{
    type: 'text'
    text: string
  }>
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }

  try {
    // Get API key from environment
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Parse request body
    const { prompt } = await req.json() as GeneratePlanningRequest

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Prepare Claude API request
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: prompt
      }
    ]

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('Claude API error:', claudeResponse.status, errorText)
      return new Response(
        JSON.stringify({
          error: 'Claude API error',
          details: errorText
        }),
        {
          status: claudeResponse.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    const claudeData = await claudeResponse.json() as ClaudeResponse

    // Extract the generated JSON from Claude's response
    const generatedText = claudeData.content[0]?.text || ''

    // Try to parse the JSON response
    let planningData
    try {
      // Remove potential markdown code blocks if present
      const cleanedText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      planningData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError)
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in response',
          rawResponse: generatedText
        }),
        {
          status: 422,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    // Return the generated planning data
    return new Response(
      JSON.stringify({
        success: true,
        data: planningData,
        usage: claudeData.usage
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})
