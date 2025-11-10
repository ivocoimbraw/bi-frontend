import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Calendar, XCircle, Settings, FileText } from "lucide-react"

export default function HomePage() {
  const dashboards = [
    {
      title: "Executive Dashboard",
      description: "High-level KPIs and revenue overview",
      href: "/dashboards/executive",
      icon: BarChart3,
    },
    {
      title: "Revenue Dashboard",
      description: "Booking pace, pickup analysis, and pricing",
      href: "/dashboards/revenue",
      icon: TrendingUp,
    },
    {
      title: "Forecast Dashboard",
      description: "Budget variance and forecast accuracy",
      href: "/dashboards/forecast",
      icon: Calendar,
    },
    {
      title: "Cancellations Dashboard",
      description: "Cancellation rates and patterns",
      href: "/dashboards/cancellations",
      icon: XCircle,
    },
    {
      title: "Operations Dashboard",
      description: "On-the-books and room status",
      href: "/dashboards/operations",
      icon: Settings,
    },
    {
      title: "Reports",
      description: "Generate and view financial and operational reports",
      href: "/reports",
      icon: FileText,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-foreground">Hotel Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive business intelligence for hotel management</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((dashboard) => {
            const Icon = dashboard.icon
            return (
              <Link key={dashboard.href} href={dashboard.href}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{dashboard.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
