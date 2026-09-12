import type { ReactNode } from 'react'
import { CloudSync } from '@/components/CloudSync'
import { AuthGate } from '@/components/AuthGate'

/** Full-screen surfaces (chat, work). No tab bar — the composer owns the
 *  bottom edge — but they still need the student's data pulled down. */
export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <CloudSync />
      {children}
    </AuthGate>
  )
}
