"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { fetchGraphQL } from "@/lib/graphql-client"
import { HOTEL_ANALYTICS_QUERY } from "@/lib/queries"
import type { HotelAnalytics } from "@/lib/types"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { DollarSign, TrendingUp, Percent, CreditCard } from "lucide-react"

export function RevenueDashboard() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<HotelAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        const from = searchParams.get("from") || getDefaultFrom()
        const to = searchParams.get("to") || getDefaultTo()
        const hotelId = searchParams.get("hotelId")

        const variables: any = {
          fechaInicio: from,
          fechaFin: to,
        }

        if (hotelId) {
          variables.hotelIdErp = Number.parseInt(hotelId)
        }

        const result = await fetchGraphQL<{ hotelAnalytics: HotelAnalytics }>(HOTEL_ANALYTICS_QUERY, variables)

        setData(result.hotelAnalytics)
      } catch (error) {
        console.error("[v0] Failed to load analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [searchParams])

  if (loading) {
    return <div className="text-center py-12">Loading revenue analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>
  }

  // Calculate average revenue per booking
  const avgRevenuePerBooking = data.totalReservas > 0 ? data.ingresosTotalesHabitaciones / data.totalReservas : 0

  return (
    <div className="space-y-6">
      {/* Revenue KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Revenue" value={data.ingresosTotalesHabitaciones} format="currency" icon={DollarSign} />
        <KpiCard title="ADR" value={data.adr} format="currency" icon={TrendingUp} />
        <KpiCard title="RevPAR" value={data.revpar} format="currency" icon={Percent} />
        <KpiCard title="Avg Revenue/Booking" value={avgRevenuePerBooking} format="currency" icon={CreditCard} />
      </div>

      {/* Revenue by Channel */}
      <ChartCard title="Revenue by Channel" description="Total revenue generated from each booking channel">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.reservasPorCanal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="canalNombre" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value)
              }
            />
            <Bar dataKey="ingresosTotales" fill="#3b82f6" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Channel Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Bookings by Channel" description="Number of bookings from each channel">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.reservasPorCanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canalNombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidadReservas" fill="#10b981" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Channel Revenue Share" description="Percentage of total revenue by channel">
          <div className="space-y-4 pt-4">
            {data.reservasPorCanal.map((channel, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{channel.canalNombre}</span>
                  <span className="text-muted-foreground">{channel.porcentaje.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${channel.porcentaje}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

function getDefaultFrom() {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split("T")[0]
}

function getDefaultTo() {
  return new Date().toISOString().split("T")[0]
}
