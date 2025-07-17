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
import { Badge } from "@/components/ui/badge";
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
  Eye,
  EyeOff,
  Plus,
  AlertCircle,
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  // Get element type info for styling
  const getElementTypeInfo = (type: string) => {
    const typeMap = {
      name: { color: "bg-purple-500", label: "Department" },
      text: { color: "bg-blue-500", label: "Text" },
      textarea: { color: "bg-green-500", label: "Textarea" },
      dropdown: { color: "bg-orange-500", label: "Dropdown" },
      checkbox: { color: "bg-indigo-500", label: "Checkbox" },
      radio: { color: "bg-pink-500", label: "Radio" },
      date: { color: "bg-teal-500", label: "Date" },
      file: { color: "bg-yellow-500", label: "File" },
      divider: { color: "bg-gray-500", label: "Divider" },
      select: { color: "bg-violet-500", label: "Select" },
    };
    return typeMap[type as keyof typeof typeMap] || { color: "bg-gray-500", label: "Unknown" };
  };

  const typeInfo = getElementTypeInfo(element.type);

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
        }, [user?.department, url]);

        // Update options when users change
        useEffect(() => {
          if (users.length > 0) {
            const userOptions = users.map((user : any) => ({
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
                className="w-full justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
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
                    {options.map((option: any) => (
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
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={element.placeholder || "Enter text..."}
            disabled
            rows={3}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm resize-none"
          />
        );
      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
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
          <div className="space-y-3">
            {element.options?.map((option: any) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-2 rounded-lg bg-white/30 dark:bg-gray-800/30"
              >
                <input
                  type="checkbox"
                  id={option.id}
                  disabled
                  className="rounded"
                />
                <label htmlFor={option.id} className="text-sm font-medium">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-3">
            {element.options?.map((option: any) => (
              <div
                key={option.id}
                className="flex items-center space-x-3 p-2 rounded-lg bg-white/30 dark:bg-gray-800/30"
              >
                <input type="radio" name={element.id} id={option.id} disabled />
                <label htmlFor={option.id} className="text-sm font-medium">
                  {option.label}
                </label>
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
                  "w-full justify-start text-left font-normal bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
                  !element.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {element.date ? (
                  format(element.date, "PPP")
                ) : (
                  <span>{element.placeholder || "Pick a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full! p-0">
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
        return (
          <Input
            type="file"
            disabled
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
          />
        );
      case "divider":
        return (
          <div className="py-4">
            <div className="border-t-2 border-gradient-to-r from-gray-200 via-gray-400 to-gray-200 dark:from-gray-700 dark:via-gray-500 dark:to-gray-700" />
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
            ? selectedValues.filter((item : any) => item !== value)
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
                className="w-full justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "relative group transition-all duration-300 border-2 hover:border-primary/20 shadow-lg hover:shadow-xl bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900",
          isDragging && "shadow-2xl border-primary/40 rotate-2",
          showSettings && "ring-2 ring-primary/20"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            "absolute left-3 top-4 cursor-grab active:cursor-grabbing transition-all duration-200 z-10",
            isHovered ? "opacity-100" : "opacity-40"
          )}
        >
          <div className="p-1 rounded bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <CardHeader className="pl-12 pr-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", typeInfo.color)} />
              <Label className="font-medium text-base">{element.label}</Label>
              {element.required && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Required
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {typeInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-4">
          {renderElementPreview()}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50/50 dark:bg-gray-800/50 px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "transition-all duration-200",
                showSettings
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {showSettings ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <div className="p-6">
                <Accordion type="single" collapsible defaultValue="settings">
                  <AccordionItem value="settings" className="border-none">
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="font-medium">Element Settings</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-6 pt-2">
                        <div className="space-y-3">
                          <Label
                            htmlFor={`${element.id}-label`}
                            className="text-sm font-medium"
                          >
                            Label
                          </Label>
                          <Input
                            id={`${element.id}-label`}
                            value={element.label}
                            onChange={handleLabelChange}
                            className="bg-white dark:bg-gray-800"
                          />
                        </div>

                        {element.type === "name" && (
                          <div className="space-y-2"></div>
                        )}

                        {element.type === "select" && (
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <Label
                                htmlFor={`${element.id}-placeholder`}
                                className="text-sm font-medium"
                              >
                                Placeholder
                              </Label>
                              <Input
                                id={`${element.id}-placeholder`}
                                value={element.placeholder}
                                onChange={handlePlaceholderChange}
                                className="bg-white dark:bg-gray-800"
                              />
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                              <Switch
                                id={`${element.id}-required`}
                                checked={element.required}
                                onCheckedChange={handleRequiredChange}
                              />
                              <Label
                                htmlFor={`${element.id}-required`}
                                className="text-sm font-medium"
                              >
                                Required field
                              </Label>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-primary">
                                  Options
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddOption}
                                  className="h-8"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                              {element.options?.map(
                                (option: any, index: number) => (
                                  <div
                                    key={option.id}
                                    className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border"
                                  >
                                    <div className="flex items-center justify-between">
                                      <Label
                                        htmlFor={`${option.id}-label`}
                                        className="text-sm font-medium"
                                      >
                                        Option {index + 1}
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteOption(option.id)
                                        }
                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Input
                                      id={`${option.id}-label`}
                                      value={option.label}
                                      onChange={(e) =>
                                        handleOptionLabelChange(option.id, e)
                                      }
                                      className="bg-white dark:bg-gray-800"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Similar enhanced styling for other element types... */}
                        {element.type === "dropdown" && (
                          <div className="space-y-4">
                            <div className="space-y-3">
                              <Label
                                htmlFor={`${element.id}-placeholder`}
                                className="text-sm font-medium"
                              >
                                Placeholder
                              </Label>
                              <Input
                                id={`${element.id}-placeholder`}
                                value={element.placeholder}
                                onChange={handlePlaceholderChange}
                                className="bg-white dark:bg-gray-800"
                              />
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                              <Switch
                                id={`${element.id}-required`}
                                checked={element.required}
                                onCheckedChange={handleRequiredChange}
                              />
                              <Label
                                htmlFor={`${element.id}-required`}
                                className="text-sm font-medium"
                              >
                                Required field
                              </Label>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-primary">
                                  Options
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddOption}
                                  className="h-8"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                              {element.options?.map(
                                (option: any, index: number) => (
                                  <div
                                    key={option.id}
                                    className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border"
                                  >
                                    <div className="flex items-center justify-between">
                                      <Label
                                        htmlFor={`${option.id}-label`}
                                        className="text-sm font-medium"
                                      >
                                        Option {index + 1}
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteOption(option.id)
                                        }
                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Input
                                      id={`${option.id}-label`}
                                      value={option.label}
                                      onChange={(e) =>
                                        handleOptionLabelChange(option.id, e)
                                      }
                                      className="bg-white dark:bg-gray-800"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {(element.type === "checkbox" ||
                          element.type === "radio") && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                              <Switch
                                id={`${element.id}-required`}
                                checked={element.required}
                                onCheckedChange={handleRequiredChange}
                              />
                              <Label
                                htmlFor={`${element.id}-required`}
                                className="text-sm font-medium"
                              >
                                Required field
                              </Label>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-primary">
                                  Options
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddOption}
                                  className="h-8"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Option
                                </Button>
                              </div>
                              {element.options?.map(
                                (option: any, index: number) => (
                                  <div
                                    key={option.id}
                                    className="space-y-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border"
                                  >
                                    <div className="flex items-center justify-between">
                                      <Label
                                        htmlFor={`${option.id}-label`}
                                        className="text-sm font-medium"
                                      >
                                        Option {index + 1}
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteOption(option.id)
                                        }
                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                                      >
                                        <Trash className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Input
                                      id={`${option.id}-label`}
                                      value={option.label}
                                      onChange={(e) =>
                                        handleOptionLabelChange(option.id, e)
                                      }
                                      className="bg-white dark:bg-gray-800"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {element.type !== "dropdown" &&
                          element.type !== "checkbox" &&
                          element.type !== "radio" &&
                          element.type !== "file" &&
                          element.type !== "divider" &&
                          element.type !== "name" &&
                          element.type !== "select" && (
                            <div className="space-y-4">
                              <div className="space-y-3">
                                <Label
                                  htmlFor={`${element.id}-placeholder`}
                                  className="text-sm font-medium"
                                >
                                  Placeholder
                                </Label>
                                <Input
                                  id={`${element.id}-placeholder`}
                                  value={element.placeholder}
                                  onChange={handlePlaceholderChange}
                                  className="bg-white dark:bg-gray-800"
                                />
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                <Switch
                                  id={`${element.id}-required`}
                                  checked={element.required}
                                  onCheckedChange={handleRequiredChange}
                                />
                                <Label
                                  htmlFor={`${element.id}-required`}
                                  className="text-sm font-medium"
                                >
                                  Required field
                                </Label>
                              </div>
                            </div>
                          )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
