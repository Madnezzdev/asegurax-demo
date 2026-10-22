import { MotionConfig } from 'framer-motion'
import { ContactSection } from './components/ContactSection'
import { CoverageSection } from './components/CoverageSection'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { ToastProvider } from './components/Toast'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <Navbar />
        <main>
          <Hero />
          <CoverageSection />
          <ContactSection />
        </main>
        <Footer />
      </ToastProvider>
    </MotionConfig>
  )
}
