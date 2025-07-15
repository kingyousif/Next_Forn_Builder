"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/context/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Clock,
  User,
  BookOpen,
  Send,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

const MySeminarPage = () => {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const url = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    seminarTitle: "",
    description: "",
    date: null,
    fromTime: "",
    toTime: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.seminarTitle.trim()) {
      newErrors.seminarTitle = "Seminar title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.fromTime) {
      newErrors.fromTime = "Start time is required";
    }

    if (!formData.toTime) {
      newErrors.toTime = "End time is required";
    }

    if (formData.fromTime && formData.toTime) {
      const fromTimeMinutes = timeToMinutes(formData.fromTime);
      const toTimeMinutes = timeToMinutes(formData.toTime);

      if (fromTimeMinutes >= toTimeMinutes) {
        newErrors.toTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateDuration = () => {
    if (!formData.fromTime || !formData.toTime) return "";

    const fromMinutes = timeToMinutes(formData.fromTime);
    const toMinutes = timeToMinutes(formData.toTime);

    if (fromMinutes >= toMinutes) return "";

    const durationMinutes = toMinutes - fromMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minutes`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const seminarData = {
        username: user?.name,
        fullName: user?.fullName,
        seminarTitle: formData.seminarTitle.trim(),
        description: formData.description.trim(),
        department: user?.department || "super admin",
        date: format(formData.date, "yyyy-MM-dd"),
        fromTime: formData.fromTime,
        toTime: formData.toTime,
        duration: calculateDuration(),
        createdAt: new Date().toISOString(),
      };

      // Replace with your actual API endpoint
      const response = await axios.post(url + "seminar/create", seminarData);
  
      if (response.status === 200 || response.status === 201) {
        toast.success("Seminar created successfully!");

        // Reset form
        setFormData({
          seminarTitle: "",
          description: "",
          date: null,
          fromTime: "",
          toTime: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error creating seminar:", error);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create seminar. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Seminar
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule and organize your seminar with detailed information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Information Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Organizer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Username
              </Label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name || "Not available"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Full Name
              </Label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.fullName || "Not available"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seminar Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Seminar Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seminar Title */}
              <div className="space-y-2">
                <Label htmlFor="seminarTitle">
                  Seminar Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="seminarTitle"
                  placeholder="Enter seminar title"
                  value={formData.seminarTitle}
                  onChange={(e) =>
                    handleInputChange("seminarTitle", e.target.value)
                  }
                  className={cn(
                    "transition-colors",
                    errors.seminarTitle && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.seminarTitle && (
                  <p className="text-sm text-red-500">{errors.seminarTitle}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your seminar content, objectives, and target audience"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className={cn(
                    "transition-colors resize-none",
                    errors.description && "border-red-500 focus:border-red-500"
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>
                  Seminar Date <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                        errors.date && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange("date", date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromTime">
                    Start Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fromTime"
                      type="time"
                      value={formData.fromTime}
                      onChange={(e) =>
                        handleInputChange("fromTime", e.target.value)
                      }
                      className={cn(
                        "pl-10 transition-colors",
                        errors.fromTime && "border-red-500 focus:border-red-500"
                      )}
                    />
                  </div>
                  {errors.fromTime && (
                    <p className="text-sm text-red-500">{errors.fromTime}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toTime">
                    End Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="toTime"
                      type="time"
                      value={formData.toTime}
                      onChange={(e) =>
                        handleInputChange("toTime", e.target.value)
                      }
                      className={cn(
                        "pl-10 transition-colors",
                        errors.toTime && "border-red-500 focus:border-red-500"
                      )}
                    />
                  </div>
                  {errors.toTime && (
                    <p className="text-sm text-red-500">{errors.toTime}</p>
                  )}
                </div>
              </div>

              {/* Duration Display */}
              {calculateDuration() && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Duration: {calculateDuration()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Seminar...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Seminar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MySeminarPage;
