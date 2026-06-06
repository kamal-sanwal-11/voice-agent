import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar, { Section } from './Sidebar'
import { ThemeProvider } from '../themes/ThemeContext'
import { BRAND_NAME, BRAND_TAGLINE } from '../config/brand'
import ExperienceBot from '../sections/ExperienceBot'
import StubSection from '../sections/stubs/StubSection'

document.title = `${BRAND_NAME} ${BRAND_TAGLINE}`

const sectionLabels: Record<Section, string> = {
  bot: 'Experience the Bot',
  capabilities: 'Capabilities',
  workflows: 'Workflows',
  pricing: 'Pricing Calculator',
  architecture: 'Architecture',
  roadmap: 'Roadmap',
}

function Main() {
  const [activeSection, setActiveSectionState] = useState<Section>('bot')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = (s: Section) => {
    setActiveSectionState(s)
    setSidebarOpen(false)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'bot': return <ExperienceBot />
      case 'capabilities': return <StubSection title="Capabilities" description="Overview of STT, LLM, TTS, and pipeline capabilities. Planned for a future phase." />
      case 'workflows': return <StubSection title="Workflows" description="Decision-tree and agentic workflow designer. Planned for a future phase." />
      case 'pricing': return <StubSection title="Pricing Calculator" description="Interactive cost estimator for voice agent deployments. Planned for a future phase." />
      case 'architecture': return <StubSection title="Architecture" description="System architecture diagram and component overview. Planned for a future phase." />
      case 'roadmap': return <StubSection title="Roadmap" description="Phase-by-phase delivery roadmap. Planned for a future phase." />
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar activeSection={activeSection} setActiveSection={navigate} open={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border lg:hidden shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-accent text-foreground transition-colors" aria-label="Open sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-foreground">{sectionLabels[activeSection]}</span>
        </div>
        <div className="flex-1 overflow-hidden">{renderSection()}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  )
}
