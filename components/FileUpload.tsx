// components/FileUpload.tsx
'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { extractTextFromPDF } from '@/lib/pdfUtils'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import '@/app/styles/components/FileUpload.css'

interface FileUploadProps {
  onFileSelect: (file: File, config: AnalysisConfig) => void
}

export interface AnalysisConfig {
  language: string,
  languageLevel: 'simple' | 'standard' | 'technique'
  summaryLength: 'court' | 'moyen' | 'detaille'
  maxWords?: number
}

export const languageOptions = [
  { label: "Afrikaans", code: "af" },
  { label: "አማርኛ", code: "am" },
  { label: "Azərbaycan dili", code: "az" },
  { label: "বাংলা", code: "bn" },
  { label: "Català", code: "ca" },
  { label: "Čeština", code: "cs" },
  { label: "Dansk", code: "da" },
  { label: "Nederlands", code: "nl" },
  { label: "English", code: "en" },
  { label: "Español", code: "es" },
  { label: "Euskara", code: "eu" },
  { label: "Filipino", code: "fil" },
  { label: "Français", code: "fr" },
  { label: "Galego", code: "gl" },
  { label: "ગુજરાતી", code: "gu" },
  { label: "Hrvatski", code: "hr" },
  { label: "IsiZulu", code: "zu" },
  { label: "Íslenska", code: "is" },
  { label: "Italiano", code: "it" },
  { label: "ಕನ್ನಡ", code: "kn" },
  { label: "ខ្មែរ", code: "km" },
  { label: "Latviešu", code: "lv" },
  { label: "Lietuvių", code: "lt" },
  { label: "മലയാളം", code: "ml" },
  { label: "मराठी", code: "mr" },
  { label: "Magyar", code: "hu" },
  { label: "ລາວ", code: "lo" },
  { label: "नेपाली", code: "ne" },
  { label: "Norsk", code: "no" },
  { label: "Polski", code: "pl" },
  { label: "Português", code: "pt" },
  { label: "Română", code: "ro" },
  { label: "සිංහල", code: "si" },
  { label: "Slovenčina", code: "sk" },
  { label: "Slovenščina", code: "sl" },
  { label: "Suomi", code: "fi" },
  { label: "Kiswahili", code: "sw" },
  { label: "Svenska", code: "sv" },
  { label: "Ελληνικά", code: "el" },
  { label: "हिन्दी", code: "hi" },
  { label: "日本語", code: "ja" },
  { label: "한국어", code: "ko" },
  { label: "ไทย", code: "th" },
  { label: "Türkçe", code: "tr" },
  { label: "தமிழ்", code: "ta" },
  { label: "తెలుగు", code: "te" },
  { label: "Tiếng Việt", code: "vi" },
  { label: "Українська", code: "uk" },
  { label: "اردو", code: "ur" },
  { label: "中文", code: "zh" },
  { label: "廣東話", code: "yue" },
  { label: "普通话", code: "cmn" }
]

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Configuration par défaut
  const [config, setConfig] = useState<AnalysisConfig>({
    language: t('others', 'lang'),
    languageLevel: 'standard',
    summaryLength: 'moyen'
  })

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      await processFile(droppedFile)
    }
  }

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await processFile(selectedFile)
    }
  }

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    try {
      // Lecture des premières pages pour la prévisualisation
      const preview = await readPDFPreview(selectedFile)
      setPreview(preview)
      setShowConfig(true)
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error)
    }
  }

  const readPDFPreview = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          // Ici nous utiliserions pdf.js pour extraire le texte
          // Pour l'instant, on montre juste les métadonnées
          resolve(`Nom du fichier: ${file.name}\nTaille: ${(file.size / 1024).toFixed(2)} KB\nType: ${file.type}`)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  const configurationVariants = {
    hidden: { opacity: 0, y: 20, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  }

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        
        <div className="file-upload-content">
          <div className="file-upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="file-upload-text">
            <h3 className="file-upload-title">{t('fileUpload', 'title')}</h3>
            <p className="file-upload-subtitle">{t('fileUpload', 'subtitle')}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div
            variants={configurationVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="config-panel glass-effect"
          >
            <div className="preview-section">
              <h3 className="preview-title">{t('fileUpload', 'preview')}</h3>
              <div className="preview-content">
                <pre>{preview}</pre>
              </div>
            </div>

            <div className="config-section">
              <h3 className="config-title">{t('fileUpload', 'config')}</h3>
              
              <div className="config-option">
                <label>{t('fileUpload', 'language')}</label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig((prev) => ({ ...prev, language: e.target.value }))}
                  className="word-limit-input"
                >
                  {languageOptions.map(({ label, code }) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="config-option">
                <label>{t('fileUpload', 'languageLevel')}</label>
                <div className="radio-group">
                  <label className={`radio-option ${config.languageLevel === 'simple' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="languageLevel"
                      value="simple"
                      checked={config.languageLevel === 'simple'}
                      onChange={(e) => setConfig({...config, languageLevel: e.target.value as 'simple'})}
                    />
                    <span>{t('fileUpload', 'simple')}</span>
                  </label>
                  <label className={`radio-option ${config.languageLevel === 'standard' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="languageLevel"
                      value="standard"
                      checked={config.languageLevel === 'standard'}
                      onChange={(e) => setConfig({...config, languageLevel: e.target.value as 'standard'})}
                    />
                    <span>{t('fileUpload', 'standard')}</span>
                  </label>
                  <label className={`radio-option ${config.languageLevel === 'technique' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="languageLevel"
                      value="technique"
                      checked={config.languageLevel === 'technique'}
                      onChange={(e) => setConfig({...config, languageLevel: e.target.value as 'technique'})}
                    />
                    <span>{t('fileUpload', 'technical')}</span>
                  </label>
                </div>
              </div>

              <div className="config-option">
                <label>{t('fileUpload', 'summaryLength')}</label>
                <div className="radio-group">
                  <label className={`radio-option ${config.summaryLength === 'court' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="summaryLength"
                      value="court"
                      checked={config.summaryLength === 'court'}
                      onChange={(e) => setConfig({...config, summaryLength: e.target.value as 'court'})}
                    />
                    <span>{t('fileUpload', 'short')}</span>
                  </label>
                  <label className={`radio-option ${config.summaryLength === 'moyen' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="summaryLength"
                      value="moyen"
                      checked={config.summaryLength === 'moyen'}
                      onChange={(e) => setConfig({...config, summaryLength: e.target.value as 'moyen'})}
                    />
                    <span>{t('fileUpload', 'medium')}</span>
                  </label>
                  <label className={`radio-option ${config.summaryLength === 'detaille' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="summaryLength"
                      value="detaille"
                      checked={config.summaryLength === 'detaille'}
                      onChange={(e) => setConfig({...config, summaryLength: e.target.value as 'detaille'})}
                    />
                    <span>{t('fileUpload', 'detailed')}</span>
                  </label>
                </div>
              </div>

              <div className="config-option">
                <label>{t('fileUpload', 'maxWords')}</label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={config.maxWords || ''}
                  onChange={(e) => setConfig({...config, maxWords: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="word-limit-input"
                  placeholder="Ex: 500"
                />
              </div>
            </div>

            <motion.button
              className="generate-button"
              onClick={() => onFileSelect(file!, config)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
              {t('fileUpload', 'analyze')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
