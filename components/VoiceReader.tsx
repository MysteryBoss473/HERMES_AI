'use client';

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { AnalysisConfig } from '@/components/FileUpload'

interface VoiceReaderProps {
  text: string;
  config: AnalysisConfig;
}

// Trouve les voix correspondant le mieux à la langue cible, en privilégiant les voix locales
function findBestVoices(voices: SpeechSynthesisVoice[], targetLang: string, maxFallbacks = 3): SpeechSynthesisVoice[] {
  const normalizedTarget = targetLang.toLowerCase().split('-')[0];

  // Chercher d'abord les voix locales correspondant à la langue
  let filtered = voices.filter(v => v.lang.toLowerCase().startsWith(normalizedTarget) && v.localService);

  // Si aucune voix locale, chercher toutes les voix correspondant à la langue
  if (filtered.length === 0) {
    filtered = voices.filter(v => v.lang.toLowerCase().startsWith(normalizedTarget));
  }

  // Si on a trouvé des voix correspondant à la langue, on renvoie toutes
  if (filtered.length > 0) {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }

  // Sinon fallback : prendre maxFallbacks voix quelconques (par exemple, les premières triées par nom)
  const fallback = voices.slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, maxFallbacks);
  return fallback;
}


export default function VoiceReader({ text, config }: VoiceReaderProps) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  const isSpeechSynthesisSupported = typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  useEffect(() => {
    if (!isSpeechSynthesisSupported) {
      console.error('La synthèse vocale n\'est pas supportée par ce navigateur');
      setIsLoading(false);
      return;
    }

    const loadVoices = async () => {
      window.speechSynthesis.cancel();

      let availableVoices = window.speechSynthesis.getVoices();

      if (availableVoices.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        availableVoices = window.speechSynthesis.getVoices();
      }

      if (availableVoices.length > 0) {
        const filteredVoices = findBestVoices(availableVoices, config.language);
        setVoices(filteredVoices);

        // Sélectionne la première voix filtrée comme voix par défaut
        setSelectedVoice(filteredVoices[0] || null);

        voicesLoadedRef.current = true;
      }
      setIsLoading(false);
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = () => {
      if (!voicesLoadedRef.current) {
        loadVoices();
      }
    };

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [config.language, isSpeechSynthesisSupported]);

  const speak = (text: string, voice: SpeechSynthesisVoice) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
          setIsPlaying(false);
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('Erreur de synthèse vocale:', event);
          setIsPlaying(false);
          reject(event);
        };

        window.speechSynthesis.cancel();

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
    } catch {
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    isPlaying ? stopSpeaking() : startSpeaking();
  };

  if (!isSpeechSynthesisSupported) return null;

  return (
    <div className="voice-reader">
      <div className="voice-controls">
        <select
          value={selectedVoice?.name || ''}
          onChange={e => {
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
