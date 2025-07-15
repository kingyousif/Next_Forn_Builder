"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface FormElementToolboxProps {
  onAddElement: (elementType: string) => void;
}

export function FormElementToolbox({ onAddElement }: FormElementToolboxProps) {
  const elements = [
    { 
      type: "name", 
      label: "Department Name", 
      icon: Grip, 
      description: "Dynamic user selection",
      category: "Special",
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    { 
      type: "text", 
      label: "Text Input", 
      icon: Type, 
      description: "Single line text",
      category: "Basic",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    { 
      type: "textarea", 
      label: "Text Area", 
      icon: AlignLeft, 
      description: "Multi-line text",
      category: "Basic",
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    { 
      type: "dropdown", 
      label: "Dropdown", 
      icon: List, 
      description: "Select from options",
      category: "Selection",
      color: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    { 
      type: "checkbox", 
      label: "Checkbox", 
      icon: CheckSquare, 
      description: "Multiple selections",
      category: "Selection",
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    },
    { 
      type: "radio", 
      label: "Radio Button", 
      icon: Circle, 
      description: "Single selection",
      category: "Selection",
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    },
    { 
      type: "date", 
      label: "Date Picker", 
      icon: Calendar, 
      description: "Date selection",
      category: "Input",
      color: "bg-gradient-to-r from-teal-500 to-cyan-500"
    },
    { 
      type: "file", 
      label: "File Upload", 
      icon: Upload, 
      description: "File attachment",
      category: "Input",
      color: "bg-gradient-to-r from-yellow-500 to-orange-500"
    },
    { 
      type: "divider", 
      label: "Divider", 
      icon: Divide, 
      description: "Section separator",
      category: "Layout",
      color: "bg-gradient-to-r from-gray-500 to-slate-500"
    },
    { 
      type: "select", 
      label: "Multi Select", 
      icon: BoxSelect, 
      description: "Multiple choice",
      category: "Selection",
      color: "bg-gradient-to-r from-violet-500 to-purple-500"
    },
  ];

  const categories = [...new Set(elements.map(el => el.category))];

  return (
    <Card className="sticky top-4 h-fit shadow-xl border-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Form Elements
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Drag and drop elements to build your form
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {category}
              </Badge>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
            </div>
            <div className="grid gap-2">
              {elements
                .filter(element => element.category === category)
                .map((element, index) => (
                <motion.div
                  key={element.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4 group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    onClick={() => onAddElement(element.type)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg ${element.color} group-hover:scale-110 transition-transform duration-200`}>
                        <element.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{element.label}</div>
                        <div className="text-xs text-muted-foreground">{element.description}</div>
                      </div>
                      <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-primary" />
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
