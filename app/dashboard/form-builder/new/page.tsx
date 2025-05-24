"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form-builder/form-builder";
import { FormSettings } from "@/components/form-builder/form-settings";
import { FormPreview } from "@/components/form-builder/form-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/components/context/page";

export default function NewFormPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: uuidv4(),
    title: "Untitled Form",
    description: "Form description",
    direction: "ltr",
    elements: [],
    active: false,
    createdBy: "",
    department: "",
    percentage: 100,
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

  const saveForm = () => {
    if (formData.elements.length !== 0) {
      formData.createdBy = user.name;
      formData.department = formData.department || user.department;
      try {
        axios.post("http://172.18.1.31:8000/form/create", formData);

        // Redirect to form builder page
        router.push("/dashboard/form-builder");
        toast.success("New form created successfully", {
          action: {
            label: "Ok",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (error) {
        console.error("Error saving form:", error);
      }
    } else {
      toast.error("Please add at least one element to your form", {
        action: {
          label: "Ok",
          onClick: () => toast.dismiss(),
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Create New Form</h2>
          <p className="text-muted-foreground">
            Design your form using the drag-and-drop builder
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/form-builder")}
          >
            Cancel
          </Button>
          <Button onClick={saveForm}>Save Form</Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent
          value="builder"
          className="border rounded-md p-4 min-h-[600px]"
        >
          <FormBuilder formData={formData} setFormData={setFormData} />
        </TabsContent>
        <TabsContent
          value="preview"
          className="border rounded-md p-4 min-h-[600px]"
        >
          <FormPreview formData={formData} />
        </TabsContent>
        <TabsContent
          value="settings"
          className="border rounded-md p-4 min-h-[600px]"
        >
          <FormSettings formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
