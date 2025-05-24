"use client"

import { X } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MultiSortInfoProps<TData> {
  table: Table<TData>
}

export function MultiSortInfo<TData>({ table }: MultiSortInfoProps<TData>) {
  const sortingState = table.getState().sorting

  if (!sortingState.length) {
    return null
  }

  return (
    <div className="bg-muted/30 p-3 rounded-md border mt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Multi-Column Sort</h3>
        <Button variant="ghost" size="sm" onClick={() => table.resetSorting()} className="h-7 px-2 text-xs">
          Reset all
          <X className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        <p>
          Hold <kbd className="px-1 py-0.5 bg-muted border rounded">Shift</kbd> while clicking column headers to sort by
          multiple columns
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sortingState.map((sort, index) => {
          const column = table.getColumn(sort.id)
          const columnName = column?.columnDef.header?.toString() || sort.id

          return (
            <Badge key={sort.id} variant="secondary" className="flex items-center gap-1 py-1">
              <span className="font-semibold text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center mr-1">
                {index + 1}
              </span>
              {columnName}
              {sort.desc ? " (desc)" : " (asc)"}
              <X
                className="h-3 w-3 cursor-pointer ml-1"
                onClick={(e) => {
                  e.stopPropagation()
                  const newSorting = [...sortingState]
                  newSorting.splice(index, 1)
                  table.setSorting(newSorting)
                }}
              />
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

