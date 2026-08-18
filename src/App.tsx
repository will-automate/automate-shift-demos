import { useState } from 'react'
import GrowthOpsSimulator from './components/GrowthOpsSimulator'
import DayInTheLife from './components/DayInTheLife'

type Tab = 'simulator' | 'dayinlife'

export default function App() {
  const [tab, setTab] = useState<Tab>('simulator')

  return (
    <div className="min-h-screen" style={{ background: '#F5F1E8' }}>
      {/* Header */}
      <header className="border-b border-[#8B8578]/20 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex gap-0">
            <button
              onClick={() => setTab('simulator')}
              className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
              style={{
                borderColor: tab === 'simulator' ? '#C46A2E' : 'transparent',
                color: tab === 'simulator' ? '#1F2A33' : '#8B8578',
              }}
            >
              Growth Ops Simulator
            </button>
            <button
              onClick={() => setTab('dayinlife')}
              className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
              style={{
                borderColor: tab === 'dayinlife' ? '#C46A2E' : 'transparent',
                color: tab === 'dayinlife' ? '#1F2A33' : '#8B8578',
              }}
            >
              A Day in the Life
            </button>
          </div>
          {/* Attribution link — improves SEO/AEO between partner sites */}
          <a
            href="https://automateshift.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-[#8B8578] hover:text-[#C46A2E] transition-colors tracking-wide"
          >
            Built by Automate Shift ↗
          </a>
        </div>
      </header>

      {/* Panels */}
      {tab === 'simulator' && (
        <div className="pb-16 pt-2">
          <GrowthOpsSimulator />
        </div>
      )}

      {tab === 'dayinlife' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
          <h2
            className="text-4xl md:text-5xl font-black text-[#1F2A33] leading-[1.05] tracking-tight mb-4"
            style={{ fontFamily: "'Schibsted Grotesk', sans-serif" }}
          >
            A Day in the Life,<br />
            <span style={{ color: '#C46A2E' }}>With and Without</span><br />
            Automate Shift
          </h2>
          <p className="text-[#6B6B60] text-lg leading-relaxed max-w-xl mb-10">
            Scroll through an ordinary day. Watch what changes when nothing falls through the cracks.
          </p>
          <div className="flex items-center gap-4 mb-0">
            <span className="h-px flex-1 bg-[#8B8578]/25" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#8B8578]">The day begins</span>
            <span className="h-px flex-1 bg-[#8B8578]/25" />
          </div>
          <DayInTheLife pricingBase="https://automateshift.com" />
        </div>
      )}

      {/* Footer attribution */}
      <footer className="border-t border-[#8B8578]/15 py-6 text-center">
        <p className="text-[#8B8578] text-xs font-mono">
          Simulations built by{' '}
          <a
            href="https://automateshift.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C46A2E] hover:underline"
          >
            Automate Shift
          </a>
          {' '}· AI automation for small &amp; mid-sized businesses
        </p>
      </footer>
    </div>
  )
}
