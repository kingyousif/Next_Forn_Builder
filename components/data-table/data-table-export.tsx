"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, Loader2 } from "lucide-react"
import type { Table } from "@tanstack/react-table"
import type { Task } from "@/lib/data/schema"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableExportProps<TData> {
  table: Table<TData>
}

export function DataTableExport<TData extends Task>({ table }: DataTableExportProps<TData>) {
  const [isExporting, setIsExporting] = useState(false)

  // Helper function to convert data to CSV
  const convertToCSV = (data: TData[]) => {
    // Get visible columns (excluding action columns)
    const visibleColumns = table
      .getAllColumns()
      .filter((column) => column.getIsVisible() && column.id !== "actions" && column.id !== "select")

    // Create header row
    const headers = visibleColumns
      .map((column) => {
        // Use the column header title if available
        const headerTitle = column.columnDef.header?.toString() || column.id
        return `"${headerTitle.replace(/"/g, '""')}"`
      })
      .join(",")

    // Create data rows
    const rows = data
      .map((row) => {
        return visibleColumns
          .map((column) => {
            // Get the raw value for the cell
            const value = row[column.id as keyof TData]

            // Format the value based on its type
            if (value === null || value === undefined) {
              return '""'
            } else if (column.id === "createdAt" && typeof value === "string") {
              // Format date values
              return `"${new Date(value).toLocaleDateString()}"`
            } else if (typeof value === "string") {
              // Escape quotes in strings
              return `"${value.replace(/"/g, '""')}"`
            } else {
              return `"${value}"`
            }
          })
          .join(",")
      })
      .join("\n")

    return `${headers}\n${rows}`
  }

  // Function to export data to Excel (CSV)
  const exportToExcel = (exportAll = false) => {
    setIsExporting(true)

    try {
      // Determine which data to export
      let dataToExport: TData[]

      if (!exportAll && table.getSelectedRowModel().rows.length > 0) {
        // Export only selected rows
        dataToExport = table.getSelectedRowModel().rows.map((row) => row.original) as TData[]
      } else {
        // Export all rows (respecting filters)
        dataToExport = table.getFilteredRowModel().rows.map((row) => row.original) as TData[]
      }

      // Convert data to CSV
      const csv = convertToCSV(dataToExport)

      // Create a Blob and download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      // Set up download attributes
      link.setAttribute("href", url)
      link.setAttribute("download", `tasks-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"

      // Append to document, trigger download, and clean up
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const hasSelectedRows = table.getSelectedRowModel().rows.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1" disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasSelectedRows && (
          <DropdownMenuItem onClick={() => exportToExcel(false)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Selected Rows ({table.getSelectedRowModel().rows.length})
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => exportToExcel(true)} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export All {table.getFilteredRowModel().rows.length} Rows
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

