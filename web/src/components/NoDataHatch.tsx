import { HATCH_BASE_HEX, HATCH_PATTERN_ID, HATCH_STRIPE_HEX } from '../lib/colors'

/** Shared SVG hatch pattern for missing / insufficient PC1 data (define once per SVG). */
export function NoDataHatchDefs({ id = HATCH_PATTERN_ID }: { id?: string }) {
  return (
    <pattern
      id={id}
      patternUnits="userSpaceOnUse"
      width="8"
      height="8"
      patternTransform="rotate(45)"
    >
      <rect width="8" height="8" fill={HATCH_BASE_HEX} />
      <line x1="0" y1="0" x2="0" y2="8" stroke={HATCH_STRIPE_HEX} strokeWidth="3.2" />
    </pattern>
  )
}

/** CSS hatch swatch for legends (avoids duplicate SVG pattern ids). */
export function HatchSwatch({ className = 'h-3 w-5' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-sm border border-white/20 ${className}`}
      style={{
        backgroundColor: HATCH_BASE_HEX,
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          ${HATCH_STRIPE_HEX} 0 2px,
          transparent 2px 6px
        )`,
      }}
    />
  )
}
