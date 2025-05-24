import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormTemplates } from "@/components/form-builder/form-templates";

export const metadata: Metadata = {
  title: "Form Builder - FormCraft",
  description: "Create and manage your forms",
};

export default function FormBuilderPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Form Builder</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage your forms
          </p>
        </div>
        <Link href="/dashboard/form-builder/new">
          <Button>Create New Forms</Button>
        </Link>
      </div>
      <FormTemplates />
    </div>
  );
}
