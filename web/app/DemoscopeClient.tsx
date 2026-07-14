'use client'

import dynamic from 'next/dynamic'

const DemoscopeApp = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <main className="space-bg grid min-h-dvh place-items-center">
      <div className="text-center">
        <div className="brand-mark mx-auto mb-5" aria-hidden />
        <p className="font-display text-4xl text-white">Demoscope</p>
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-cyan-200/70">
          Loading the PCA atlas…
        </p>
      </div>
    </main>
  ),
})

export function DemoscopeClient() {
  return <DemoscopeApp />
}
