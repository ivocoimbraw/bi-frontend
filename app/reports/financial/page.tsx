"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { FinancialReport } from "./financial-report"

export default function FinancialReportPage() {
  return (
    <DashboardLayout
      title="Financial Report"
      description="Detailed financial performance and channel analysis."
    >
      <FinancialReport />
    </DashboardLayout>
  )
}
