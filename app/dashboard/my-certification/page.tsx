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
  Upload,
  FileImage,
  X,
  Award,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import axios from "axios";

const MyCertificationPage = () => {
  const { user, token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    certificationName: "",
    description: "",
    fromDate: null,
    toDate: null,
    duration: "",
    image: null,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      handleInputChange("image", file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    handleInputChange("image", null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      alert("Please login to submit certification");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("username", user.name);
      submitData.append("fullName", user.fullName);
      submitData.append("certificationName", formData.certificationName);
      submitData.append("description", formData.description);
      submitData.append(
        "fromDate",
        formData.fromDate ? format(formData.fromDate, "yyyy-MM-dd") : ""
      );
      submitData.append(
        "toDate",
        formData.toDate ? format(formData.toDate, "yyyy-MM-dd") : ""
      );
      submitData.append("duration", formData.duration);
      submitData.append("department", user.department || "Super Admin");

      if (selectedFile) {
        submitData.append("certificationImage", selectedFile);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/certificate/submit`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Certification submitted successfully!");
        // Reset form
        setFormData({
          certificationName: "",
          description: "",
          fromDate: null,
          toDate: null,
          duration: "",
          image: null,
        });
        removeImage();
      }
    } catch (error) {
      console.error("Error submitting certification:", error);
      alert("Failed to submit certification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Award className="h-8 w-8 text-blue-600" />
          My Certification
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Submit your professional certifications and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
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
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Department
              </Label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.department || "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Certification Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certification Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Certification Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="certificationName"
                  className="text-sm font-medium"
                >
                  Certification Name *
                </Label>
                <Input
                  id="certificationName"
                  type="text"
                  placeholder="e.g., AWS Certified Solutions Architect"
                  value={formData.certificationName}
                  onChange={(e) =>
                    handleInputChange("certificationName", e.target.value)
                  }
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the certification..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    From Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fromDate
                          ? format(formData.fromDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.fromDate}
                        onSelect={(date) => handleInputChange("fromDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    To Date *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.toDate
                          ? format(formData.toDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.toDate}
                        onSelect={(date) => handleInputChange("toDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Duration
                </Label>
                <Input
                  id="duration"
                  type="text"
                  placeholder="e.g., 6 months, 1 year, etc."
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileImage className="h-4 w-4" />
                  Certification Image
                </Label>

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload certification image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Certification preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={
                  isSubmitting ||
                  !formData.certificationName ||
                  !formData.fromDate ||
                  !formData.toDate
                }
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Submit Certification
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyCertificationPage;
