// app/page.tsx
'use client'

import { useState } from 'react'
import FileUpload, { AnalysisConfig } from '@/components/FileUpload'
import SummaryResult from '@/components/SummaryResult'
import Loader from '@/components/Loader'
import { extractTextFromPDF } from '@/lib/pdfUtils'
import { getScientificSummary } from '@/lib/gemini'
import { motion } from 'framer-motion'
import '@/app/styles/pages/home.css'
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { languageOptions } from '@/components/FileUpload'

export default function Home() {
  const [currentConfig, setCurrentConfig] = useState<AnalysisConfig | null>(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('')
  const { t } = useLanguage();


  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  const handleFileSelect = async (file: File, config: AnalysisConfig) => {
    setLoading(true)
    setSummary('')

    try {
      
      setCurrentConfig(config)

      // Extraction du texte du PDF
      const text = await extractTextFromPDF(file)

      // Préparation du prompt en fonction de la configuration
      let prompt1 = `\n\n##CONSIGNES PRIORITAIRES : `
      let prompt2 = ``

      // Ajout de la langue
      const languageLabel = languageOptions.find(l => l.code === config.language)?.label || config.language
      prompt1 += `\n\n-Le résumé doit ABSOLUMENT être en ${languageLabel}, `


      // Ajout du niveau de langage
      switch (config.languageLevel) {
        case 'simple':
          prompt1 += '\n-Niveau de langage : Simple et accessible, '
          break
        case 'technique':
          prompt1 += '\n-Niveau de langage : Techniques et Scientifique, '
          break
        case 'standard':
        default:
          prompt1 += '\n-Niveau de langage : Standard, '
          break
      }

      // Ajout de la longueur souhaitée
      switch (config.summaryLength) {
        case 'court':
          prompt1 += '\n-Longueur : Concis et bref. '
          break
        case 'detaille':
          prompt1 += '\n-Longueur : Détaillé et long. '
          break
        case 'moyen':
        default:
          prompt1 += '\n-Longueur : Modérée. '
          break
      }

      // Ajout de la limite de mots si spécifiée
      if (config.maxWords) {
        prompt1 += `\n-Le résumé ne doit ABSOLUMENT pas dépasser ${config.maxWords} mots.`
      }

      // Ajout du texte à résumer
      prompt2 += `\n\nTexte à résumer:\n${text}`

      // Génération du résumé avec les paramètres configurés
      let generatedSummary = await getScientificSummary(prompt2, prompt1)

      setSummary(generatedSummary)
    } catch (error) {
      console.error('Erreur lors du traitement:', error)
      setSummary('Une erreur est survenue lors du traitement du document.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="hero-section"
      >
        <motion.div variants={itemVariants} className="hero-title-container">
          <div className="hero-title-glow"></div>
          <h1 className="hero-title">
            <span className="hero-title-gradient">HERMES_AI</span>
            <span className="block text-3xl md:text-4xl mt-4 font-medium text-neutral-800 dark:text-neutral-200">
              {t('header', 'title')}
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="hero-description"
        >
          {t('header', 'desc')}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className={`api-status ${
            apiKeyStatus.includes('✅') 
              ? 'api-status-success' 
              : 'api-status-error'
          }`}
        >
          {apiKeyStatus}
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="main-section"
      >
        {/* Upload Card */}
        <motion.div variants={itemVariants}>
          <FileUpload onFileSelect={handleFileSelect} />
        </motion.div>

        {/* Loader */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="loader-section"
          >
            <Loader />
          </motion.div>
        )}

        {/* Results */}
        {summary && currentConfig && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="results-section"
          >
            <SummaryResult summary={summary} config={currentConfig} />
          </motion.div>
        )}
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="features-section"
      >
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
            title: t('icon1', 'title'),
            description: t('icon1', 'desc')
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            title: t('icon2', 'title'),
            description: t('icon2', 'desc')
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ),
            title: t('icon3', 'title'),
            description: t('icon3', 'desc')
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="feature-card"
          >
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
