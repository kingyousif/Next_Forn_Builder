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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
}

export function FormTemplates() {
  const [forms, setForms] = useState<Form[]>([]);
  const [templates, setTemplates] = useState<Form[]>([]);
  const url = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true; // ✅ Prevents state update after unmount

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

    // Mock templates
    const mockTemplates = [
      {
        _id: "template-1",
        title: "Contact Form",
        description:
          "A simple contact form with name, email, and message fields",
        elements: [],
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "template-2",
        title: "Event Registration",
        description: "Collect attendee information for your next event",
        elements: [],
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: "template-3",
        title: "Customer Feedback",
        description: "Gather feedback about your products or services",
        elements: [],
        active: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setTemplates(mockTemplates);

    return () => {
      isMounted = false; // ✅ Cleanup function
    };
  }, [user]);

  const handleDeleteForm = async (id: string) => {
    try {
      await axios
        .delete(`http://172.18.1.31:8000/form/delete/${id}`)
        .then(() => {
          const updatedForms = forms.filter((form) => form._id !== id);
          setForms(updatedForms); // ✅ Update state correctly
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
      })
      .catch((err) => {
        toast.error("Failed to activate form");
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Your Forms</h3>
        <p className="text-sm text-muted-foreground">
          Manage your existing forms or create a new one
        </p>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No forms yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You haven't created any forms yet. Get started by creating your
            first form.
          </p>
          <Link href="/dashboard/form-builder/new">
            <Button className="mt-4">Create Form</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form._id}>
              <CardHeader>
                <CardTitle>{form.title}</CardTitle>
                <CardDescription>{form.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  Last updated {formatDate(form.updatedAt)}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href={`/dashboard/form-builder/${form._id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleActiveForm(form)}>
                      <ActivitySquare className="mr-2 h-4 w-4" />
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart className="mr-2 h-4 w-4" />
                      <Link href={`/dashboard/analytics`}>View Analytics</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteForm(form._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-medium">Templates</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-built template to save time
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template._id}>
            <CardHeader>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link
                href={`/dashboard/form-builder/new?template=${template._id}`}
                className="w-full"
              >
                <Button className="w-full">Use Template</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
