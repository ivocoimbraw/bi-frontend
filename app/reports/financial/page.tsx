"use client"

import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FinancialReport } from "./financial-report"
import { Skeleton } from "@/components/ui/skeleton"

export default function FinancialReportPage() {
  return (
    <DashboardLayout
      title="Financial Report"
      description="Detailed financial performance and channel analysis."
    >
      <Suspense fallback={<ReportSkeleton />}>
        <FinancialReport />
      </Suspense>
    </DashboardLayout>
  )
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
