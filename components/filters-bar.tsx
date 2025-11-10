"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

export function FiltersBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [from, setFrom] = useState(searchParams.get("from") || "")
  const [to, setTo] = useState(searchParams.get("to") || "")
  const [hotelId, setHotelId] = useState(searchParams.get("hotelId") || "")

  useEffect(() => {
    // Set default dates if not present (last 30 days)
    if (!from || !to) {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      const defaultFrom = thirtyDaysAgo.toISOString().split("T")[0]
      const defaultTo = today.toISOString().split("T")[0]

      setFrom(defaultFrom)
      setTo(defaultTo)
    }
  }, [from, to])

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    if (hotelId) params.set("hotelId", hotelId)

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="from" className="text-sm font-medium">
          From Date
        </Label>
        <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1.5" />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="to" className="text-sm font-medium">
          To Date
        </Label>
        <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1.5" />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="hotelId" className="text-sm font-medium">
          Hotel ID
        </Label>
        <Input
          id="hotelId"
          type="number"
          placeholder="All hotels"
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          className="mt-1.5"
        />
      </div>

      <Button onClick={handleApplyFilters} className="gap-2">
        <Calendar className="h-4 w-4" />
        Apply Filters
      </Button>
    </div>
  )
}
