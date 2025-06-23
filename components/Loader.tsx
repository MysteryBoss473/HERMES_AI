// components/Loader.tsx
import { motion } from 'framer-motion'
import '@/app/styles/components/Loader.css'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function Loader() {
  const { t } = useLanguage();
  return (
    <div className="loader-container">
      {/* Loader principal */}
      <div className="loader-spinner">
        {/* Cercle de fond pulsant */}
        <div className="loader-pulse"></div>

        {/* Cercle rotatif externe */}
        <div className="loader-circle-outer"></div>

        {/* Cercle rotatif interne */}
        <div className="loader-circle-inner"></div>

        {/* Icône centrale */}
        <div className="loader-icon">
          <div className="loader-icon-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Texte animé */}
      <div className="loader-text">
        <div className="loader-words">
          <span className="loader-word">{t('loader', 'analyzing')}</span>
          <div className="loader-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        </div>
        <div className="loader-status">{t('loader', 'processing')}</div>
      </div>
    </div>
  )
}
  