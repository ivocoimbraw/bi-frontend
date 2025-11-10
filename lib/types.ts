export interface HotelAnalytics {
  hotelIdErp: number | null
  hotelNombre: string | null
  fechaInicio: string
  fechaFin: string
  totalReservas: number
  totalNochesVendidas: number
  totalNochesDisponibles: number
  ingresosTotalesHabitaciones: number
  tasaOcupacion: number
  adr: number
  revpar: number
  reservasPorCanal: ReservasPorCanal[]
  reservasPorEstado: ReservasPorEstado[]
}

export interface ReservasPorCanal {
  canalNombre: string
  cantidadReservas: number
  ingresosTotales: number
  porcentaje: number
}

export interface ReservasPorEstado {
  estado: string
  cantidad: number
  porcentaje: number
}

export interface FilterParams {
  from: string
  to: string
  hotelId?: string
}
