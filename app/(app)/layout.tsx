import type { ReactNode } from 'react'
import { TabBar } from '@/components/ui/TabBar'
import { CloudSync } from '@/components/CloudSync'

/**
 * App shell: bottom tabs on phones, left rail from md up.
 * Chat lives in (focus) instead, where the composer owns the bottom edge.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-paper">
      <CloudSync />
      <TabBar />
      {/* Leave room for the bar/rail so nothing hides behind it */}
      <div className="pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0 md:pl-[76px] lg:pl-[210px]">
        {children}
      </div>
    </div>
  )
}
