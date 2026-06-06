import { Bot, Cpu, GitBranch, Calculator, Layers, Map, Sun, Moon } from 'lucide-react'
import { BRAND_NAME, BRAND_TAGLINE, BRAND_SUBTITLE } from '../config/brand'
import { useTheme } from '../themes/ThemeContext'
import { ThemeId, themeLabels, themeColors } from '../themes'

export type Section = 'bot' | 'capabilities' | 'workflows' | 'pricing' | 'architecture' | 'roadmap'

const navItems: { id: Section; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bot', label: 'Experience the Bot', Icon: Bot },
  { id: 'capabilities', label: 'Capabilities', Icon: Cpu },
  { id: 'workflows', label: 'Workflows', Icon: GitBranch },
  { id: 'pricing', label: 'Pricing Calculator', Icon: Calculator },
  { id: 'architecture', label: 'Architecture', Icon: Layers },
  { id: 'roadmap', label: 'Roadmap', Icon: Map },
]

interface SidebarProps {
  activeSection: Section
  setActiveSection: (s: Section) => void
  open: boolean
}

export default function Sidebar({ activeSection, setActiveSection, open }: SidebarProps) {
  const { themeId, setThemeId, colorMode, toggleColorMode } = useTheme()

  return (
    <aside
      className={[
        'fixed top-0 left-0 z-30 h-full w-60 flex flex-col',
        'bg-sidebar border-r border-sidebar-border',
        'transition-transform duration-200 ease-in-out',
        'lg:relative lg:translate-x-0 lg:shrink-0',
        open ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground text-xs font-bold">{BRAND_NAME}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground leading-tight">{BRAND_TAGLINE}</p>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 font-mono">{BRAND_SUBTITLE}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, Icon }) => {
          const active = activeSection === id
          return (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={[
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t border-sidebar-border space-y-3">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
            Brand Theme
          </p>
          <div className="flex gap-1">
            {(Object.keys(themeLabels) as ThemeId[]).map((id) => (
              <button
                key={id}
                onClick={() => setThemeId(id)}
                title={themeLabels[id]}
                className={[
                  'flex-1 flex flex-col items-center gap-1 py-1.5 rounded-md border text-[10px] font-medium transition-all',
                  themeId === id
                    ? 'border-primary/50 bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
                ].join(' ')}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: themeColors[id] }} />
                {themeLabels[id]}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={toggleColorMode}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {colorMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  )
}
