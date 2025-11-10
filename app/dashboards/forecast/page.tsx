import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ForecastDashboard } from "./forecast-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function ForecastPage() {
  return (
    <DashboardLayout title="Forecast Dashboard" description="Budget variance and forecast accuracy analysis">
      <Suspense fallback={<DashboardSkeleton />}>
        <ForecastDashboard />
      </Suspense>
    </DashboardLayout>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-80" />
        ))}
      </div>
    </div>
  )
}
