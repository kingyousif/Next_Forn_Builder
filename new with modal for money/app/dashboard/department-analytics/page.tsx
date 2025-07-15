"use client";

import { useState, useEffect } from "react";
import { DepartmentAnalyticsTable } from "@/components/dashboard/department-analytics/department-analytics-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state for demonstration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Department Analytics
        </h2>
        <p className="text-muted-foreground">
          View insights and statistics for departments and users
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <Skeleton className="h-[400px] w-full" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
        </div>
      ) : (
        <DepartmentAnalyticsTable />
      )}
    </div>
  );
}
