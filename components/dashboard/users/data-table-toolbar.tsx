"use client";

import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { CrossIcon } from "lucide-react";
import { usersRole, usersStatus } from "./definitions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-1 items-center space-x-2 flex-col justify-start">
        <Input
          placeholder={"Filter"}
          // value={
          //   (table.getColumn("userName")?.getFilterValue() as string) ?? ""
          // }
          onChange={(event) =>
            table.getColumn("user_name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[200px] self-start ms-1"
        />
        <br />
        {/* <div className="w-full flex gap-4">
          {table.getColumn("phone") && (
            <Input
              placeholder={"Search by phone"}
              value={
                (table.getColumn("phone")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("phone")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[200px]"
            />
          )}
          {table.getColumn("email") && (
            <Input
              placeholder={"Search by email"}
              value={
                (table.getColumn("email")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("email")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[200px]"
            />
          )}
          {table.getColumn("location") && (
            <Input
              placeholder={"Search by location"}
              value={
                (table.getColumn("location")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("location")?.setFilterValue(event.target.value)
              }
              className="h-8 w-[150px] lg:w-[200px]"
            />
          )}

          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title={"Status"}
              options={usersStatus}
            />
          )}
          {table.getColumn("role") && (
            <DataTableFacetedFilter
              column={table.getColumn("role")}
              title={"Role"}
              options={usersRole}
            />
          )}
          {isFiltered && (
            <Button
              variant="outline"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              {"Clean Filters"}
              <CrossIcon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div> */}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
