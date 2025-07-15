import { FormAnalytics } from "@/components/dashboard/formAnalytics";
import type { Metadata } from "next";
// import { FormAnalytics } from "@/components/dashboard/form-analytics";

export const metadata: Metadata = {
  title: "Analytics - FormCraft",
  description: "Form submission analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          View insights and statistics for your forms
        </p>
      </div>
      <FormAnalytics />
    </div>
  );
}
