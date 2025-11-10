export const HOTEL_ANALYTICS_QUERY = `
  query HotelAnalytics($fechaInicio: Date!, $fechaFin: Date!, $hotelIdErp: Int) {
    hotelAnalytics(fechaInicio: $fechaInicio, fechaFin: $fechaFin, hotelIdErp: $hotelIdErp) {
      hotelIdErp
      hotelNombre
      fechaInicio
      fechaFin
      totalReservas
      totalNochesVendidas
      totalNochesDisponibles
      ingresosTotalesHabitaciones
      tasaOcupacion
      adr
      revpar
      reservasPorCanal {
        canalNombre
        cantidadReservas
        ingresosTotales
        porcentaje
      }
      reservasPorEstado {
        estado
        cantidad
        porcentaje
      }
    }
  }
`

export const REPORTE_FINANCIERO_PRINCIPAL = `
  query ReporteFinancieroPrincipal($fechaInicio: Date!, $fechaFin: Date!, $hotelId: Int) {
    hotelAnalytics(fechaInicio: $fechaInicio, fechaFin: $fechaFin, hotelIdErp: $hotelId) {
      # Sección 1: KPIs para el Resumen Ejecutivo
      ingresosTotalesHabitaciones
      tasaOcupacion
      adr
      revpar
      totalNochesVendidas
      totalReservas

      # Sección 2: Datos para el Desglose de Ingresos por Canal
      reservasPorCanal {
        canalNombre
        cantidadReservas
        ingresosTotales
        porcentaje
      }
      
      # Sección 2 (Extra): Datos para la Tasa de Cancelación
      reservasPorEstado {
        estado
        cantidad
      }
    }
  }
`
