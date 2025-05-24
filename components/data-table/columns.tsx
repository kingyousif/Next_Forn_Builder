"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task } from "@/lib/data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subHours } from "date-fns";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: "id",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Task ID" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="font-medium">TASK-{row.getValue("id")}</div>
  //   ),
  //   enableSorting: true,
  //   enableHiding: true,
  //   filterFn: (row, id, value) => {
  //     return String(row.getValue(id)).includes(String(value));
  //   },
  // },

  {
    accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("user_name")}</div>;
    },
    filterFn: (row, id, value) => {
      return String(row.getValue(id))
        .toLowerCase()
        .includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          className="capitalize"
          variant={
            status === "Check-in"
              ? "default"
              : status === "Check-out"
              ? "destructive"
              : "outline"
          }
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return String(row.getValue(id))
        .toLowerCase()
        .includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Time" />
    ),
    cell: ({ row }) => {
      const adjustedTimestamp = subHours(row.getValue("timestamp"), 3);

      return <div>{format(adjustedTimestamp, "yyyy-MM-dd HH:mm:ss")}</div>;
    },
    filterFn: (row, id, value) => {
      if (Array.isArray(value)) {
        // Range filtering
        const [from, to] = value;
        const date = new Date(row.getValue(id));
        return date >= new Date(from) && date <= new Date(to);
      }

      // Single date filtering
      if (!value) return true;
      const date = new Date(row.getValue(id));
      const filterDate = new Date(value);
      return date >= filterDate;
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row, table }) => {
  //     const task = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(task.id.toString())}
  //           >
  //             Copy task ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem
  //             onClick={() => (table.options.meta as any)?.editRow(task)}
  //           >
  //             <Pencil className="mr-2 h-4 w-4" />
  //             Edit
  //           </DropdownMenuItem>
  //           <DropdownMenuItem
  //             onClick={() => (table.options.meta as any)?.deleteRow(task)}
  //             className="text-destructive focus:text-destructive"
  //           >
  //             <Trash className="mr-2 h-4 w-4" />
  //             Delete
  //           </DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
