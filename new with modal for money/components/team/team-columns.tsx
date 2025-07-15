"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface Employee {
  id: string;
  userId: string;
  name: string;
  email?: string;
  department?: string;
  position?: string;
  privilege: number;
  cardNumber?: string;
  password?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deviceSync: boolean;
  apiSync: boolean;
}

interface TeamColumnsProps {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const createTeamColumns = ({
  onEdit,
  onDelete,
}: TeamColumnsProps): ColumnDef<Employee>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("userId")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.getValue("email") || "—"}
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => <div>{row.getValue("department") || "—"}</div>,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => <div>{row.getValue("position") || "—"}</div>,
  },
  {
    accessorKey: "privilege",
    header: "Privilege",
    cell: ({ row }) => {
      const privilege = row.getValue("privilege") as number;
      return (
        <Badge variant={privilege === 14 ? "default" : "secondary"}>
          {privilege === 14 ? "Admin" : "User"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "sync",
    header: "Sync Status",
    cell: ({ row }) => {
      const employee = row.original;
      const { deviceSync, apiSync } = employee;

      if (deviceSync && apiSync) {
        return <Badge variant="default">Synced</Badge>;
      } else if (deviceSync && !apiSync) {
        return <Badge variant="secondary">Device Only</Badge>;
      } else if (!deviceSync && apiSync) {
        return <Badge variant="outline">API Only</Badge>;
      } else {
        return <Badge variant="destructive">Not Synced</Badge>;
      }
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {createdAt ? format(new Date(createdAt), "MMM dd, yyyy") : "—"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(employee.userId)}
            >
              Copy User ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(employee)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Employee
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(employee)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Export a function that creates columns with the required props
export const teamColumns = (props: TeamColumnsProps) =>
  createTeamColumns(props);
