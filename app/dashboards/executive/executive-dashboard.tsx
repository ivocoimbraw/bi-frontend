"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { fetchGraphQL } from "@/lib/graphql-client"
import { HOTEL_ANALYTICS_QUERY } from "@/lib/queries"
import type { HotelAnalytics } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Hotel, DollarSign, TrendingUp, Calendar } from "lucide-react"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#f65cb6ff"]

export function ExecutiveDashboard() {
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
    return <div className="text-center py-12">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Occupancy Rate" value={data.tasaOcupacion} format="percentage" icon={Hotel} />
        <KpiCard title="ADR (Average Daily Rate)" value={data.adr} format="currency" icon={DollarSign} />
        <KpiCard title="RevPAR" value={data.revpar} format="currency" icon={TrendingUp} />
        <KpiCard title="Total Revenue" value={data.ingresosTotalesHabitaciones} format="currency" icon={Calendar} />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard title="Total Bookings" value={data.totalReservas} format="number" />
        <KpiCard title="Nights Sold" value={data.totalNochesVendidas} format="number" />
        <KpiCard title="Available Nights" value={data.totalNochesDisponibles} format="number" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Revenue by Channel" description="Distribution of revenue across booking channels">
          <ResponsiveContainer width="100%" height={300}>
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
              <Bar dataKey="ingresosTotales" fill="#41577aff" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bookings by Channel" description="Distribution of bookings across channels">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.reservasPorCanal}
                dataKey="cantidadReservas"
                nameKey="canalNombre"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.canalNombre}: ${entry.porcentaje}%`}
              >
                {data.reservasPorCanal.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Booking Status */}
      <ChartCard title="Bookings by Status" description="Current status distribution of all bookings">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.reservasPorEstado} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="estado" type="category" />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#10b981" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
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
