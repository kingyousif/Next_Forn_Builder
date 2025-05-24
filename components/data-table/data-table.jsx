"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableFloatingBar } from "./data-table-floating-bar";
import { getTasks, createTask, updateTask, deleteTask } from "@/lib/data/tasks";
import { useToast } from "@/hooks/use-toast";
import { CreateTaskDialog } from "./dialogs/create-task-dialog";
import { EditTaskDialog } from "./dialogs/edit-task-dialog";
import { DeleteTaskDialog } from "./dialogs/delete-task-dialog";
import { Loader2 } from "lucide-react";
import axios from "axios";

export function DataTable({ columns }) {
  const { toast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterMode, setFilterMode] = useState("advanced");
  const [advancedFilters, setAdvancedFilters] = useState([]);

  // CRUD state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load data
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    const fetchData = async () => {
      setLoading(true);
      try {
        const tasks = await axios.get(`${url}attendance/fetch`).then((res) => {
          setData(res.data);
        });
        // setData(tasks);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Load table state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("tableState");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setSorting(state.sorting || []);
        setColumnFilters(state.columnFilters || []);
        setColumnVisibility(state.columnVisibility || {});
        setGlobalFilter(state.globalFilter || "");
        setAdvancedFilters(state.advancedFilters || []);
        setFilterMode(state.filterMode || "advanced");
      } catch (error) {
        console.error("Error parsing saved table state:", error);
      }
    }
  }, []);

  // Save table state to localStorage
  useEffect(() => {
    const tableState = {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      advancedFilters,
      filterMode,
    };
    localStorage.setItem("tableState", JSON.stringify(tableState));
  }, [
    sorting,
    columnFilters,
    columnVisibility,
    globalFilter,
    advancedFilters,
    filterMode,
  ]);

  // Apply advanced filters to the data
  const filteredData = useMemo(() => {
    if (!advancedFilters.length || filterMode !== "advanced") return data;

    return data.filter((row) => {
      return advancedFilters.every((filter) => {
        const { field, operator, value, value2 } = filter;

        if (!value && operator !== "isNull" && operator !== "isNotNull")
          return true;

        const rowValue = row[field];

        switch (operator) {
          // Text operators
          case "is":
            return rowValue === value;
          case "isNot":
            return rowValue !== value;
          case "contains":
            return String(rowValue)
              .toLowerCase()
              .includes(String(value).toLowerCase());
          case "notContains":
            return !String(rowValue)
              .toLowerCase()
              .includes(String(value).toLowerCase());
          case "equal":
            return rowValue === value;
          case "notEqual":
            return rowValue !== value;
          case "isNull":
            return (
              rowValue === null || rowValue === undefined || rowValue === ""
            );
          case "isNotNull":
            return (
              rowValue !== null && rowValue !== undefined && rowValue !== ""
            );

          // Number operators
          case "greaterThan":
            return Number(rowValue) > Number(value);
          case "smallerThan":
            return Number(rowValue) < Number(value);
          case "equalOrGreaterThan":
            return Number(rowValue) >= Number(value);
          case "equalOrSmallerThan":
            return Number(rowValue) <= Number(value);

          // Date operators
          case "isBefore":
            return new Date(rowValue) < new Date(value);
          case "isAfter":
            return new Date(rowValue) > new Date(value);
          case "isOnOrBefore":
            return new Date(rowValue) <= new Date(value);
          case "isOnOrAfter":
            return new Date(rowValue) >= new Date(value);
          case "isBetween":
            return (
              new Date(rowValue) >= new Date(value) &&
              new Date(rowValue) <= new Date(value2)
            );
          case "isNotBetween":
            return (
              new Date(rowValue) < new Date(value) ||
              new Date(rowValue) > new Date(value2)
            );
          default:
            return true;
        }
      });
    });
  }, [data, advancedFilters, filterMode]);

  const table = useReactTable({
    data: filteredData,
    columns: columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    enableMultiSort: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    meta: {
      editRow: (row) => {
        setSelectedTask(row);
        setEditDialogOpen(true);
      },
      deleteRow: (row) => {
        setSelectedTask(row);
        setDeleteDialogOpen(true);
      },
    },
  });

  // CRUD operations
  // const handleCreateTask = async (newTask) => {
  //   try {
  //     setIsCreating(true);
  //     const createdTask = await createTask(newTask);
  //     setData((prev) => [...prev, createdTask]);
  //     toast({
  //       title: "Success",
  //       description: "Task created successfully",
  //     });
  //     setCreateDialogOpen(false);
  //   } catch (error) {
  //     console.error("Error creating task:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to create task. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsCreating(false);
  //   }
  // };

  // const handleUpdateTask = async (updatedTask) => {
  //   try {
  //     setIsUpdating(true);
  //     await updateTask(updatedTask);
  //     setData((prev) =>
  //       prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
  //     );
  //     toast({
  //       title: "Success",
  //       description: "Task updated successfully",
  //     });
  //     setEditDialogOpen(false);
  //     setSelectedTask(null);
  //   } catch (error) {
  //     console.error("Error updating task:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to update task. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  // const handleDeleteTask = async (id) => {
  //   try {
  //     setIsDeleting(true);
  //     await deleteTask(id);
  //     setData((prev) => prev.filter((task) => task.id !== id));
  //     toast({
  //       title: "Success",
  //       description: "Task deleted successfully",
  //     });
  //     setDeleteDialogOpen(false);
  //     setSelectedTask(null);
  //   } catch (error) {
  //     console.error("Error deleting task:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to delete task. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        onCreateNew={() => setCreateDialogOpen(true)}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        sorting={sorting}
        setSorting={setSorting}
      />

      {filterMode === "floating" && <DataTableFloatingBar table={table} />}

      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table className="min-w-full">
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-muted/60 border-b"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-muted-foreground py-3"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-96">
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* CRUD Dialogs */}
      {/* <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />

      {selectedTask && (
        <EditTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={selectedTask}
          onSubmit={handleUpdateTask}
          isLoading={isUpdating}
        />
      )}

      {selectedTask && (
        <DeleteTaskDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          task={selectedTask}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          isLoading={isDeleting}
        />
      )} */}
    </div>
  );
}
