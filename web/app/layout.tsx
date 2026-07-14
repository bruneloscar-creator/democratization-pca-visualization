import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import '../src/index.css'

// oxlint-disable-next-line react/only-export-components -- Next.js metadata API
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers()
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const protocol = requestHeaders.get('x-forwarded-proto') ?? 'https'
  const origin = host ? `${protocol}://${host}` : 'https://demoscope-pca.chatgpt-sites.com'
  const title = 'Demoscope — Global democracy through PCA'
  const description =
    'Interactive PCA visualization of democratic trajectories across countries from 1980 to 2021.'

  return {
    title,
    description,
    authors: [{ name: 'Oscar Brunel' }],
    icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
    openGraph: {
      title,
      description,
      type: 'website',
      url: origin,
      images: [{ url: `${origin}/og.png`, width: 1736, height: 910, alt: 'Demoscope' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${origin}/og.png`],
    },
  }
}

// oxlint-disable-next-line react/only-export-components -- Next.js viewport API
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050711',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
