"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Circle,
  Calendar,
  Upload,
  Divide,
  BoxSelect,
  Grip,
} from "lucide-react";

interface FormElementToolboxProps {
  onAddElement: (elementType: string) => void;
}

export function FormElementToolbox({ onAddElement }: FormElementToolboxProps) {
  const elements = [
    { type: "name", label: "Department Name", icon: Grip },
    { type: "text", label: "Text Input", icon: Type },
    { type: "textarea", label: "Text Area", icon: AlignLeft },
    { type: "dropdown", label: "Dropdown", icon: List },
    { type: "checkbox", label: "Checkbox", icon: CheckSquare },
    { type: "radio", label: "Radio Button", icon: Circle },
    { type: "date", label: "Date Picker", icon: Calendar },
    { type: "file", label: "File Upload", icon: Upload },
    { type: "divider", label: "Divider", icon: Divide },
    { type: "select", label: "Select", icon: BoxSelect },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Elements</CardTitle>
        <CardDescription>
          Drag and drop elements to build your form
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {elements.map((element) => (
            <Button
              key={element.type}
              variant="outline"
              className="justify-start"
              onClick={() => onAddElement(element.type)}
            >
              <element.icon className="mr-2 h-4 w-4" />
              {element.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
