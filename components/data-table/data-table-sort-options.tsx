"use client"

import { useState } from "react"
import type { Table, SortingState, ColumnSort } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface DataTableSortOptionsProps {
  table: Table<any>
  sorting: SortingState
  setSorting: (sorting: SortingState) => void
}

export function DataTableSortOptions({ table, sorting, setSorting }: DataTableSortOptionsProps) {
  const [availableColumns, setAvailableColumns] = useState<string[]>(() => {
    // Get all sortable columns
    return table
      .getAllColumns()
      .filter((column) => column.getCanSort())
      .map((column) => column.id)
  })

  const addSort = () => {
    // Find first available column that's not already being sorted
    const usedColumnIds = new Set(sorting.map((sort) => sort.id))
    const availableColumnId = availableColumns.find((id) => !usedColumnIds.has(id))

    if (availableColumnId) {
      const newSort: ColumnSort = {
        id: availableColumnId,
        desc: false,
      }
      setSorting([...sorting, newSort])
    }
  }

  const updateSort = (index: number, columnId: string | null, desc: boolean | null) => {
    const newSorting = [...sorting]

    if (columnId !== null) {
      newSorting[index] = {
        ...newSorting[index],
        id: columnId,
      }
    }

    if (desc !== null) {
      newSorting[index] = {
        ...newSorting[index],
        desc,
      }
    }

    setSorting(newSorting)
  }

  const removeSort = (index: number) => {
    const newSorting = [...sorting]
    newSorting.splice(index, 1)
    setSorting(newSorting)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sorting)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSorting(items)
  }

  const getColumnLabel = (columnId: string) => {
    const column = table.getColumn(columnId)
    return column?.columnDef.header?.toString() || columnId
  }

  const getUnusedColumns = () => {
    const usedColumnIds = new Set(sorting.map((sort) => sort.id))
    return availableColumns.filter((id) => !usedColumnIds.has(id))
  }

  return (
    <div className="space-y-4">
      {sorting.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>No sorting applied. Add a sort to organize your data.</p>
        </div>
      ) : (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Sort Priority</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Drag to reorder the sort priority. The table will be sorted by the first column, then by the second, and so
            on.
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sort-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {sorting.map((sort, index) => (
                    <Draggable key={sort.id + index} draggableId={sort.id + index} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center gap-2 p-2 border rounded-md bg-muted/20"
                        >
                          <div {...provided.dragHandleProps} className="cursor-grab">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            {index + 1}
                          </Badge>

                          <Select value={sort.id} onValueChange={(value) => updateSort(index, value, null)}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={sort.id}>{getColumnLabel(sort.id)}</SelectItem>
                              {getUnusedColumns().map((columnId) => (
                                <SelectItem key={columnId} value={columnId}>
                                  {getColumnLabel(columnId)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-1">
                            <Button
                              variant={sort.desc ? "ghost" : "secondary"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateSort(index, null, false)}
                            >
                              <ArrowUp className="h-4 w-4" />
                              <span className="sr-only">Sort ascending</span>
                            </Button>
                            <Button
                              variant={sort.desc ? "secondary" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateSort(index, null, true)}
                            >
                              <ArrowDown className="h-4 w-4" />
                              <span className="sr-only">Sort descending</span>
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-8 w-8 p-0"
                            onClick={() => removeSort(index)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Remove sort</span>
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={addSort}
          disabled={getUnusedColumns().length === 0}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add sort
        </Button>

        {sorting.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setSorting([])} className="flex items-center gap-1">
            <Trash className="h-4 w-4" />
            Reset all
          </Button>
        )}
      </div>
    </div>
  )
}

