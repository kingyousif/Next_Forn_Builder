"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form-builder/form-builder";
import { FormSettings } from "@/components/form-builder/form-settings";
import { FormPreview } from "@/components/form-builder/form-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

export default function UpdateFormPage({ id }: any) {
  const router = useRouter();
  const url = usePathname();
  const lastRoute = url.split("/").filter(Boolean).pop();

  const [formData, setFormData] = useState(null); // ✅ Fix: Initialize as null

  useEffect(() => {
    if (!lastRoute) return; // ✅ Fix: Prevent API call if no ID

    axios
      .get(`http://172.18.1.31:8000/form/fetchone/${lastRoute}`)
      .then((res) => {
        const form = res.data;
        if (form) {
          setFormData({
            _id: form._id,
            title: form.title,
            description: form.description,
            direction: form.direction,
            active: form.active,
            elements: form.elements,
            createdBy: form.createdBy, // ✅ Fix: Add createdBy her
            department: form.department,
            percentage: form.percentage,
            highestScore: form.highestScore,
            settings: form.settings,
            createdAt: form.createdAt,
            updatedAt: new Date().toISOString(),
          });
        }
        // toast.success("Form data fetched successfully");
      })
      .catch((err) => {
        console.error("Error fetching form:", err);
        toast.error("Failed to fetch form data");
      });
  }, [lastRoute]); // ✅ Fix: Dependency list

  const saveForm = async () => {
    if (formData?.elements?.length > 0) {
      // ✅ Fix: Ensure elements exist
      try {
        await axios.post("http://172.18.1.31:8000/form/update", formData); // ✅ Fix: Add `await`
        toast.success("Form saved", {
          action: {
            label: "Ok",
            onClick: () => toast.dismiss(),
          },
        });
        router.push("/dashboard/form-builder");
      } catch (error) {
        console.error("Error saving form:", error);
        toast.error("Failed to save form");
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
          {formData && (
            <FormBuilder formData={formData} setFormData={setFormData} />
          )}
        </TabsContent>
        <TabsContent
          value="preview"
          className="border rounded-md p-4 min-h-[600px]"
        >
          {formData && <FormPreview formData={formData} />}
        </TabsContent>
        <TabsContent
          value="settings"
          className="border rounded-md p-4 min-h-[600px]"
        >
          {formData && (
            <FormSettings formData={formData} setFormData={setFormData} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
