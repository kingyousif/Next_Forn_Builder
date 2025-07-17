"use client";

import React, { useState, useCallback } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import EditAttendanceModal from "@/components/attendance/EditAttendanceModal";
import { Edit } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  Users,
  Filter,
  Check,
  ChevronDown,
  X,
  Printer,
  FileSpreadsheet,
  Receipt,
  Plus,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  TrendingUp,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Components and Hooks
import {
  LoadingSpinner,
  ErrorDisplay,
  AttendanceStatusIcon,
  AttendanceStatusBadge,
  ScheduleTypeBadge,
  ManualAttendanceModal,
} from "@/components/attendance/AttendanceComponents";
import { useAttendanceData } from "@/hooks/useAttendanceData";
import {
  exportToExcel,
  printFilteredData,
  printInvoice,
} from "@/utils/attendanceUtils";
import { useAuth } from "@/components/context/page";

const url = process.env.NEXT_PUBLIC_API_URL;

export default function AttendanceTracking() {
  // State management
  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    fromDate: "",
    toDate: "",
    attendance: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Add refresh loading state
  const { token, role, user } = useAuth();

  // Custom hook for data management
  const {
    rawData,
    isLoading,
    error,
    processedAttendanceData,
    filteredData,
    paginatedData,
    totalPages,
    totalHours,
    filteredEmployees,
    paginationItems,
    activeEmployeeName,
    fetchAllData,
  } = useAttendanceData({
    filters,
    currentPage,
    recordsPerPage,
    searchInput,
  });

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Sync attendance data from ZKTeco device
      const syncResponse = await axios.post(
        "http://172.18.1.31:5000/api/zkteco/sync-attendance"
      );

      // Refresh the local data after sync
      await fetchAllData();

      toast({
        title: "Success",
        description: "Attendance data synced and refreshed successfully",
      });
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast({
        title: "Error",
        description: "Failed to sync attendance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manual attendance submission
  const handleManualAttendanceSubmit = async (attendanceData) => {
    try {
      const dataArray = [attendanceData];
      await axios.post(`${url}attendance/create`, dataArray);

      // Refresh data after successful submission
      await fetchAllData();

      toast({
        title: "Success",
        description: "Manual attendance record created successfully",
      });
    } catch (error) {
      console.error("Error creating manual attendance:", error);
      toast({
        title: "Error",
        description: "Failed to create attendance record",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Optimized filter handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      employee: "",
      status: "",
      fromDate: "",
      toDate: "",
      attendance: "",
    });
    setCurrentPage(1);
    setSearchInput("");
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const handleEditAttendance = (record) => {
    setEditRecord(record);
    setIsEditModalOpen(true);
  };

  // Add this function to handle successful edit
  const handleEditSuccess = async () => {
    await fetchAllData(); // Refresh the data
    setEditRecord(null);
    setIsEditModalOpen(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={fetchAllData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      <div className="container mx-auto p-6 space-y-8">
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl transition-all duration-500 hover:shadow-3xl">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-500 dark:via-purple-500 dark:to-indigo-500 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                  Employee Attendance Tracking
                </CardTitle>
                <CardDescription className="mt-3 text-blue-100 text-lg">
                  Monitor employee check-ins, check-outs, and work schedules
                  with advanced analytics
                </CardDescription>
              </div>
              {filters.employee && filters.employee !== "All" && (
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                  👤 {activeEmployeeName}
                </Badge>
              )}
            </div>

            {/* Enhanced Total Hours Display with Late, Early, and Extra Time */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {totalHours.hours}h {totalHours.minutes}m
                </div>
                <div className="text-sm opacity-90">Total Work Hours</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {totalHours.recordCount}
                </div>
                <div className="text-sm opacity-90">Check-in Records</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{filteredData.length}</div>
                <div className="text-sm opacity-90">Total Records</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">
                  {Math.round(
                    totalHours.totalMinutes / totalHours.recordCount
                  ) || 0}
                  m
                </div>
                <div className="text-sm opacity-90">Avg per Check-in</div>
              </div>
              {/* New Late Time Statistics */}
              <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-red-300/30">
                <div className="text-2xl font-bold text-red-100">
                  {totalHours.lateTime?.hours || 0}h{" "}
                  {totalHours.lateTime?.minutes || 0}m
                </div>
                <div className="text-sm opacity-90">Total Late Time</div>
                <div className="text-xs opacity-75">
                  ({totalHours.lateTime?.count || 0} instances)
                </div>
              </div>
              {/* New Early Time Statistics */}
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-yellow-300/30">
                <div className="text-2xl font-bold text-yellow-100">
                  {totalHours.earlyTime?.hours || 0}h{" "}
                  {totalHours.earlyTime?.minutes || 0}m
                </div>
                <div className="text-sm opacity-90">Total Early Time</div>
                <div className="text-xs opacity-75">
                  ({totalHours.earlyTime?.count || 0} instances)
                </div>
              </div>
              {/* New Extra Time Statistics */}
              <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 text-center border border-green-300/30">
                <div className="text-2xl font-bold text-green-100">
                  {totalHours.extraTime?.hours || 0}h{" "}
                  {totalHours.extraTime?.minutes || 0}m
                </div>
                <div className="text-sm opacity-90">Total Extra Time</div>
                <div className="text-xs opacity-75">
                  ({totalHours.extraTime?.count || 0} instances)
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Action Buttons */}
            {((role === "admin" && user.department === "HR") ||
              role === "super admin") && (
              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  onClick={() =>
                    printFilteredData(filteredData, totalHours, filters)
                  }
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Report
                </Button>

                <Button
                  onClick={() =>
                    exportToExcel(filteredData, "attendance-report")
                  }
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>

                <Button
                  onClick={() =>
                    printInvoice(
                      activeEmployeeName,
                      filteredData[0]?.profile?.name || "Unassigned",
                      filters.fromDate,
                      filters.toDate,
                      totalHours
                    )
                  }
                  disabled={!filters.employee || filters.employee === "All"}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>

                <Button
                  onClick={() => setIsManualEntryOpen(true)}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Manual Entry
                </Button>

                {/* Add Manual Refresh Button */}
                <Button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync & Refresh
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Enhanced Filter Section with Modern Design */}
            <div className="mb-8 p-8 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl border border-gray-200 dark:border-slate-600 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl shadow-lg">
                  <Filter className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Label className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Filter Attendance Records
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                {/* Employee Filter */}
                <div className="space-y-4">
                  <Label
                    htmlFor="employee-filter"
                    className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide"
                  >
                    Employee
                  </Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-left font-medium h-12 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl"
                      >
                        <span className="truncate text-gray-700 dark:text-gray-200">
                          {activeEmployeeName}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-full p-0 border-2 border-gray-200 dark:border-slate-600 shadow-2xl rounded-xl"
                      align="start"
                    >
                      <Command className="bg-white dark:bg-slate-800">
                        <CommandInput
                          placeholder="Search employees..."
                          value={searchInput}
                          onValueChange={setSearchInput}
                          className="border-0 focus:ring-0 text-gray-700 dark:text-gray-200"
                        />
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              handleFilterChange("employee", "");
                              setOpen(false);
                            }}
                            className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !filters.employee ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              All Employees
                            </span>
                          </CommandItem>
                          {filteredEmployees.map((employee) => (
                            <CommandItem
                              key={employee._id}
                              value={employee.name}
                              onSelect={() => {
                                handleFilterChange("employee", employee._id);
                                setOpen(false);
                              }}
                              className="cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  filters.employee === employee._id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {employee.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-200">
                                    {employee.name}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {employee.userId}
                                  </p>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                          {filteredEmployees.length === 0 && (
                            <CommandEmpty className="py-6 text-center text-gray-500 dark:text-gray-400">
                              No employees found.
                            </CommandEmpty>
                          )}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Status Filter */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    Status
                  </Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-2xl rounded-xl">
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Check-in">Check-in</SelectItem>
                      <SelectItem value="Check-out">Check-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date Filter */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    From Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl",
                          !filters.fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.fromDate ? (
                          format(new Date(filters.fromDate), "yyyy-MM-dd")
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
                        selected={
                          filters.fromDate
                            ? new Date(filters.fromDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          handleFilterChange(
                            "fromDate",
                            date ? format(date, "yyyy-MM-dd") : ""
                          );
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

                {/* To Date Filter */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    To Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "h-12 w-full justify-start text-left font-normal border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl",
                          !filters.toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.toDate ? (
                          format(new Date(filters.toDate), "yyyy-MM-dd")
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
                        selected={
                          filters.toDate ? new Date(filters.toDate) : undefined
                        }
                        onSelect={(date) => {
                          handleFilterChange(
                            "toDate",
                            date ? format(date, "yyyy-MM-dd") : ""
                          );
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

                {/* Performance Status Filter */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                    Performance
                  </Label>
                  <Select
                    value={filters.attendance}
                    onValueChange={(value) =>
                      handleFilterChange("attendance", value)
                    }
                  >
                    <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl rounded-xl">
                      <SelectValue placeholder="All Performance" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 shadow-2xl rounded-xl">
                      <SelectItem value="All">All Performance</SelectItem>
                      <SelectItem value="on-time">On Time</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="early">Early</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reset Filters Button */}
              <div className="mt-8 flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="border-2 border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl font-semibold"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Enhanced Table Section with Duration and Schedule Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-600 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 border-b-2 border-gray-200 dark:border-slate-500">
                      <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-left">
                        Employee
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-center">
                        Time & Date
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-center">
                        Attendance
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-center">
                        Schedule Profile
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-center">
                        Work Duration
                      </TableHead>
                      <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-center">
                        Status
                      </TableHead>
                      {role === "super admin" && (
                        <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-6 px-6 text-center">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-16 text-gray-500 dark:text-gray-400"
                        >
                          <div className="flex flex-col items-center space-y-4">
                            <Users className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                            <div className="space-y-2">
                              <p className="text-xl font-semibold">
                                No attendance records found
                              </p>
                              <p className="text-sm">
                                Try adjusting your filters or refresh the data
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((record, index) => (
                        <TableRow
                          key={`${record._id}-${index}`}
                          className="hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300 border-b border-gray-100 dark:border-slate-600"
                        >
                          <TableCell className="py-6 px-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {record.employee?.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {record.employee?.name ||
                                    record.user_name ||
                                    "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {record.employee?.userId || "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-6 text-center">
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {format(new Date(record.timestamp), "HH:mm:ss")}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {format(
                                  new Date(record.timestamp),
                                  "yyyy-MM-dd"
                                )}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-6 text-center">
                            <div className="flex items-center justify-center space-x-3">
                              <AttendanceStatusIcon
                                status={record.attendanceStatus}
                              />
                              <Badge
                                variant={
                                  record.status === "Check-in"
                                    ? "default"
                                    : "secondary"
                                }
                                className={`font-semibold px-3 py-1 rounded-full shadow-lg ${
                                  record.status === "Check-in"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                                }`}
                              >
                                {record.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-6 text-center">
                            {record.profile ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {record.profile.name}
                                  </p>
                                  <ScheduleTypeBadge
                                    scheduleType={record.profile.scheduleType}
                                  />
                                </div>
                                {record.effectiveSchedule &&
                                  record.effectiveSchedule.type !==
                                    "on-call" && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {record.effectiveSchedule.startTime} -{" "}
                                      {record.effectiveSchedule.endTime}
                                    </p>
                                  )}
                                {record.profile.scheduleType === "flexible" && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Flexible Schedule
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
                              >
                                Unassigned
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-6 px-6 text-center">
                            {record.workDuration ? (
                              <div className="space-y-1">
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {record.workDuration.hours}h{" "}
                                  {record.workDuration.minutes}m
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Total: {record.workDuration.totalMinutes} min
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <Badge
                                  variant="outline"
                                  className="text-gray-500 dark:text-gray-400"
                                >
                                  {record.status === "Check-in"
                                    ? "In Progress"
                                    : "N/A"}
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-6 px-6 text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center">
                                    <AttendanceStatusBadge
                                      status={record.attendanceStatus}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-0 shadow-2xl rounded-xl p-4">
                                  <div className="space-y-2">
                                    <p className="font-semibold">
                                      {record.statusMessage}
                                    </p>
                                    <p className="text-sm opacity-90">
                                      Status: {record.attendanceStatus}
                                    </p>
                                    {record.profile && (
                                      <>
                                        <p className="text-sm opacity-90">
                                          Profile: {record.profile.name}
                                        </p>
                                        <p className="text-sm opacity-90">
                                          Type: {record.profile.scheduleType}
                                        </p>
                                        {record.effectiveSchedule &&
                                          record.effectiveSchedule.type !==
                                            "on-call" && (
                                            <p className="text-sm opacity-90">
                                              Schedule:{" "}
                                              {
                                                record.effectiveSchedule
                                                  .startTime
                                              }{" "}
                                              -{" "}
                                              {record.effectiveSchedule.endTime}
                                            </p>
                                          )}
                                      </>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          {role === "super admin" && (
                            <TableCell className="py-6 px-6 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAttendance(record)}
                                className="border-2 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg font-semibold"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-gray-200 dark:border-slate-600 shadow-xl">
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Records per page:
                  </Label>
                  <Select
                    value={String(recordsPerPage)}
                    onValueChange={(value) => {
                      setRecordsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-10 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-lg">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="border-2 border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-2 border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {paginationItems.map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`border-2 rounded-lg font-semibold ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                          : "border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-2 border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="border-2 border-gray-200 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{" "}
                  {Math.min(currentPage * recordsPerPage, filteredData.length)}{" "}
                  of {filteredData.length} results
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-b-xl border-t border-gray-200 dark:border-slate-600">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
              <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">
                    Total Records: {filteredData.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last Updated: {format(new Date(), "yyyy-MM-dd, HH:mm:ss")}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllData}
                className="border-2 border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 shadow-lg hover:shadow-xl rounded-lg font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Manual Attendance Modal */}
        <ManualAttendanceModal
          isOpen={isManualEntryOpen}
          onClose={() => setIsManualEntryOpen(false)}
          onSubmit={handleManualAttendanceSubmit}
          employees={rawData.employees}
        />
        <EditAttendanceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditRecord(null);
          }}
          attendanceRecord={editRecord}
          onSuccess={handleEditSuccess}
          token={token}
        />
      </div>
    </div>
  );
}
