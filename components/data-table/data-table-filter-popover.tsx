"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataTableAdvancedFilters } from "./data-table-advanced-filters"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { DragDropContext } from "@hello-pangea/dnd"

interface DataTableFilterPopoverProps {
  advancedFilters: any[]
  setAdvancedFilters: (filters: any[]) => void
}

export function DataTableFilterPopover({ advancedFilters, setAdvancedFilters }: DataTableFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const hasFilters = advancedFilters.length > 0

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(advancedFilters)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setAdvancedFilters(items)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={hasFilters ? "default" : "outline"} size="sm" className="h-8 gap-1">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasFilters && (
            <Badge variant="secondary" className="ml-1 bg-background text-foreground">
              {advancedFilters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-max p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h3 className="font-medium">Advanced Filters</h3>
            {hasFilters && <Badge variant="secondary">{advancedFilters.length}</Badge>}
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={() => setAdvancedFilters([])}
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-4 max-h-[500px] overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <DataTableAdvancedFilters
              advancedFilters={advancedFilters}
              setAdvancedFilters={setAdvancedFilters}
              inPopover={true}
              enableDragDrop={true}
            />
          </DragDropContext>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button variant="default" size="sm" onClick={() => setOpen(false)} disabled={!hasFilters}>
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

