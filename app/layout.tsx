import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./noise.css";
import "./grid-pattern.css";
import "./styles/main.css";
import "./styles/particles.css";
import "./styles/animations.css";
import "./styles/components/VoiceReader.css";
import "./styles/components/LanguageSelector.css";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "HERMES_AI | Assistant de Résumé Scientifique",
  description: "Transformez vos articles scientifiques en résumés structurés et accessibles grâce à l'intelligence artificielle de pointe.",
  keywords: "résumé scientifique, IA, recherche, PDF, analyse de texte, Freddy Heri, intelligence artificielle",
  authors: [{ name: "Freddy Heri" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${plusJakarta.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          {/* Effets de fond */}
          <div className="background-effects">
            <div className="particles-container">
              <div id="particles-js"></div>
            </div>
            {/* Orbes de gradient */}
            <div className="gradient-orb orb-1"></div>
            <div className="gradient-orb orb-2"></div>
            <div className="gradient-orb orb-3"></div>
            
            {/* Texture de bruit */}
            <div className="noise-overlay">
              <div className="noise"></div>
            </div>

            {/* Motif de grille */}
            <div className="grid-pattern"></div>
          </div>

          {/* Conteneur principal */}
          <div className="app-container">
            {/* Navigation */}
            <nav className="navbar">
              <div className="navbar-container">
                <a href="/" className="logo">
                  <div className="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="logo-text">HERMES_AI</span>
                </a>
              </div>
            </nav>

            {/* Contenu principal */}
            <main className="main-content">
              {children}
            </main>

            {/* Pied de page */}
            <footer className="footer">
              <div className="footer-container">
                <p className="footer-text">
                  © 2025 HERMES_AI • Propulsé par l'IA
                </p>
                <div className="social-links">
                  <a href="https://github.com/freddyheri" className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="sr-only">GitHub</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" 
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                        clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="https://linkedin.com/in/freddyheri" className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </footer>
          </div>

          {/* Scripts */}
          <Script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js" strategy="beforeInteractive" />
          <Script id="particles-config">
            {`
              if (typeof particlesJS !== 'undefined') {
                particlesJS('particles-js', {
                  particles: {
                    number: { value: 100, density: { enable: true, value_area: 800 } },
                    color: { value: ['#8b5cf6', '#6366f1', '#06b6d4'] },
                    shape: { type: 'circle', stroke: { width: 0 } },
                    opacity: { value: 0.6, random: true },
                    size: { value: 4, random: true },
                    line_linked: { enable: true, distance: 120, color: '#8b5cf6', opacity: 0.3, width: 1 },
                    move: { enable: true, speed: 3, direction: 'none', random: true }
                  },
                  interactivity: {
                    detect_on: 'canvas',
                    events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' } },
                    modes: { grab: { distance: 200 }, push: { particles_nb: 5 } }
                  },
                  retina_detect: true
                });
              }
            `}
          </Script>
        </LanguageProvider>
      </body>
    </html>
  );
}
