import type { ReactNode } from 'react'
import { CloudSync } from '@/components/CloudSync'

/** Full-screen surfaces (chat, work). No tab bar — the composer owns the
 *  bottom edge — but they still need the student's data pulled down. */
export default function FocusLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CloudSync />
      {children}
    </>
  )
}
