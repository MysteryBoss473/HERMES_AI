// components/SummaryResult.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { jsPDF } from 'jspdf'
import VoiceReader from './VoiceReader'
import '@/app/styles/components/SummaryResult.css'
import '@/app/styles/animations.css'
import '@/app/styles/components/VoiceReader.css'
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SummaryResultProps {
  summary: string
}

export default function SummaryResult({ summary }: SummaryResultProps) {
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const { t } = useLanguage();

  // Handlers for copy, PDF generation, and sharing
  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const generatePDF = async () => {
    setGenerating(true)
    try {
      const doc = new jsPDF()
      
      // Configuration des marges et dimensions
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (2 * margin)
      
      // Style de l'en-tête
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.setTextColor(99, 102, 241)
      
      // Logo et titre
      const title = 'Résumé Scientifique'
      const titleWidth = doc.getTextWidth(title)
      doc.text(title, (pageWidth - titleWidth) / 2, margin + 10)
      
      // Date et informations
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(51, 51, 51)
      const date = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`Généré le ${date}`, margin, margin + 25)
      
      // Ligne de séparation
      doc.setDrawColor(99, 102, 241)
      doc.setLineWidth(0.5)
      doc.line(margin, margin + 30, pageWidth - margin, margin + 30)
      
      // Préparation du contenu
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(68, 68, 68)
      
      // Fonction pour ajouter une nouvelle page
      const addNewPage = () => {
        doc.addPage()
        currentY = margin
        
        // En-tête de la nouvelle page
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(10)
        doc.setTextColor(128, 128, 128)
        doc.text('Suite du résumé...', margin, currentY)
        currentY += 15
        
        // Retour aux styles du contenu
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(68, 68, 68)
      }
      
      // Traitement du contenu par paragraphes
      let currentY = margin + 40
      const lineHeight = 7
      const paragraphs = summary.split('\n\n')
      
      paragraphs.forEach((paragraph, index) => {
        // Calcul de la hauteur du paragraphe
        const lines = doc.splitTextToSize(paragraph, contentWidth)
        const paragraphHeight = lines.length * lineHeight
        
        // Vérification si on a besoin d'une nouvelle page
        if (currentY + paragraphHeight > pageHeight - margin) {
          addNewPage()
        }
        
        // Ajout du paragraphe
        doc.text(lines, margin, currentY)
        currentY += paragraphHeight + 10 // Espacement entre les paragraphes
      })
      
      // Ajout du pied de page sur chaque page
      const pageCount = (doc.internal as any).getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        
        // Ligne de séparation du footer
        doc.setDrawColor(99, 102, 241, 0.5)
        doc.setLineWidth(0.3)
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)
        
        // Texte du footer
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(128, 128, 128)
        
        // Numéro de page
        const pageText = `Page ${i} sur ${pageCount}`
        const pageTextWidth = doc.getTextWidth(pageText)
        doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10)
        
        // Copyright
        doc.text('© HERMES_AI', margin, pageHeight - 10)
      }
      
      // Sauvegarde avec un nom de fichier formaté
      const fileName = `resume-scientifique-${new Date().toISOString().slice(0, 10)}.pdf`
      doc.save(fileName)
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handleShare = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`)
        break
      case 'email':
        const subject = encodeURIComponent('Résumé Scientifique - HERMES_AI')
        const body = encodeURIComponent(`${summary}\n\nGénéré avec HERMES_AI`)
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${subject}&body=${body}`
        window.open(gmailUrl, '_blank')
        
        // Backup: copier dans le presse-papiers si l'ouverture échoue
        navigator.clipboard.writeText(`Sujet: Résumé Scientifique - HERMES_AI\n\n${summary}\n\nGénéré avec HERMES_AI`)
          .then(() => console.log('Contenu copié dans le presse-papiers'))
          .catch(err => console.error('Erreur lors de la copie:', err))
        break
      case 'copy':
        navigator.clipboard.writeText(window.location.href)
        break
    }
    setShowShareOptions(false)
  }

  // Fonction pour séparer le résumé en sections
  const getSections = (text: string) => {
    if (!text) return []
    
    const sections: { title: string; content: string }[] = []
    const lines = text.split('\n')
    let currentTitle = ''
    let currentContent: string[] = []

    for (const line of lines) {
      if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
        if (currentTitle && currentContent.length > 0) {
          sections.push({
            title: currentTitle,
            content: currentContent.join('\n')
          })
        }
        currentTitle = line.trim().replace(/\*\*/g, '')
        currentContent = []
      } else if (line.trim()) {
        currentContent.push(line.trim())
      }
    }

    if (currentTitle && currentContent.length > 0) {
      sections.push({
        title: currentTitle,
        content: currentContent.join('\n')
      })
    }

    // Si aucune section n'a été trouvée, créer une section par défaut
    if (sections.length === 0 && text.trim()) {
      sections.push({
        title: t('others', 'res3'),
        content: text.trim()
      })
    }

    return sections
  }

  const sections = getSections(summary)

  return (
    <div className="summary-container">
      <div className="summary-header">
        <div className="header-content">
          <div className="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="header-text">
            <h2 className="text-gradient">{t('others', 'res1')}</h2>
            <p>{t('others', 'res2')}</p>
          </div>
          <div className="header-status">
          </div>
        </div>
        
        <div className="header-actions">
          <VoiceReader text={summary} />
          
          <button
            onClick={handleCopy}
            className="action-button"
            title={t('others', 'copy')}
          >
            {copied ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>

          <button
            onClick={generatePDF}
            className="action-button"
            disabled={generating}
            title={t('others', 'download')}
          >
            {generating ? (
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="action-button"
              title={t('others', 'share')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>

            {showShareOptions && (
              <div className="share-options">
                <button onClick={() => handleShare('whatsapp')} className="share-option">
                  WhatsApp
                </button>
                <button onClick={() => handleShare('email')} className="share-option">
                  Email
                </button>
                <button onClick={() => handleShare('copy')} className="share-option">
                  {t('others', 'copylink')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="summary-sections">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            className="summary-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="section-icon">
              {index === 0 && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {index === 1 && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
              {index === 2 && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <h3 className="section-title">{section.title}</h3>
            <div className="section-content">{section.content}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
  