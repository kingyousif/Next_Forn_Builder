import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarDays,
  Timer,
  UserPlus,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

// Memoized Badge Components for Performance
export const AttendanceStatusBadge = React.memo(({ status }) => {
  const configs = {
    "on-time": {
      className:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105",
      text: "On Time",
    },
    "extra-time": {
      className:
        "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 text-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105",
      text: "Extra Time",
    },
    late: {
      className:
        "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500 text-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105",
      text: "Late",
    },
    early: {
      className:
        "bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 text-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105",
      text: "Early",
    },
    unassigned: {
      className:
        "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
      text: "Unassigned",
    },
  };
  const config = configs[status] || configs.unassigned;
  return (
    <Badge
      className={`${config.className} text-xs font-semibold px-3 py-1.5 rounded-full`}
    >
      {config.text}
    </Badge>
  );
});

export const ScheduleTypeBadge = React.memo(({ scheduleType }) => {
  const configs = {
    flexible: {
      className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      text: "Flexible",
      icon: <CalendarDays className="h-3 w-3" />,
    },
    standard: {
      className: "bg-gradient-to-r from-green-500 to-green-600 text-white",
      text: "Standard",
      icon: <Clock className="h-3 w-3" />,
    },
    "on-call": {
      className: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      text: "On-Call",
      icon: <Timer className="h-3 w-3" />,
    },
  };
  const config = configs[scheduleType] || configs.standard;
  return (
    <Badge
      className={`${config.className} text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1`}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
});

export const AttendanceStatusIcon = React.memo(({ status }) => {
  const icons = {
    "on-time": (
      <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 drop-shadow-sm" />
    ),
    late: (
      <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 drop-shadow-sm" />
    ),
    early: (
      <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 drop-shadow-sm" />
    ),
    unassigned: (
      <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 drop-shadow-sm" />
    ),
  };
  return icons[status] || icons.unassigned;
});

export const LoadingSpinner = React.memo(() => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-600 dark:border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
        Loading attendance data...
      </p>
    </div>
  </div>
));

export const ErrorDisplay = React.memo(({ error, onRetry }) => (
  <div className="flex justify-center items-center h-64">
    <div className="text-center flex flex-col items-center bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl border border-red-200 dark:border-red-800 backdrop-blur-sm">
      <AlertCircle size={40} className="mb-4 text-red-500 dark:text-red-400" />
      <p className="mb-6 text-red-700 dark:text-red-300 font-medium text-lg">
        {error}
      </p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>
  </div>
));

// Optimized Manual Attendance Modal
export const ManualAttendanceModal = React.memo(
  ({ isOpen, onClose, onSubmit, employees }) => {
    const [selectedEmployee, setSelectedEmployee] = React.useState("");
    const [selectedStatus, setSelectedStatus] = React.useState("");
    const [selectedDate, setSelectedDate] = React.useState(
      format(new Date(), "yyyy-MM-dd")
    );
    const [selectedTime, setSelectedTime] = React.useState(
      format(new Date(), "HH:mm")
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = React.useCallback(
      async (e) => {
        e.preventDefault();

        if (
          !selectedEmployee ||
          !selectedStatus ||
          !selectedDate ||
          !selectedTime
        ) {
          toast({
            title: "Error",
            description: "Please fill in all fields",
            variant: "destructive",
          });
          return;
        }

        setIsSubmitting(true);

        try {
          const timestamp = new Date(`${selectedDate}T${selectedTime}:00`);

          const attendanceData = {
            user_name: selectedEmployee,
            timestamp: timestamp.toISOString(),
            status: selectedStatus,
          };

          await onSubmit(attendanceData);

          // Reset form
          setSelectedEmployee("");
          setSelectedStatus("");
          setSelectedDate(format(new Date(), "yyyy-MM-dd"));
          setSelectedTime(format(new Date(), "HH:mm"));

          onClose();

          toast({
            title: "Success",
            description: "Attendance record created successfully",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to create attendance record",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      },
      [
        selectedEmployee,
        selectedStatus,
        selectedDate,
        selectedTime,
        onSubmit,
        onClose,
      ]
    );

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Manual Attendance Entry
            </DialogTitle>
            <DialogDescription>
              Create a new attendance record for an employee who forgot to check
              in/out.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee.name}>
                      {employee.name} (ID: {employee.userId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Check-in">Check-in</SelectItem>
                  <SelectItem value="Check-out">Check-out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Record
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);
