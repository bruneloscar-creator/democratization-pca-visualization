import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { ViewMode } from '../types'
import { useI18n } from '../i18n'

type Props = {
  view: ViewMode
  onChange: (v: ViewMode) => void
  compareCount: number
}

const icons: Record<ViewMode, ReactNode> = {
  world: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
    </svg>
  ),
  compare: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 19V5M10 19V9M16 19V3M22 19H2" />
    </svg>
  ),
  about: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7.5h.01" />
    </svg>
  ),
}

export function Dock({ view, onChange, compareCount }: Props) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const items: { id: ViewMode; label: string }[] = [
    { id: 'world', label: t('dock.world') },
    { id: 'compare', label: t('dock.compare') },
    { id: 'about', label: t('dock.about') },
  ]

  return (
    <motion.nav
      initial={reduceMotion ? false : { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.2 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
    >
      <div className="pointer-events-auto overflow-visible pt-2 sm:pt-3">
        <div className="glass flex items-stretch gap-0.5 rounded-[1.35rem] px-1.5 py-1.5 shadow-[0_22px_70px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.2)] sm:items-end sm:gap-1 sm:px-2 sm:py-2">
          {items.map((item) => {
            const active = view === item.id
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={reduceMotion ? undefined : { y: -6, scale: 1.06 }}
                whileTap={reduceMotion ? { opacity: 0.85 } : { scale: 0.95 }}
                onClick={() => onChange(item.id)}
                className={`relative flex min-h-12 min-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-[1rem] px-3 py-2 transition-colors sm:min-h-0 sm:min-w-0 sm:gap-1 sm:px-4 sm:py-2.5 ${
                  active ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId={reduceMotion ? undefined : 'dock-glow'}
                    className="absolute inset-0 rounded-[1rem] border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.18)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{icons[item.id]}</span>
                <span className="relative text-[10px] font-semibold tracking-wide">{item.label}</span>
                {item.id === 'compare' && compareCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border border-white/40 bg-cyan-200 px-1 text-[10px] font-bold text-slate-900 shadow-[0_0_18px_rgba(140,247,232,0.45)]">
                    {compareCount}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
