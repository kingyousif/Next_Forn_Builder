"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataTableAdvancedFilters } from "./data-table-advanced-filters"
import { Badge } from "@/components/ui/badge"
import { Filter, X, ArrowUpDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTableSortOptions } from "./data-table-sort-options"
import type { Table } from "@tanstack/react-table"
import type { SortingState } from "@tanstack/react-table"

interface AdvancedFilterPopoverProps {
  advancedFilters: any[]
  setAdvancedFilters: (filters: any[]) => void
  table: Table<any>
  sorting: SortingState
  setSorting: (sorting: SortingState) => void
}

export function AdvancedFilterPopover({
  advancedFilters,
  setAdvancedFilters,
  table,
  sorting,
  setSorting,
}: AdvancedFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"filters" | "sorting">("filters")

  const hasFilters = advancedFilters.length > 0
  const hasSorting = sorting.length > 0
  const hasActiveOptions = hasFilters || hasSorting

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={hasActiveOptions ? "default" : "outline"} size="sm" className="h-8 gap-1">
          {activeTab === "filters" ? <Filter className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}

          {hasActiveOptions ? (
            <div className="flex items-center">
              <span>Advanced Options</span>
              {hasFilters && (
                <Badge variant="secondary" className="ml-1 bg-background text-foreground">
                  {advancedFilters.length} {advancedFilters.length === 1 ? "filter" : "filters"}
                </Badge>
              )}
              {hasSorting && (
                <Badge variant="secondary" className="ml-1 bg-background text-foreground">
                  {sorting.length} {sorting.length === 1 ? "sort" : "sorts"}
                </Badge>
              )}
            </div>
          ) : (
            "Advanced Options"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[650px] p-0" align="end">
        <Tabs
          defaultValue="filters"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "filters" | "sorting")}
          className="w-full"
        >
          <div className="flex items-center justify-between border-b p-4">
            <TabsList>
              <TabsTrigger value="filters" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasFilters && (
                  <Badge variant="secondary" className="ml-1">
                    {advancedFilters.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sorting" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sorting
                {hasSorting && (
                  <Badge variant="secondary" className="ml-1">
                    {sorting.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {activeTab === "filters" && hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => setAdvancedFilters([])}
                >
                  Reset filters
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
              {activeTab === "sorting" && hasSorting && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => setSorting([])}
                >
                  Reset sorting
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="filters" className="p-0 m-0">
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <DataTableAdvancedFilters
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
                inPopover={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="sorting" className="p-0 m-0">
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <DataTableSortOptions table={table} sorting={sorting} setSorting={setSorting} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button variant="default" size="sm" onClick={() => setOpen(false)} disabled={!hasActiveOptions}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

