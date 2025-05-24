import type { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata: Metadata = {
  title: "Dashboard - FormCraft",
  description: "FormCraft dashboard overview",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your FormCraft dashboard
        </p>
      </div>
      <QuickActions />
      <StatsCards />
      <RecentActivity />
    </div>
  );
}
