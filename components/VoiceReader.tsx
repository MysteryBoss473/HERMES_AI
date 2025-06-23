'use client';

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface VoiceReaderProps {
  text: string;
}

export default function VoiceReader({ text }: VoiceReaderProps) {
  const { t, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  // Vérifier la compatibilité du navigateur
  const isSpeechSynthesisSupported = typeof window !== 'undefined' && 
    'speechSynthesis' in window && 
    'SpeechSynthesisUtterance' in window;

  // Fonction pour trouver la meilleure voix pour une langue donnée
  const findBestVoiceForLanguage = (voices: SpeechSynthesisVoice[], langCode?: string) => {
    // Utiliser 'fr' comme langue par défaut si langCode n'est pas défini
    const defaultLang = 'fr';
    // Convertir le code de langue en format compatible (ex: 'fr-FR' -> 'fr')
    const targetLang = (langCode || defaultLang).toLowerCase().split('-')[0];
    
    // D'abord, chercher une correspondance exacte
    let voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang) && v.localService);
    
    // Si pas de voix locale, chercher n'importe quelle voix correspondante
    if (!voice) {
      voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang));
    }
    
    // Si toujours pas de voix, prendre la première disponible
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }
    
    return voice || null;
  };

  useEffect(() => {
    if (!isSpeechSynthesisSupported) {
      console.error('La synthèse vocale n\'est pas supportée par ce navigateur');
      setIsLoading(false);
      return;
    }

    const loadVoices = async () => {
      // Forcer la réinitialisation du synthétiseur
      window.speechSynthesis.cancel();

      // Forcer le chargement des voix
      let availableVoices = window.speechSynthesis.getVoices();
      
      if (availableVoices.length === 0) {
        // Si pas de voix, attendre un peu et réessayer
        await new Promise(resolve => setTimeout(resolve, 100));
        availableVoices = window.speechSynthesis.getVoices();
      }

      if (availableVoices.length > 0) {
        // Filtrer et trier les voix
        const processedVoices = availableVoices
          .filter(voice => voice.lang) // Éliminer les voix sans langue
          .sort((a, b) => {
            // Trier d'abord par langue
            const langCompare = a.lang.localeCompare(b.lang);
            if (langCompare !== 0) return langCompare;
            // Puis par nom
            return a.name.localeCompare(b.name);
          });

        console.log('Voix disponibles:', processedVoices.map(v => `${v.name} (${v.lang})`));
        setVoices(processedVoices);
        
        // Sélectionner la meilleure voix pour la langue courante
        const bestVoice = findBestVoiceForLanguage(processedVoices, language);
        if (bestVoice) {
          console.log(`Sélection de la voix: ${bestVoice.name} (${bestVoice.lang})`);
          setSelectedVoice(bestVoice);
        }

        voicesLoadedRef.current = true;
      }

      setIsLoading(false);
    };

    // Charger les voix immédiatement et configurer l'écouteur
    loadVoices();
    
    // Configurer l'écouteur pour le chargement des voix
    window.speechSynthesis.onvoiceschanged = () => {
      if (!voicesLoadedRef.current) {
        loadVoices();
      }
    };

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [language, isSpeechSynthesisSupported]);

  const speak = (text: string, voice: SpeechSynthesisVoice) => {
    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Forcer la langue de la voix
        utterance.lang = voice.lang;

        utterance.onend = () => {
          setIsPlaying(false);
          resolve(true);
        };

        utterance.onerror = (event) => {
          console.error('Erreur de synthèse vocale:', event);
          setIsPlaying(false);
          reject(event);
        };

        // S'assurer que toute lecture précédente est arrêtée
        window.speechSynthesis.cancel();
        
        // Petit délai pour s'assurer que le synthétiseur est prêt
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
          utteranceRef.current = utterance;
        }, 50);
      } catch (error) {
        console.error('Erreur lors de la configuration de la synthèse vocale:', error);
        reject(error);
      }
    });
  };

  const startSpeaking = async () => {
    if (!selectedVoice) return;
    
    try {
      setIsPlaying(true);
      await speak(text, selectedVoice);
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      startSpeaking();
    }
  };

  // Si la synthèse vocale n'est pas supportée, ne rien afficher
  if (!isSpeechSynthesisSupported) {
    return null;
  }

  return (
    <div className="voice-reader">
      <div className="voice-controls">
        <select
          value={selectedVoice?.name || ''}
          onChange={(e) => {
            const newVoice = voices.find(v => v.name === e.target.value);
            if (newVoice) {
              stopSpeaking();
              setSelectedVoice(newVoice);
              console.log(`Changement de voix: ${newVoice.name} (${newVoice.lang})`);
            }
          }}
          className="voice-select"
          disabled={isLoading}
        >
          {voices.length === 0 && <option value="">Chargement des voix...</option>}
          {voices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {`${voice.name} (${voice.lang})`}
            </option>
          ))}
        </select>

        <button
          onClick={togglePlay}
          className="voice-control-button"
          disabled={isLoading || !selectedVoice}
          title={isPlaying ? t('voiceReader', 'pause') : t('voiceReader', 'play')}
        >
          {isLoading ? (
            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6h4v12H6zm8 0h4v12h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18v-2m0 0l-4-4m4 4l4-4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
} 