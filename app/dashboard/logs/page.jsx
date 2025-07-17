"use client";

import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Search, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/context/page";
import axios from "axios";

export default function LogPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define columns for the log table
  const columns = [
    {
      accessorKey: "action",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => <div>{row.getValue("action")}</div>,
    },
    {
      accessorKey: "module",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Module" />
      ),
      cell: ({ row }) => <div>{row.getValue("module")}</div>,
    },
    {
      accessorKey: "method",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Method" />
      ),
      cell: ({ row }) => <div>{row.getValue("method")}</div>,
    },
    {
      accessorKey: "userName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => <div>{row.getValue("userName") || "Anonymous"}</div>,
    },
    {
      accessorKey: "userRole",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => <div>{row.getValue("userRole") || "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge
            className="capitalize"
            variant={status === "success" ? "default" : "destructive"}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Timestamp" />
      ),
      cell: ({ row }) => {
        // Handle MongoDB date format
        const createdAt = row.getValue("createdAt");
        let dateStr = "N/A";

        if (createdAt) {
          // Handle MongoDB date format which might be an object with $date property
          const dateValue = createdAt.$date
            ? new Date(createdAt.$date)
            : new Date(createdAt);
          dateStr = dateValue.toLocaleString();
        }

        return <div>{dateStr}</div>;
      },
    },
    {
      accessorKey: "ipAddress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="IP Address" />
      ),
      cell: ({ row }) => <div>{row.getValue("ipAddress") || "N/A"}</div>,
    },
    {
      accessorKey: "details",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Details" />
      ),
      cell: ({ row }) => {
        const details = row.getValue("details");
        return (
          <div className="max-w-[200px] truncate">
            {details ? JSON.stringify(details).substring(0, 50) + "..." : "N/A"}
          </div>
        );
      },
    },
  ];
  const url = process.env.NEXT_PUBLIC_API_URL;

  // Fetch log data
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${url}api/logs/all`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data.logs);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast({
          title: "Error",
          description: "Failed to load log data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  // Refresh logs
  const refreshLogs = async () => {
    setLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await axios.get(`${url}api/logs/all`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const logs = response.data.logs;
      setData(logs);
      toast({
        title: "Success",
        description: "Log data refreshed successfully.",
      });
    } catch (error) {
      console.error("Error refreshing logs:", error);
      toast({
        title: "Error",
        description: "Failed to refresh log data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    enableGlobalFilter: true,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshLogs}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
              <p>Loading logs...</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination table={table} totalRows={data.length} />
    </div>
  );
}
