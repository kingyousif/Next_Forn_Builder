"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Save, X, Edit3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { cn } from "@/lib/utils";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const url = process.env.NEXT_PUBLIC_API_URL;

export default function EditAttendanceModal({
  isOpen,
  onClose,
  attendanceRecord,
  onSuccess,
  token,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    date: "",
    time: "",
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Initialize form data when modal opens or record changes
  useEffect(() => {
    if (attendanceRecord && isOpen) {
      const timestamp = new Date(attendanceRecord.timestamp);
      setFormData({
        status: attendanceRecord.status || "",
        date: format(timestamp, "yyyy-MM-dd"),
        time: format(timestamp, "HH:mm"),
      });
    }
  }, [attendanceRecord, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attendanceRecord?.uid) {
      toast({
        title: "Error",
        description: "No attendance record selected",
        variant: "destructive",
      });
      return;
    }

    console.log("🚀 ~ handleSubmit ~ attendanceRecord:", attendanceRecord);
    setIsLoading(true);
    try {
      // Combine date and time into a proper timestamp
      const baseDateTime = new Date(`${formData.date}T${formData.time}:00`);
      const combinedDateTime = new Date(
        baseDateTime.getTime() + 3 * 60 * 60 * 1000
      );

      const response = await axios.put(
        `${url}attendance/edit/${attendanceRecord.uid}`,
        {
          user_name: attendanceRecord.user_name,
          status: formData.status,
          timestamp: combinedDateTime.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update attendance record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!attendanceRecord) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Edit Attendance Record
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
                Modify the attendance status and timestamp for this record
              </DialogDescription>
            </div>
          </div>

          {/* Employee Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-xl border border-blue-200 dark:border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {attendanceRecord.employee?.name?.charAt(0)?.toUpperCase() ||
                  attendanceRecord.user_name?.charAt(0)?.toUpperCase() ||
                  "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {attendanceRecord.employee?.name ||
                    attendanceRecord.user_name ||
                    "Unknown Employee"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID:{" "}
                  {attendanceRecord.employee?.userId ||
                    attendanceRecord.uid ||
                    "N/A"}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status Display */}
          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-600">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
              Current Record
            </Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    attendanceRecord.status === "Check-in"
                      ? "default"
                      : "secondary"
                  }
                  className={`font-semibold ${
                    attendanceRecord.status === "Check-in"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                  }`}
                >
                  {attendanceRecord.status}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {format(
                    new Date(attendanceRecord.timestamp),
                    "yyyy-MM-dd 'at' HH:mm:ss"
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Status Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="status"
              className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
            >
              New Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
              required
            >
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl">
                <SelectValue placeholder="Select attendance status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-2xl rounded-xl">
                <SelectItem
                  value="Check-in"
                  className="hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Check-in
                  </div>
                </SelectItem>
                <SelectItem
                  value="Check-out"
                  className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Check-out
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
              Date
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-12 w-full justify-start text-left font-normal border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4" />
                  {formData.date ? (
                    format(new Date(formData.date), "yyyy-MM-dd")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-2xl rounded-xl"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFormData((prev) => ({
                        ...prev,
                        date: format(date, "yyyy-MM-dd"),
                      }));
                      setIsCalendarOpen(false);
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label
              htmlFor="time"
              className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
            >
              Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, time: e.target.value }))
                }
                className="h-12 pl-10 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300 rounded-xl font-semibold"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.status ||
                !formData.date ||
                !formData.time
              }
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-semibold min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
