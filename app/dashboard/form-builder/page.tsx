import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormTemplates } from "@/components/form-builder/form-templates";
import {
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  FileText,
  Activity,
} from "lucide-react";

export default function FormBuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8 p-8">
        {/* Header Section with Theme-Aware Design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 via-primary to-primary/90 p-8 text-primary-foreground shadow-2xl dark:from-primary/80 dark:via-primary/90 dark:to-primary/80">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-6 w-full md:w-auto">
              <div className="flex items-center gap-4 group">
                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm border border-white/20 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Sparkles className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white transform transition-all duration-300 hover:translate-x-1">
                    Form Builder
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
                    <span className="text-sm md:text-base text-white/90 font-medium">
                      Live Dashboard
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-lg md:text-xl text-white/90 max-w-md leading-relaxed font-medium">
                Design, customize, and deploy forms with our intuitive builder
              </p>
            </div>
            <Link
              href="/dashboard/form-builder/new"
              className="w-full md:w-auto"
            >
              <Button
                size="lg"
                className="w-full md:w-auto bg-white/20 backdrop-blur-sm border border-white/30 text-white 
                hover:bg-white/30 shadow-xl transition-all duration-300 hover:scale-105 
                hover:shadow-white/20 font-medium text-base md:text-lg
                group relative overflow-hidden"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
                ></span>
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create New Form
              </Button>
            </Link>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-white/5 blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Stats Grid */}

        {/* Form Templates Section */}
        <div className="rounded-3xl border bg-card/50 p-8 shadow-xl backdrop-blur-sm">
          <FormTemplates />
        </div>
      </div>
    </div>
  );
}
