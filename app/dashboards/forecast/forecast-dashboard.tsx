"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { fetchGraphQL } from "@/lib/graphql-client"
import { HOTEL_ANALYTICS_QUERY } from "@/lib/queries"
import type { HotelAnalytics } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { TrendingUp, Target, Calendar, AlertCircle } from "lucide-react"

export function ForecastDashboard() {
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
    return <div className="text-center py-12">Loading forecast analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>
  }

  // Generate forecast data based on current performance
  const forecastData = generateForecastData(data)

  // Calculate projected metrics
  const projectedRevenue = data.ingresosTotalesHabitaciones * 1.15 // 15% growth projection
  const projectedOccupancy = Math.min(data.tasaOcupacion * 1.1, 100) // 10% growth, capped at 100%

  return (
    <div className="space-y-6">
      {/* Forecast KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Current Occupancy"
          value={data.tasaOcupacion}
          format="percentage"
          icon={Target}
          trend={{ value: 8.5, isPositive: true }}
        />
        <KpiCard title="Projected Occupancy" value={projectedOccupancy} format="percentage" icon={TrendingUp} />
        <KpiCard title="Current Revenue" value={data.ingresosTotalesHabitaciones} format="currency" icon={Calendar} />
        <KpiCard title="Projected Revenue" value={projectedRevenue} format="currency" icon={AlertCircle} />
      </div>

      {/* Forecast Charts */}
      <ChartCard title="Revenue Forecast" description="Projected revenue based on current trends">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value)
              }
            />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual" strokeWidth={2} />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#10b981"
              name="Forecast"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Occupancy Forecast" description="Projected occupancy rates">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              <Line type="monotone" dataKey="occupancy" stroke="#8b5cf6" name="Occupancy %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Booking Pace" description="Projected booking velocity">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#f59e0b" name="Bookings" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function generateForecastData(data: HotelAnalytics) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const baseRevenue = data.ingresosTotalesHabitaciones / 6
  const baseOccupancy = data.tasaOcupacion
  const baseBookings = data.totalReservas / 6

  return months.map((month, index) => ({
    month,
    actual: index < 3 ? baseRevenue * (1 + index * 0.1) : null,
    forecast: index >= 2 ? baseRevenue * (1 + index * 0.15) : null,
    occupancy: baseOccupancy * (1 + index * 0.05),
    bookings: Math.round(baseBookings * (1 + index * 0.08)),
  }))
}

function getDefaultFrom() {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split("T")[0]
}

function getDefaultTo() {
  return new Date().toISOString().split("T")[0]
}
