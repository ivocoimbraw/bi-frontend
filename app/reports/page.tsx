import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function ReportsPage() {
  const reports = [
    {
      title: "Financial Report",
      description: "View detailed financial performance and channel analysis.",
      href: "/reports/financial",
      icon: FileText,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and view financial and operational reports.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <Link key={report.href} href={report.href}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{report.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">{report.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
