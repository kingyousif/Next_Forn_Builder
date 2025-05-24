"use client";

import { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";

import { DataTableColumnHeader } from "./data-table-column-header";
import { usersRole, usersStatus } from "./definitions";
import { DataTableRowActions } from "./data-table-row-actions";
type User = {
  sn: number;
  user_id: string;
  record_time: string;
  type: number;
  state: number;
  ip: string;
  user_name: string;
};
export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "sn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"sn"} />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("sn")}</div>;
    },
  },
  {
    accessorKey: "user_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"user_id"} />
    ),
  },
  {
    accessorKey: "record_time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"record_time"} />
    ),
    cell: ({ row }) => {
      const recordTime = new Date(row.getValue("record_time"));
      const formattedTime = recordTime.toLocaleString("ca-CA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      return <div className="font-medium">{formattedTime}</div>;
    },
  },
  {
    accessorKey: "user_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"user_name"} />
    ),
  },
  {
    accessorKey: "otherInformation",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"Other Info"} />
    ),
  },
  {
    accessorKey: "location",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"Location"} />
    ),
  },
  // {
  //   accessorKey: "role",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title={"Role"} />
  //   ),
  //   cell: ({ row }) => {
  //     const role = usersRole.find(
  //       (role) => role.value === row.getValue("role")
  //     );

  //     if (!role) {
  //       // If a value is not what you expect or does not exist you can return null.
  //       return null;
  //     }

  //     return <span>{role.label}</span>;
  //   },
  // },

  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title={"Status"} />
  //   ),
  //   cell: ({ row }) => {
  //     const status = usersStatus.find(
  //       (status) => status.value === row.getValue("status")
  //     );

  //     if (!status) {
  //       return null;
  //     }

  //     return (
  //       <div
  //         className={clsx("flex w-[100px] items-center", {
  //           "text-red-500": status.value === "inactive",
  //           "text-green-500": status.value === "active",
  //         })}
  //       >
  //         {status.icon && (
  //           <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
  //         )}
  //         <span>{status.label}</span>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
