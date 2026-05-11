// app/page.tsx
// Página principal de la landing de TRIBU

import type { Metadata } from 'next';
import Navbar from '../app/components/landing/Navbar';
import Hero from '../app/components/landing/Hero';
import ProblemSection from '../app/components/landing/ProblemSection';
import HowItWorks from '../app/components/landing/HowItWorks';
import FeaturesGrid from '../app/components/landing/FeaturesGrid';
import ForWhom from '../app/components/landing/ForWhom';
import Pricing from '../app/components/landing/Pricing';
import FinalCTA from '../app/components/landing/FinalCTA';
import Footer from '../app/components/landing/Footer';

export const metadata: Metadata = {
  title: 'TRIBU — Gestión de Voluntariado para ONGs | República Dominicana',
  description: 'Plataforma SaaS que transforma cómo las ONGs gestionan su talento voluntario. QR dinámico, certificados IA, reportes ESG. Gratis para empezar.',
  keywords: 'voluntariado, ONG, gestión, República Dominicana, impacto social, ESG, certificados',
  metadataBase: new URL('https://tribu.do'), // URL base para los metadatos
  openGraph: {
    title: 'TRIBU — Conecta con propósito',
    description: 'Gestión de talento voluntario con herramientas de nivel corporativo.',
    type: 'website',
  }
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesGrid />
      <ForWhom />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}