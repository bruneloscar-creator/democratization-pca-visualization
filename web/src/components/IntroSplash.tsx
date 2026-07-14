import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useI18n } from '../i18n'

const AUTO_MS = 15_000
const STORAGE_KEY = 'demoscope.introSeen'

type Props = {
  ready: boolean
}

export function IntroSplash({ ready }: Props) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(15)

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      /* ignore */
    }
    setOpen(true)
    setSecondsLeft(15)
  }, [ready])

  useEffect(() => {
    if (!open) return
    const started = Date.now()
    const tick = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((AUTO_MS - (Date.now() - started)) / 1000))
      setSecondsLeft(left)
      if (left <= 0) {
        window.clearInterval(tick)
        dismiss()
      }
    }, 250)
    return () => window.clearInterval(tick)
  }, [open, dismiss])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-5 sm:p-8"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="intro-title"
          aria-describedby="intro-body"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#03050c]/70 backdrop-blur-xl"
            aria-label={t('intro.cta')}
            onClick={dismiss}
          />

          <motion.div
            className="intro-glass relative z-10 w-full max-w-[34rem] overflow-hidden px-6 py-8 text-center sm:px-10 sm:py-10"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />

            <div className="brand-mark mx-auto h-12 w-12 rounded-2xl" aria-hidden />
            <p className="eyebrow relative mt-6">
              {t('intro.eyebrow')}
            </p>
            <h1
              id="intro-title"
              className="font-display relative mt-3 text-[2.75rem] leading-none text-white sm:text-6xl"
            >
              Demoscope
            </h1>
            <p
              id="intro-body"
              className="relative mx-auto mt-5 max-w-md text-sm leading-relaxed text-slate-300 sm:text-[15px]"
            >
              {t('intro.body')}
            </p>

            <button
              type="button"
              onClick={dismiss}
              className="tap-target relative mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_12px_38px_rgba(0,0,0,0.28),0_0_30px_rgba(140,247,232,0.14)] transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-[0_16px_48px_rgba(0,0,0,0.34),0_0_38px_rgba(140,247,232,0.22)] active:translate-y-0 active:scale-[0.98]"
            >
              {t('intro.cta')}
              <span aria-hidden className="text-base">↗</span>
            </button>

            <p className="relative mt-5 text-[10px] uppercase tracking-[0.14em] text-slate-500">
              {t('intro.auto', { seconds: String(secondsLeft) })}
            </p>
            <div className="intro-progress relative mx-auto mt-3 w-32" aria-hidden>
              <span style={{ width: `${(secondsLeft / 15) * 100}%` }} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
