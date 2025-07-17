"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Trash2,
  Edit,
  Clock,
  BarChart,
  ActivitySquare,
  Plus,
  Sparkles,
  Zap,
  TrendingUp,
  MoreVertical,
  Eye,
  Copy,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/page";

interface Form {
  _id: string;
  title: string;
  description: string;
  active: boolean;
  elements: any[];
  createdAt: string;
  updatedAt: string;
  department: string;
}

const departmentConfig = {
  HR: {
    color:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    icon: "👥",
    accent: "emerald",
  },
  IT: {
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    icon: "💻",
    accent: "blue",
  },
  Marketing: {
    color:
      "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    icon: "📢",
    accent: "purple",
  },
  Sales: {
    color:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    icon: "💰",
    accent: "orange",
  },
  Finance: {
    color:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    icon: "📊",
    accent: "green",
  },
  Operations: {
    color:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    icon: "⚙️",
    accent: "indigo",
  },
  default: {
    color: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    icon: "📋",
    accent: "gray",
  },
};

export function FormTemplates() {
  const [forms, setForms] = useState<Form[]>([]);
  const url = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (user) {
      let id = user._id || user.id;
      axios
        .get(`${url}form/fetch/${id}`)
        .then((res) => {
          if (isMounted) {
            setForms(res.data);
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          console.error("Error fetching forms:", err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleDeleteForm = async (id: string) => {
    try {
      await axios
        .delete(`http://172.18.1.31:8000/form/delete/${id}`)
        .then(() => {
          const updatedForms = forms.filter((form) => form._id !== id);
          setForms(updatedForms);
          toast.success("Form deleted successfully");
        });
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Failed to delete form");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ca-ES", {
      year: "numeric",
      day: "numeric",
      month: "numeric",
    }).format(date);
  };

  const handleActiveForm = (selectedForm: Form) => {
    axios
      .put(`http://172.18.1.31:8000/form/fetchActive/${selectedForm._id}`, {
        department: selectedForm.department,
        user: user.name,
        userDepartment: user.department,
      })
      .then((res) => {
        toast.success("Form activated successfully");
        let isMounted = true;
        if (user) {
          let id = user._id || user.id;
          axios
            .get(`${url}form/fetch/${id}`)
            .then((res) => {
              if (isMounted) {
                setForms(res.data);
              }
            })
            .catch((err) => {
              toast.error(err.response.data.message);
              console.error("Error fetching forms:", err);
            });
        }
        return () => {
          isMounted = false;
        };
      })
      .catch((err) => {
        toast.error("Failed to activate form");
      });
  };

  const getDepartmentConfig = (department: string) => {
    return departmentConfig[department] || departmentConfig.default;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Your Workspace
          </span>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="relative space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-foreground">
                Start Building Forms
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create your first form and start collecting responses from your
                users
              </p>
            </div>
            <Link href="/dashboard/form-builder/new">
              <Button
                size="lg"
                className="shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Form
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form, index) => {
            const config = getDepartmentConfig(form.department);
            return (
              <Card
                key={form._id}
                className="group relative overflow-hidden border bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] rounded-2xl"
              >
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-secondary/50"></div>

                <CardHeader className="space-y-4 p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {form.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-muted-foreground leading-relaxed line-clamp-2">
                        {form.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0  group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl shadow-xl"
                      >
                        {/* <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          Preview Form
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem> */}
                        {/* <DropdownMenuSeparator /> */}
                        <DropdownMenuItem
                          onClick={() => handleActiveForm(form)}
                          className="gap-2 text-emerald-600 focus:text-emerald-600"
                        >
                          <Zap className="h-4 w-4" />
                          {form.active ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <BarChart className="h-4 w-4" />
                          <Link href={`/dashboard/analytics`}>Analytics</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteForm(form._id)}
                          className="gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-medium border ${config.color}`}
                    >
                      {form.department}
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          form.active ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {form.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    <Clock className="h-4 w-4" />
                    <span>Updated {formatDate(form.updatedAt)}</span>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {form.elements?.length || 0}
                      </div>
                      <div className="text-xs text-blue-600/70 dark:text-blue-400/70">
                        Elements
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {form.highestScore || 0}
                      </div>
                      <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
                        Highest Score
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <div className="flex w-full gap-3">
                    <Link
                      href={`/dashboard/form-builder/${form._id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full transition-all duration-200 hover:scale-105"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Form
                      </Button>
                    </Link>

                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Settings className="h-4 w-4" />
                    </Button> */}
                  </div>
                </CardFooter>

                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
