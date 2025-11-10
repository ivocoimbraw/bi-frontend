"use client"

import { useState, useEffect, useRef } from "react"
import { fetchGraphQL } from "@/lib/graphql-client"
import { REPORTE_FINANCIERO_PRINCIPAL } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/kpi-card"
import { ChartCard } from "@/components/chart-card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSearchParams } from 'next/navigation'

interface FinancialData {
  hotelAnalytics: {
    ingresosTotalesHabitaciones: number
    tasaOcupacion: number
    adr: number
    revpar: number
    totalNochesVendidas: number
    totalReservas: number
    reservasPorCanal: {
      canalNombre: string
      cantidadReservas: number
      ingresosTotales: number
      porcentaje: number
    }[]
    reservasPorEstado: {
      estado: string
      cantidad: number
    }[]
  }
}

export function FinancialReport() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const fechaInicio = searchParams.get('from')
      const fechaFin = searchParams.get('to')
      const hotelId = searchParams.get('hotelId')

      if (!fechaInicio || !fechaFin) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const variables = {
          fechaInicio,
          fechaFin,
          hotelId: hotelId ? parseInt(hotelId, 10) : undefined,
        }
        const result = await fetchGraphQL<FinancialData>(REPORTE_FINANCIERO_PRINCIPAL, variables)
        setData(result)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading data: {error.message}</div>
  }

  if (!data) {
    return <div>Please select a date range to view the report.</div>
  }

  const {
    ingresosTotalesHabitaciones,
    tasaOcupacion,
    adr,
    revpar,
    totalNochesVendidas,
    totalReservas,
    reservasPorCanal,
    reservasPorEstado,
  } = data.hotelAnalytics

  const cancelledReservations = reservasPorEstado.find(e => e.estado.toLowerCase() === 'cancelada')?.cantidad || 0
  const totalReservationsForCancellationRate = reservasPorEstado.reduce((acc, curr) => acc + curr.cantidad, 0)
  const cancellationRate = totalReservationsForCancellationRate > 0 ? (cancelledReservations / totalReservationsForCancellationRate) * 100 : 0

  return (
    <div ref={reportRef} className="space-y-6 bg-background p-4">
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary (Main KPIs)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KpiCard title="Total Revenue" value={`${ingresosTotalesHabitaciones}`} format="currency" data-testid="kpi-card-value" />
          <KpiCard title="Occupancy Rate" value={`${tasaOcupacion}`} format="percentage" />
          <KpiCard title="ADR" value={`${adr}`} format="currency" />
          <KpiCard title="RevPAR" value={`${revpar}`} format="currency" />
          <KpiCard title="Nights Sold" value={`${totalNochesVendidas}`} format="number" />
          <KpiCard title="Confirmed Reservations" value={`${totalReservas}`} format="number" />
        </CardContent>
      </Card>

      <ChartCard
        title="Revenue Breakdown by Channel"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reservasPorCanal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="canalNombre" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresosTotales" fill="#8884d8" name="Total Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Channel Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead># Reservations</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservasPorCanal.map((channel) => (
                <TableRow key={channel.canalNombre}>
                  <TableCell>{channel.canalNombre}</TableCell>
                  <TableCell>{channel.cantidadReservas}</TableCell>
                  <TableCell>${channel.ingresosTotales.toLocaleString()}</TableCell>
                  <TableCell>{channel.porcentaje.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>General Cancellation Rate</CardTitle>
        </CardHeader>
        <CardContent>
            <KpiCard title="Cancellation Rate" value={`${cancellationRate.toFixed(2)}%`} />
        </CardContent>
      </Card>
    </div>
  )
}
