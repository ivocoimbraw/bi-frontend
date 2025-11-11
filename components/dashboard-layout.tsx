import type { ReactNode } from "react"
import { Suspense } from "react"
import { FiltersBar } from "./filters-bar"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <FiltersBar />
        </Suspense>
        {children}
      </main>
    </div>
  )
}
