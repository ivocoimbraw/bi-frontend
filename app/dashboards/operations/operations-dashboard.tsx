"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { fetchGraphQL } from "@/lib/graphql-client"
import { HOTEL_ANALYTICS_QUERY } from "@/lib/queries"
import type { HotelAnalytics } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Bed, Calendar, Users, Clock } from "lucide-react"

export function OperationsDashboard() {
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
    return <div className="text-center py-12">Loading operations analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-12">No data available</div>
  }

  // Calculate operational metrics
  const avgNightsPerBooking = data.totalReservas > 0 ? data.totalNochesVendidas / data.totalReservas : 0
  const roomsOccupied = Math.round(data.totalNochesVendidas / 30) // Approximate daily occupied rooms

  return (
    <div className="space-y-6">
      {/* Operations KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Bookings" value={data.totalReservas} format="number" icon={Users} />
        <KpiCard title="Nights Sold" value={data.totalNochesVendidas} format="number" icon={Bed} />
        <KpiCard title="Avg Nights/Booking" value={avgNightsPerBooking.toFixed(1)} format="number" icon={Calendar} />
        <KpiCard title="Occupancy Rate" value={data.tasaOcupacion} format="percentage" icon={Clock} />
      </div>

      {/* Capacity Analysis */}
      <ChartCard title="Capacity Utilization" description="Nights sold vs available capacity">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={[
              {
                name: "Capacity",
                sold: data.totalNochesVendidas,
                available: data.totalNochesDisponibles - data.totalNochesVendidas,
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sold" stackId="a" fill="#10b981" name="Nights Sold" />
            <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available Nights" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Bookings by Channel" description="Operational load by booking source">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.reservasPorCanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canalNombre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidadReservas" fill="#3b82f6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Booking Status Overview" description="Current operational status">
          <div className="space-y-4 pt-4">
            {data.reservasPorEstado.map((status, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{status.estado}</p>
                  <p className="text-sm text-muted-foreground">{status.cantidad} bookings</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{status.porcentaje.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Channel Performance Table */}
      <ChartCard title="Channel Performance Summary" description="Detailed breakdown by booking channel">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium">Channel</th>
                <th className="text-right py-3 px-4 font-medium">Bookings</th>
                <th className="text-right py-3 px-4 font-medium">Revenue</th>
                <th className="text-right py-3 px-4 font-medium">Share</th>
                <th className="text-right py-3 px-4 font-medium">Avg Value</th>
              </tr>
            </thead>
            <tbody>
              {data.reservasPorCanal.map((channel, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-3 px-4 font-medium">{channel.canalNombre}</td>
                  <td className="text-right py-3 px-4">{channel.cantidadReservas.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(channel.ingresosTotales)}
                  </td>
                  <td className="text-right py-3 px-4">{channel.porcentaje.toFixed(1)}%</td>
                  <td className="text-right py-3 px-4">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(channel.ingresosTotales / channel.cantidadReservas)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
