// import { DataTable } from "@/components/data-table/data-table";
import { columns } from "@/components/data-table/columns";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/data-table/table-skeleton";
import { DataTable } from "@/components/data-table/data-table";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <Suspense fallback={<TableSkeleton />}>
        <DataTable columns={columns} />
      </Suspense>
    </main>
  );
}
