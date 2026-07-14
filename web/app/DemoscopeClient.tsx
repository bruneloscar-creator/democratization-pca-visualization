'use client'

import dynamic from 'next/dynamic'

const DemoscopeApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <main className="space-bg grid min-h-dvh place-items-center" aria-label="Demoscope">
      <p className="font-display text-4xl text-white">Demoscope</p>
    </main>
  ),
})

export function DemoscopeClient() {
  return <DemoscopeApp />
}
