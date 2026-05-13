import { BottomNav } from '@/components/shared/BottomNav'

export default function MotherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-md mx-auto min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
