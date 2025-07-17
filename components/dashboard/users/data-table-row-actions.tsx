"use client";

// import { UserSchema } from "@/app/users/userSchema";
import Link from "next/link";

import { Row } from "@tanstack/react-table";
import { Eye, FlipHorizontalIcon, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  // const user = UserSchema.parse(row.original);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <FlipHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">{"Open Menu"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={"justify-start w-full"}
            asChild
          >
            <Link href={"#"}>
              <Eye className="w-4 h-4 text-blue-500" />
              {<span className="ml-2">{"View"}</span>}
            </Link>
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={"justify-start w-full"}
            asChild
          >
            <Link href={"#"}>
              <Pencil className="h-4 w-4 text-green-500" />
              {<span className="ml-2">{"Update"}</span>}
            </Link>
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={"justify-start w-full"}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            {<span className="ml-2">{"Delete"}</span>}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
