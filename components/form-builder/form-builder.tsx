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
import { ArrowRightLeft } from "lucide-react";
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
    if (e.target.value > 100) {
      e.target.value = 100;
    }
    if (e.target.value < 0) {
      e.target.value = 0;
    }
    setFormData({
      ...formData,
      percentage: e.target.value,
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
      highestScore: e.target.value,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <div className="md:col-span-3">
        <div className="mb-6 space-y-4" dir={formData.direction || "ltr"}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="form-title">Form Title</Label>
              {/* change direction of the  */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormDirectionChange}
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Input
              id="form-title"
              value={formData.title}
              onChange={handleFormTitleChange}
              placeholder="Enter form title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-description">Form Description</Label>
            <Textarea
              id="form-description"
              value={formData.description}
              onChange={handleFormDescriptionChange}
              placeholder="Enter form description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Select Department</Label>
            <Select
              value={formData.department || user.department}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  department: value,
                });
              }}
            >
              <SelectTrigger id="department" className="">
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
                  <SelectItem value="Physiotherapy">Physiotherapy</SelectItem>
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
                  <SelectItem value="Dental center">Dental center</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="form-percentage">Form Percentage</Label>
              {/* change direction of the  */}
            </div>
            <Input
              id="form-percentage"
              value={formData.percentage}
              type="number"
              onChange={handleFormPercentageChange}
              max={100}
              min={0}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="form-Highest-Score">Highest Score</Label>
              {/* change direction of the  */}
            </div>
            <Input
              id="form-Highest-Score"
              value={formData.highestScore}
              type="number"
              onChange={handleFormHighestScoreChange}
            />
          </div>
        </div>

        <div className="rounded-md border p-4">
          {formData.elements?.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop form elements here to build your form
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
        </div>
      </div>

      <div className="md:col-span-1">
        <FormElementToolbox onAddElement={handleAddElement} />
      </div>
    </div>
  );
}
