"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form-builder/form-builder";
import { FormSettings } from "@/components/form-builder/form-settings";
import { FormPreview } from "@/components/form-builder/form-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/components/context/page";
import {
  Save,
  X,
  Palette,
  Eye,
  Settings,
  Sparkles,
  FileText,
  Layers,
} from "lucide-react";

export default function NewFormPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: uuidv4(),
    title: "Untitled Form",
    description: "Form description",
    direction: "ltr",
    elements: [],
    active: false,
    createdBy: "",
    department: "",
    percentage: 50,
    highestScore: 1,
    settings: {
      submitButtonText: "Submit",
      successMessage: "Thank you for your submission!",
      enableEmailNotifications: false,
      emailRecipient: "",
      theme: "light",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const saveForm = async () => {
    if (formData.elements.length === 0) {
      toast.error("Please add at least one element to your form", {
        action: {
          label: "Ok",
          onClick: () => toast.dismiss(),
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      formData.createdBy = user.name;
      formData.department = formData.department || user.department;

      await axios.post("http://172.18.1.31:8000/form/create", formData);

      router.push("/dashboard/form-builder");
      toast.success("New form created successfully", {
        action: {
          label: "Ok",
          onClick: () => toast.dismiss(),
        },
      });
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form. Please try again.", {
        action: {
          label: "Ok",
          onClick: () => toast.dismiss(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl" />
          <Card className="relative border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Create New Form
                    </h1>
                  </div>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Design beautiful, responsive forms with our intuitive
                    drag-and-drop builder
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {formData.elements.length} Elements
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      <Layers className="h-3 w-3 mr-1" />
                      {formData.department ||
                        user.department ||
                        "No Department"}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/dashboard/form-builder")}
                    className="border-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    onClick={saveForm}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Form"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="builder" className="w-full">
              <div className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4">
                <TabsList className="grid w-full max-w-md grid-cols-3 bg-white dark:bg-slate-800 shadow-sm">
                  <TabsTrigger
                    value="builder"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    <Palette className="h-4 w-4" />
                    <span className="hidden sm:inline">Builder</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="builder" className="p-6 min-h-[700px]">
                <FormBuilder formData={formData} setFormData={setFormData} />
              </TabsContent>

              <TabsContent value="preview" className="p-6 min-h-[700px]">
                <FormPreview formData={formData} />
              </TabsContent>

              <TabsContent value="settings" className="p-6 min-h-[700px]">
                <FormSettings formData={formData} setFormData={setFormData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
