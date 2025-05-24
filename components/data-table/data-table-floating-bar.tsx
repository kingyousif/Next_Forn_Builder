"use client"

import { useState } from "react"
import type { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableFloatingBarProps<TData> {
  table: Table<TData>
}

export function DataTableFloatingBar<TData>({ table }: DataTableFloatingBarProps<TData>) {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  const handleDateRangeSelect = (field: string, range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)

    if (range.from) {
      const column = table.getColumn(field)
      if (range.to) {
        // If we have a complete range, filter for dates between from and to
        column?.setFilterValue([range.from.toISOString(), range.to.toISOString()])
      } else {
        // If we only have "from", filter for dates after "from"
        column?.setFilterValue(range.from.toISOString())
      }
    } else {
      // If range is cleared, remove the filter
      const column = table.getColumn(field)
      column?.setFilterValue(undefined)
    }
  }

  const resetDateRange = (field: string) => {
    setDateRange({ from: undefined, to: undefined })
    const column = table.getColumn(field)
    column?.setFilterValue(undefined)
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* ID Filter */}
        <div className="space-y-2">
          <Label htmlFor="id-filter">Task ID</Label>
          <Input
            id="id-filter"
            placeholder="Filter by ID..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("id")?.setFilterValue(event.target.value)}
            className="h-9"
          />
        </div>

        {/* Title Filter */}
        <div className="space-y-2">
          <Label htmlFor="title-filter">Title</Label>
          <Input
            id="title-filter"
            placeholder="Filter by title..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
            className="h-9"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Input
            id="status-filter"
            placeholder="Filter by status..."
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("status")?.setFilterValue(event.target.value)}
            className="h-9"
          />
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label htmlFor="priority-filter">Priority</Label>
          <Input
            id="priority-filter"
            placeholder="Filter by priority..."
            value={(table.getColumn("priority")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("priority")?.setFilterValue(event.target.value)}
            className="h-9"
          />
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter">Type</Label>
          <Input
            id="type-filter"
            placeholder="Filter by type..."
            value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("type")?.setFilterValue(event.target.value)}
            className="h-9"
          />
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Created At</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => handleDateRangeSelect("createdAt", range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {dateRange.from && (
              <Button variant="ghost" size="icon" onClick={() => resetDateRange("createdAt")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            table.resetColumnFilters()
            setDateRange({ from: undefined, to: undefined })
          }}
        >
          Reset all filters
        </Button>
      </div>
    </div>
  )
}

