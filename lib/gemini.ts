// lib/gemini.ts
export async function getScientificSummary(content: string): Promise<string> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        console.error('Clé API manquante. Valeur actuelle:', apiKey)
        throw new Error('Clé API Gemini non configurée dans .env.local')
      }
  
      const prompt = `
  Tu es un expert en vulgarisation scientifique et en analyse de publications académiques. Ta mission est d'analyser le document scientifique ci-dessous et de produire un résumé complet, précis et accessible.
  
  ## CONSIGNES GÉNÉRALES :
  - Adopte un style académique mais accessible (niveau master/doctorat)
  - Sois fidèle au contenu original sans interprétation personnelle
  - Utilise des termes techniques appropriés avec des explications claires
  - Structure ton résumé de manière logique et cohérente
  - Limite-toi aux informations présentes dans le document
  - N'utilise PAS d'astérisques (*) ou d'autres symboles spéciaux autour des titres de sections
  
  ## STRUCTURE OBLIGATOIRE :
  
  CONTEXTE ET ENJEUX
  - Présente le domaine de recherche et sa pertinence
  - Identifie le problème scientifique ou la question de recherche
  - Explique pourquoi cette étude était nécessaire
  - Mentionne les lacunes dans la littérature existante
  
  MÉTHODOLOGIE ET APPROCHE
  - Décris précisément les méthodes utilisées
  - Explique le design expérimental ou l'approche théorique
  - Mentionne les outils, techniques ou instruments employés
  - Précise la taille de l'échantillon, la durée de l'étude, etc.
  - Indique les critères d'inclusion/exclusion si pertinents
  
  RÉSULTATS CLÉS
  - Présente les findings principaux de manière quantifiée
  - Utilise des données chiffrées quand disponibles
  - Organise les résultats par ordre d'importance
  - Distingue les résultats attendus des découvertes surprenantes
  - Mentionne les analyses statistiques réalisées
  
  ANALYSE ET INTERPRÉTATION
  - Explique la signification des résultats obtenus
  - Compare avec les études antérieures
  - Identifie les mécanismes ou processus mis en évidence
  - Discute des implications théoriques et pratiques
  
  LIMITES ET PERSPECTIVES
  - Énumère les limitations méthodologiques
  - Identifie les biais potentiels
  - Propose des pistes d'amélioration pour futures recherches
  - Suggère des applications concrètes des résultats
  
  CONTRIBUTION SCIENTIFIQUE
  - Résume l'apport original de cette recherche
  - Explique en quoi elle fait avancer la connaissance
  - Évalue son impact potentiel sur le domaine
  
  ## CRITÈRES DE QUALITÉ :
  - Longueur optimale : 400-600 mots
  - Phrases claires et bien construites
  - Transitions fluides entre sections
  - Équilibre entre précision technique et accessibilité
  - Aucune information non présente dans le source
  - Format des titres : texte simple sans astérisques ni autres symboles spéciaux
  
  Voici le document à analyser :
  
  """${content}"""
  
  Produis maintenant un résumé suivant exactement cette structure et ces consignes.
  `
  
      console.log('Tentative d\'appel à l\'API Gemini...')
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.3,
              topP: 0.8,
              topK: 40,
              maxOutputTokens: 2048,
            }
          })
        }
      )
  
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Détails de l\'erreur API:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Erreur API Gemini (${response.status}): ${errorData.error?.message || 'Erreur inconnue'}`)
      }
  
      const data = await response.json()
      console.log('Réponse API reçue:', data)
          
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Structure de réponse invalide:', data)
        throw new Error('Format de réponse API invalide')
      }
  
      return data.candidates[0].content.parts[0].text
    } catch (error) {
      console.error('Erreur détaillée:', error)
      if (error instanceof Error) {
        return `Une erreur est survenue : ${error.message}`
      }
      return 'Une erreur inconnue est survenue lors de la génération du résumé.'
    }
  }