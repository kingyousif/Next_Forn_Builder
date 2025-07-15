import React, { Suspense } from "react";
import { columns } from "@/components/data-table/columns";
import { TableSkeleton } from "@/components/data-table/table-skeleton";
import { DataTable } from "@/components/data-table/data-table";
// import { DataTable } from "@/components/data-table/data-table";

const page = () => {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DataTable columns={columns} />
    </Suspense>
  );
};

export default page;
