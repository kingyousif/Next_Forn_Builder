"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GripVertical,
  Trash2,
  Copy,
  Settings,
  CalendarIcon,
  Trash,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import axios from "axios";
import { useAuth } from "../context/page";

interface FormElementItemProps {
  element: any;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
  formData: any;
}

export function FormElementItem({
  element,
  onUpdate,
  onRemove,
  formData,
}: FormElementItemProps) {
  const [showSettings, setShowSettings] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ label: e.target.value });
  };

  const handlePlaceholderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ placeholder: e.target.value });
  };

  const handleRequiredChange = (checked: boolean) => {
    onUpdate({ required: checked });
  };

  const handleOptionLabelChange = (
    optionId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({
      options: element.options.map((option: any) => {
        if (option.id === optionId) {
          return { ...option, label: e.target.value };
        }
        return option;
      }),
    });
  };

  const handleAddOption = () => {
    onUpdate({
      options: [
        ...element.options,
        { id: `option-${Date.now()}`, label: "New Option" },
      ],
    });
  };

  const handleDeleteOption = (optionId: string) => {
    onUpdate({
      options: element.options.filter((option: any) => option.id !== optionId),
    });
  };

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(element.options || []);
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const url = process.env.NEXT_PUBLIC_API_URL || "";

  const renderElementPreview = () => {
    switch (element.type) {
      case "name":
        const handleAddOption = (value: string) => {
          if (!value.trim()) return;

          // Check if option already exists
          const exists = options.some(
            (option: any) => option.value.toLowerCase() === value.toLowerCase()
          );

          if (exists) {
            setOpen(false);
            return;
          }

          const newOption = {
            value: value.toLowerCase(),
            label: value.trim(),
          };

          setOptions([...options, newOption]);
          onUpdate({
            value: newOption.value,
            options: [...options, newOption],
          });
          setInputValue("");
          setOpen(false);
        };

        const fetchUser = async () => {
          try {
            const response = await axios.post(`${url}user/fetchForDepartment`, {
              department: formData.department || user.department,
              user: user._id || user.id,
            });
            return response.data;
          } catch (error) {
            console.error("Error fetching users:", error);
            return [];
          }
        };

        // Fetch users when component mounts or when department changes
        useEffect(() => {
          const fetchData = async () => {
            const fetchedUsers = await fetchUser();
            setUsers(fetchedUsers);
          };

          fetchData();
        }, [user?.department, url]); // Add dependencies to prevent unnecessary fetches

        // Update options when users change
        useEffect(() => {
          if (users.length > 0) {
            const userOptions = users.map((user) => ({
              value: user.name,
              label: user.fullName,
            }));

            setOptions(userOptions);

            // Update parent component with new options
            onUpdate({
              options: userOptions,
            });
          }
        }, [users]);

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {element.value
                  ? options.find(
                      (option: any) => option.value === element.value
                    )?.label
                  : "Select or add name..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search or add new name..."
                  value={inputValue}
                  onValueChange={setInputValue}
                />
                <CommandList>
                  <CommandEmpty className="p-0">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleAddOption(inputValue)}
                    >
                      Add "{inputValue}"
                    </Button>
                  </CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={(currentValue) => {
                          onUpdate({ value: currentValue });
                          setInputValue("");
                          setOpen(false);
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            element.value === option.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      case "text":
        return (
          <Input
            placeholder={element.placeholder || "Enter text..."}
            disabled
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={element.placeholder || "Enter text..."}
            disabled
            rows={3}
          />
        );
      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue
                placeholder={element.placeholder || "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              {element.options?.map((option: any) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {element.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input type="checkbox" id={option.id} disabled />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {element.options?.map((option: any) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input type="radio" name={element.id} id={option.id} disabled />
                <label htmlFor={option.id}>{option.label}</label>
              </div>
            ))}
          </div>
        );
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !element.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {element.date ? (
                  format(element.date, "PPP")
                ) : (
                  <span>{element.placeholder || "pick up a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="!w-full p-0">
              <Calendar
                mode="single"
                selected={element.date}
                onSelect={(date) => onUpdate({ date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case "file":
        return <Input type="file" disabled />;
      case "divider":
        return (
          <div className="py-2">
            <div className="border-t" />
          </div>
        );
      case "select":
        const [selectedValues, setSelectedValues] = useState(
          element.value || []
        );
        const [searchValue, setSearchValue] = useState("");

        // Set default options if none exist
        useEffect(() => {
          if (!element.options || element.options.length === 0) {
            onUpdate({
              options: [
                { id: "option-1", value: "option1", label: "Option 1" },
                { id: "option-2", value: "option2", label: "Option 2" },
                { id: "option-3", value: "option3", label: "Option 3" },
              ],
            });
          }
        }, []);

        const handleSelectItem = (value: string) => {
          const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter((item) => item !== value)
            : [...selectedValues, value];

          setSelectedValues(newSelectedValues);
          onUpdate({ value: newSelectedValues });
        };

        const isSelected = (value: string) => selectedValues.includes(value);

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
                disabled
              >
                {selectedValues.length > 0
                  ? `${selectedValues.length} item${
                      selectedValues.length > 1 ? "s" : ""
                    } selected`
                  : element.placeholder || "Select items..."}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder={element.placeholder || "Search items..."}
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  <CommandEmpty>No items found.</CommandEmpty>
                  <CommandGroup>
                    {element.options
                      ?.filter((option: { label: string }) =>
                        option.label
                          .toLowerCase()
                          .includes(searchValue.toLowerCase())
                      )
                      .map((option: { value: string; label: string }) => (
                        <CommandItem
                          key={option.value}
                          onSelect={() => handleSelectItem(option.value)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex h-4 w-4 items-center justify-center rounded border">
                              {isSelected(option.value) && (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                            <span>{option.label}</span>
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      default:
        return null;
    }
  };

  return (
    <Card ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-3 cursor-grab"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      <CardHeader className="pl-10">
        <div className="flex items-center justify-between">
          <Label>{element.label}</Label>
          {element.required && (
            <span className="text-sm text-destructive">*</span>
          )}
        </div>
      </CardHeader>

      <CardContent>{renderElementPreview()}</CardContent>

      <CardFooter className="flex justify-between border-t p-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>

      {showSettings && (
        <div className="border-t p-4">
          <Accordion type="single" collapsible defaultValue="settings">
            <AccordionItem value="settings" className="border-none">
              <AccordionTrigger className="py-2">
                Element Settings
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${element.id}-label`}>Label</Label>
                    <Input
                      id={`${element.id}-label`}
                      value={element.label}
                      onChange={handleLabelChange}
                    />
                  </div>

                  {element.type === "name" && <div className="space-y-2"></div>}
                  {element.type === "select" && (
                    <div className="space-y-2">
                      <Label htmlFor={`${element.id}-placeholder`}>
                        Placeholder
                      </Label>
                      <Input
                        id={`${element.id}-placeholder`}
                        value={element.placeholder}
                        onChange={handlePlaceholderChange}
                      />

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${element.id}-required`}
                          checked={element.required}
                          onCheckedChange={handleRequiredChange}
                        />
                        <Label htmlFor={`${element.id}-required`}>
                          Required
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-red-400">Options</Label>
                        {element.options.map((option: any, index: number) => (
                          <div key={option.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${option.id}-label`}>
                                Option {index + 1}
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleDeleteOption(option.id)}
                              >
                                <Trash className="h-2 w-2" />
                              </Button>
                            </div>
                            <Input
                              id={`${option.id}-label`}
                              value={option.label}
                              onChange={(e) =>
                                handleOptionLabelChange(option.id, e)
                              }
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddOption}
                        >
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                  {element.type === "dropdown" && (
                    <div className="space-y-2">
                      <Label htmlFor={`${element.id}-placeholder`}>
                        Placeholder
                      </Label>

                      <Input
                        id={`${element.id}-placeholder`}
                        value={element.placeholder}
                        onChange={handlePlaceholderChange}
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${element.id}-required`}
                          checked={element.required}
                          onCheckedChange={handleRequiredChange}
                        />
                        <Label htmlFor={`${element.id}-required`}>
                          Required
                        </Label>
                      </div>
                      {element.options.map((option: any, index: number) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${option.id}-label`}>
                              Option {index + 1}
                            </Label>{" "}
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleDeleteOption(option.id)}
                            >
                              <Trash className="h-2 w-2" />
                            </Button>
                          </div>

                          <Input
                            id={`${option.id}-label`}
                            value={option.label}
                            onChange={(e) =>
                              handleOptionLabelChange(option.id, e)
                            }
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddOption}
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                  {element.type === "checkbox" && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-full">
                          <Label
                            className="block pb-4"
                            htmlFor={`${element.id}-required`}
                          >
                            Required
                          </Label>
                          <Switch
                            id={`${element.id}-required`}
                            checked={element.required}
                            onCheckedChange={handleRequiredChange}
                          />
                        </div>
                      </div>
                      {element.options.map((option: any, index: number) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${option.id}-label`}>
                              Option {index + 1}
                            </Label>{" "}
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleDeleteOption(option.id)}
                            >
                              <Trash className="h-2 w-2" />
                            </Button>
                          </div>
                          <Input
                            id={`${option.id}-label`}
                            value={option.label}
                            onChange={(e) =>
                              handleOptionLabelChange(option.id, e)
                            }
                          />
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddOption}
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                  {element.type === "radio" && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-full">
                          <Label
                            className="block pb-4"
                            htmlFor={`${element.id}-required`}
                          >
                            Required
                          </Label>
                          <Switch
                            id={`${element.id}-required`}
                            checked={element.required}
                            onCheckedChange={handleRequiredChange}
                          />
                        </div>
                      </div>
                      {element.options.map((option: any, index: number) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${option.id}-label`}>
                              Option {index + 1}
                            </Label>{" "}
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleDeleteOption(option.id)}
                            >
                              <Trash className="h-2 w-2" />
                            </Button>
                          </div>
                          <Input
                            id={`${option.id}-label`}
                            value={option.label}
                            onChange={(e) =>
                              handleOptionLabelChange(option.id, e)
                            }
                          />
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddOption}
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                  {element.type !== "dropdown" &&
                    element.type !== "checkbox" &&
                    element.type !== "radio" &&
                    element.type !== "file" &&
                    element.type !== "divider" &&
                    element.type !== "name" &&
                    element.type !== "select" && (
                      <div className="space-y-2">
                        <Label htmlFor={`${element.id}-placeholder`}>
                          Placeholder
                        </Label>
                        <Input
                          id={`${element.id}-placeholder`}
                          value={element.placeholder}
                          onChange={handlePlaceholderChange}
                        />
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`${element.id}-required`}
                            checked={element.required}
                            onCheckedChange={handleRequiredChange}
                          />
                          <Label htmlFor={`${element.id}-required`}>
                            Required
                          </Label>
                        </div>
                      </div>
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Card>
  );
}
