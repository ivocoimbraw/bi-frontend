import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OperationsDashboard } from "./operations-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function OperationsPage() {
  return (
    <DashboardLayout title="Operations Dashboard" description="On-the-books analysis and room status">
      <Suspense fallback={<DashboardSkeleton />}>
        <OperationsDashboard />
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
