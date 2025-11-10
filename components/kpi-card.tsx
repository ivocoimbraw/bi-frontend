import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  format?: "currency" | "percentage" | "number"
  className?: string
}

export function KpiCard({ title, value, icon: Icon, trend, format = "number", className }: KpiCardProps) {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === "string" ? Number.parseFloat(val) : val

    if (format === "currency") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }).format(numVal)
    }

    if (format === "percentage") {
      return `${numVal.toFixed(2)}%`
    }

    return new Intl.NumberFormat("en-US").format(numVal)
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {trend && (
          <p className={cn("text-xs mt-1", trend.isPositive ? "text-green-600" : "text-red-600")}>
            {trend.isPositive ? "+" : ""}
            {trend.value}% vs last year
          </p>
        )}
      </CardContent>
    </Card>
  )
}
