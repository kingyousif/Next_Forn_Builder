"use client";

import type React from "react";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { FormElementToolbox } from "./form-element-toolbox";
import { FormElementItem } from "./form-element-item";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Plus, Settings2, Target, Percent } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../context/page";

interface FormBuilderProps {
  formData: any;
  setFormData: (data: any) => void;
}

export function FormBuilder({ formData, setFormData }: FormBuilderProps) {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData((prevData: any) => {
        const oldIndex = prevData.elements.findIndex(
          (element: any) => element.id === active.id
        );
        const newIndex = prevData.elements.findIndex(
          (element: any) => element.id === over.id
        );

        return {
          ...prevData,
          elements: arrayMove(prevData.elements, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  };

  const handleAddElement = (elementType: string) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      label: `${elementType.charAt(0).toUpperCase() + elementType.slice(1)}`,
      placeholder: `Enter ${elementType}...`,
      required: false,
      direction: "ltr",
      active: false,
      options:
        elementType === "dropdown" ||
        elementType === "radio" ||
        elementType === "checkbox"
          ? [
              { id: `option-${Date.now()}-1`, label: "Option 1" },
              { id: `option-${Date.now()}-2`, label: "Option 2" },
            ]
          : undefined,
    };

    setFormData({
      ...formData,
      elements: [...formData.elements, newElement],
    });
  };

  const handleUpdateElement = (id: string, updates: any) => {
    setFormData({
      ...formData,
      elements: formData.elements.map((element: any) =>
        element.id === id ? { ...element, ...updates } : element
      ),
    });
  };

  const handleRemoveElement = (id: string) => {
    setFormData({
      ...formData,
      elements: formData.elements.filter((element: any) => element.id !== id),
    });
  };

  const handleFormTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      title: e.target.value,
    });
  };

  const handleFormPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = parseInt(e.target.value);
    if (value > 100) value = 100;
    if (value < 0) value = 0;
    setFormData({
      ...formData,
      percentage: value,
    });
  };

  const handleFormDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      description: e.target.value,
    });
  };

  const handleFormDirectionChange = () => {
    setFormData({
      ...formData,
      direction: formData.direction === "ltr" ? "rtl" : "ltr",
    });
  };

  const handleFormHighestScoreChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      highestScore: parseInt(e.target.value) || 1,
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Form Configuration Panel */}
      <div className="xl:col-span-3 space-y-6">
        {/* Form Settings Card */}
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5 text-blue-600" />
              Form Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6" dir={formData.direction || "ltr"}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="form-title" className="text-sm font-medium">
                    Form Title
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFormDirectionChange}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowRightLeft className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  id="form-title"
                  value={formData.title}
                  onChange={handleFormTitleChange}
                  placeholder="Enter form title"
                  className="bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Department
                </Label>
                <Select
                  value={formData.department || user.department}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      department: value,
                    });
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Reception and Scrter">
                        Reception and Scrter
                      </SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Radiology">Radiology</SelectItem>
                      <SelectItem value="Physiotherapy">
                        Physiotherapy
                      </SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="GIT">GIT</SelectItem>
                      <SelectItem value="Ward">Ward</SelectItem>
                      <SelectItem value="Laboratory">Laboratory</SelectItem>
                      <SelectItem value="Dermatology">Dermatology</SelectItem>
                      <SelectItem value="Operation">Operation</SelectItem>
                      <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="NICU">NICU</SelectItem>
                      <SelectItem value="Clinic Senior Doctors">
                        Clinic Senior Doctors
                      </SelectItem>
                      <SelectItem value="Emergency Doctors">
                        Emergency Doctors
                      </SelectItem>
                      <SelectItem value="ward doctors">ward doctors</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="ICU">ICU</SelectItem>
                      <SelectItem value="pediatric S.H.O Doctors">
                        pediatric S.H.O Doctors
                      </SelectItem>
                      <SelectItem value="ICU S.H.O Doctors">
                        ICU S.H.O Doctors
                      </SelectItem>
                      <SelectItem value="Accounting">Accounting</SelectItem>
                      <SelectItem value="Dental center">
                        Dental center
                      </SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-description" className="text-sm font-medium">
                Form Description
              </Label>
              <Textarea
                id="form-description"
                value={formData.description}
                onChange={handleFormDescriptionChange}
                placeholder="Enter form description"
                rows={3}
                className="bg-white dark:bg-slate-800 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="form-percentage"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Percent className="h-4 w-4 text-blue-600" />
                  Form Percentage
                </Label>
                <Input
                  id="form-percentage"
                  value={formData.percentage}
                  type="number"
                  onChange={handleFormPercentageChange}
                  max={100}
                  min={0}
                  className="bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="form-highest-score"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <Target className="h-4 w-4 text-green-600" />
                  Highest Score
                </Label>
                <Input
                  id="form-highest-score"
                  value={formData.highestScore}
                  type="number"
                  onChange={handleFormHighestScoreChange}
                  min={1}
                  className="bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements Area */}
        <Card className="min-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Form Elements</span>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              >
                {formData.elements?.length || 0} elements
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.elements?.length === 0 ? (
              <div className="flex h-96 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 text-center transition-colors hover:border-blue-400 dark:hover:border-blue-500">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Start Building Your Form
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Drag and drop form elements from the toolbox to build your
                  form. You can reorder elements by dragging them.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={
                    formData.elements?.map((element: any) => element.id) || []
                  }
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {formData.elements?.map((element: any) => (
                      <FormElementItem
                        key={element.id}
                        formData={formData}
                        element={element}
                        onUpdate={(updates) =>
                          handleUpdateElement(element.id, updates)
                        }
                        onRemove={() => handleRemoveElement(element.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toolbox Panel */}
      <div className="xl:col-span-1">
        <div className="sticky top-6">
          <FormElementToolbox onAddElement={handleAddElement} />
        </div>
      </div>
    </div>
  );
}
