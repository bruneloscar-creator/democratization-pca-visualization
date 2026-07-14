export type CountryHoverState = {
  iso3: string
  x: number
  y: number
}

/** True when hover tooltips are meaningful (skip coarse touch pointers). */
export function supportsCountryHover(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}
