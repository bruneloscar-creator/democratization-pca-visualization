'use client'

import App from '../src/App'
import { LanguageProvider } from '../src/i18n'

export function DemoscopeClient() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  )
}
