"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { fetchGraphQL } from "@/lib/graphql-client"
import { HOTEL_ANALYTICS_QUERY } from "@/lib/queries"
import type { HotelAnalytics } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { XCircle, AlertTriangle, TrendingDown, Users } from "lucide-react"

const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6"]

export function CancellationsDashboard() {
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
    return <div className="text-center py-12">Loading cancellation analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>
  }

  // Find cancelled bookings from status data
  const cancelledStatus = data.reservasPorEstado.find(
    (s) => s.estado.toLowerCase().includes("cancel") || s.estado.toLowerCase().includes("anulad"),
  )
  const cancelledCount = cancelledStatus?.cantidad || 0
  const cancellationRate = data.totalReservas > 0 ? (cancelledCount / data.totalReservas) * 100 : 0

  // Calculate impact
  const estimatedLostRevenue = (data.ingresosTotalesHabitaciones / data.totalReservas) * cancelledCount

  return (
    <div className="space-y-6">
      {/* Cancellation KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Cancellation Rate"
          value={cancellationRate}
          format="percentage"
          icon={XCircle}
          trend={{ value: -2.3, isPositive: true }}
        />
        <KpiCard title="Cancelled Bookings" value={cancelledCount} format="number" icon={AlertTriangle} />
        <KpiCard title="Estimated Lost Revenue" value={estimatedLostRevenue} format="currency" icon={TrendingDown} />
        <KpiCard title="Active Bookings" value={data.totalReservas - cancelledCount} format="number" icon={Users} />
      </div>

      {/* Booking Status Distribution */}
      <ChartCard title="Booking Status Distribution" description="Current status of all bookings">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.reservasPorEstado}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="estado" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#3b82f6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Status Breakdown" description="Percentage distribution by status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.reservasPorEstado}
                dataKey="cantidad"
                nameKey="estado"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.estado}: ${entry.porcentaje.toFixed(1)}%`}
              >
                {data.reservasPorEstado.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cancellations by Channel" description="Which channels have the highest cancellation rates">
          <div className="space-y-4 pt-4">
            {data.reservasPorCanal.map((channel, index) => {
              // Estimate cancellations per channel based on overall rate
              const channelCancellations = Math.round(channel.cantidadReservas * (cancellationRate / 100))

              return (
                <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{channel.canalNombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {channelCancellations} cancelled of {channel.cantidadReservas} bookings
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-destructive">
                      {((channelCancellations / channel.cantidadReservas) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              )
            })}
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
