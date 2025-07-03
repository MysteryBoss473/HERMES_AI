// lib/gemini.ts
export async function getScientificSummary(text: string, exigences: string): Promise<string> {
  async function callGemini(prompt: string, temperature = 0.3): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Clé API Gemini non configurée dans .env.local')
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur API Gemini (${response.status}): ${errorData.error?.message || 'Erreur inconnue'}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Réponse vide'
  }

  try {
      
    const prompt1 = `
  Tu es un expert en vulgarisation scientifique et en analyse de publications académiques. Ta mission est d'analyser le document scientifique ci-dessous et de produire un résumé complet, précis, accessible et fidèle.
  
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
  
  REFERENCES
  - Identifie toutes les sources mentionnées dans le document(articles, livres, rapports, sites web, etc.).
  - Pour chaque référence, fournis les informations complètes : noms des auteurs, année de publication, titre de l’ouvrage ou article, titre de la revue ou éditeur, volume, numéro, pages, DOI ou URL si disponibles.
  - Classe les références par ordre alphabétique selon le nom de famille du premier auteur.
  - Ne liste pas de sources non citées dans le document.
  
  ${text}
  
  `
  const res1 = await callGemini(prompt1)

  const prompt2 = `
  Tu es un rédacteur scientifique expérimenté. Voici un résumé structuré d’un article scientifique :

  ${res1}

  ${exigences}
  - NE CHANGE ABSOLUMENT PAS LA STRUCTURE DU RESUME 
  - N'utilise PAS d'astérisques (*) ou d'autres symboles spéciaux autour des titres de sections

  ## CONSIGNES GÉNÉRALES :
  - Adopte un style académique mais accessible (niveau master/doctorat)
  - Sois fidèle au contenu original sans interprétation personnelle
  - Structure ton résumé de manière logique et cohérente
  - Limite-toi aux informations présentes dans le document
  
  ## CRITÈRES DE QUALITÉ :
  - Phrases claires et bien construites
  - Transitions fluides entre sections
  - Équilibre entre précision technique et accessibilité
  - Aucune information non présente dans le source
  - Format des titres : texte simple sans astérisques ni autres symboles spéciaux
  
  `
  const res2 = await callGemini(prompt2)
  return res2
  } catch (error) {
    console.error('Erreur détaillée:', error)
    if (error instanceof Error) {
      return `Une erreur est survenue : ${error.message}`
    }
    return 'Une erreur inconnue est survenue lors de la génération du résumé.'
  }
}