import { motion } from 'framer-motion'
import type { Meta } from '../types'
import { useI18n } from '../i18n'

type Props = { meta: Meta }

export function AboutPage({ meta }: Props) {
  const { t, dict } = useI18n()
  const a = meta.author
  return (
    <div className="page-aurora panel-scroll h-full overflow-y-auto overflow-x-hidden px-4 pt-[max(3.5rem,calc(env(safe-area-inset-top)+2.5rem))] dock-safe-bottom sm:px-10 sm:pt-[max(2.5rem,calc(env(safe-area-inset-top)+1.5rem))]">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h1 className="font-display mt-5 max-w-3xl pr-16 text-4xl leading-[0.98] text-white sm:pr-0 sm:text-7xl">
            {t('about.heroTitle')}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:mt-6 sm:text-lg">
              {t('about.lead', {
                from: meta.analysisWindow[0],
                to: meta.analysisWindow[1],
              })}
            </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-3 gap-2.5 sm:mt-10 sm:gap-4">
          {[
            { value: meta.nCountries2014, label: t('about.metricCountries') },
            { value: meta.nVariables, label: t('about.metricVariables') },
            { value: `${(meta.explainedVariance.cumulative3 * 100).toFixed(0)}%`, label: t('about.metricVariance') },
          ].map((metric) => (
            <div key={metric.label} className="metric-card glass rounded-2xl px-3 py-4 sm:rounded-3xl sm:px-5 sm:py-5">
              <p className="font-display text-2xl leading-none text-white sm:text-4xl">{metric.value}</p>
              <p className="mt-2 text-[9px] font-semibold uppercase leading-snug tracking-[0.12em] text-slate-500 sm:text-[10px]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        <section className="glass mt-5 space-y-4 rounded-[1.75rem] p-5 sm:mt-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-xs font-semibold text-cyan-200">01</span>
            <h2 className="font-display text-2xl text-white sm:text-3xl">{t('about.projectTitle')}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            {t('about.projectP1', {
              refYear: meta.pcaReferenceYear,
              nCountries: meta.nCountries2014,
              nVariables: meta.nVariables,
            })}
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            {t('about.projectP2', {
              pc1: (meta.explainedVariance.PC1 * 100).toFixed(1),
              pc2: (meta.explainedVariance.PC2 * 100).toFixed(1),
              pc3: (meta.explainedVariance.PC3 * 100).toFixed(1),
              cum: (meta.explainedVariance.cumulative3 * 100).toFixed(1),
            })}
          </p>
          <p className="text-sm leading-relaxed text-slate-300">
            {t('about.projectP3', {
              refYear: meta.pcaReferenceYear,
              q33: meta.terciles2014.q33.toFixed(2),
              q66: meta.terciles2014.q66.toFixed(2),
            })}
          </p>
        </section>

        <section className="glass mt-5 space-y-4 rounded-[1.75rem] p-5 sm:mt-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-xs font-semibold text-cyan-200">02</span>
            <h2 className="font-display text-2xl text-white sm:text-3xl">{t('about.authorTitle')}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            <strong className="text-white">{a.name}</strong>
          </p>
          <p className="text-sm leading-relaxed text-slate-300">{t('about.authorBio')}</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={a.linkedin}
              target="_blank"
              rel="noreferrer"
              className="tap-target inline-flex items-center rounded-full border border-white/18 bg-white px-4 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:bg-cyan-50 sm:min-h-0 sm:py-2"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${a.email}`}
              className="tap-target inline-flex max-w-full items-center truncate rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white transition hover:bg-white/10 sm:min-h-0 sm:py-2"
            >
              {a.email}
            </a>
          </div>
        </section>

        <section className="glass mt-5 space-y-4 rounded-[1.75rem] p-5 sm:mt-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-xs font-semibold text-cyan-200">03</span>
            <h2 className="font-display text-2xl text-white sm:text-3xl">{t('about.limitsTitle')}</h2>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
            <li>{dict.interpretations.PC1}</li>
            <li>{dict.interpretations.PC2}</li>
            <li>{dict.interpretations.PC3}</li>
            <li>{t('about.limitProjection', { refYear: meta.pcaReferenceYear })}</li>
            <li>
              {t('about.limitWindow', {
                from: meta.analysisWindow[0],
                to: meta.analysisWindow[1],
              })}
            </li>
            <li>{t('about.limitLinear')}</li>
          </ul>
        </section>

        <section className="glass mt-5 space-y-4 rounded-[1.75rem] p-5 sm:mt-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/12 bg-white/[0.06] text-xs font-semibold text-cyan-200">04</span>
            <h2 className="font-display text-2xl text-white sm:text-3xl">{t('about.sourcesTitle')}</h2>
          </div>
          <ul className="space-y-3">
            {meta.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-words text-sm text-cyan-200/90 underline-offset-4 hover:underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="pt-2 text-xs leading-relaxed text-slate-500">{t('about.dataNote')}</p>
        </section>
      </div>
    </div>
  )
}
