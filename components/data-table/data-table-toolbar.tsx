"use client";

import { Plus, RefreshCcw, Search, SlidersHorizontal } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTableFilterPopover } from "./data-table-filter-popover";
import { DataTableSortPopover } from "./data-table-sort-popover";
import { DataTableExport } from "./data-table-export";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  filterMode: "advanced" | "floating";
  setFilterMode: (mode: "advanced" | "floating") => void;
  onCreateNew: () => void;
  advancedFilters: any[];
  setAdvancedFilters: (filters: any[]) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
}

export function DataTableToolbar<TData>({
  table,
  globalFilter,
  setGlobalFilter,
  filterMode,
  setFilterMode,
  onCreateNew,
  advancedFilters,
  setAdvancedFilters,
  sorting,
  setSorting,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Tabs
          value={filterMode}
          onValueChange={(value) =>
            setFilterMode(value as "advanced" | "floating")
          }
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced table
            </TabsTrigger>
            <TabsTrigger value="floating" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Floating bar
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="ml-auto flex items-center gap-2">
          {filterMode === "advanced" && (
            <>
              <DataTableFilterPopover
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
              />
              <DataTableSortPopover
                table={table}
                sorting={sorting}
                setSorting={setSorting}
              />
              <DataTableExport table={table} />
            </>
          )}

          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={onCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-8"
            // onClick={getAndSendAttendanceData}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-9 w-full sm:w-[300px]"
          />
        </div>
      </div>
    </div>
  );
}
