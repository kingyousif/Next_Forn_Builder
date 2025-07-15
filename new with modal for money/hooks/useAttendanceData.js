import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { subHours, format } from "date-fns";
import {
  calculateWorkDurationWithCrossDay,
  findMatchingEmployee,
  clearEmployeeCache,
  getEffectiveSchedule,
  calculateTotalHours,
} from "@/utils/attendanceUtils";
import { useAuth } from "@/components/context/page";

export const useAttendanceData = ({
  filters,
  currentPage,
  recordsPerPage,
  searchInput,
}) => {
  const [rawData, setRawData] = useState({
    timeProfiles: [],
    employees: [],
    attendance: [], // This will now be loaded per employee
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const url = process.env.NEXT_PUBLIC_API_URL || "";
  const { token, user } = useAuth();

  // Fetch initial data (employees and time profiles only)
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Get userId from either id or _id property
      const userId = user?.id ?? user?._id;

      if (userId) {
        const [profilesRes, employeesRes] = await Promise.all([
          axios.post(`${url}timeManagement/fetch`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          axios.post(
            `${url}attendanceUser/fetch`,
            {
              reqUserId: userId,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        setRawData((prev) => ({
          ...prev,
          timeProfiles: profilesRes.data || [],
          employees: employeesRes.data || [],
        }));

        clearEmployeeCache();
      } else {
        setError("Failed to load initial data. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setError("Failed to load initial data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [url, user]);

  // Fetch attendance data for specific employee
  const fetchEmployeeAttendance = useCallback(
    async (employeeId) => {
      if (!employeeId || employeeId === "All") {
        setRawData((prev) => ({ ...prev, attendance: [] }));
        setSelectedEmployeeId(null);
        return;
      }

      try {
        setIsLoadingAttendance(true);
        setError(null);

        const attendanceRes = await axios.get(
          `${url}attendance/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Adjust timezone for attendance data
        const adjustedAttendance = (attendanceRes.data || []).map((record) => ({
          ...record,
          timestamp: subHours(new Date(record.timestamp), 3).toISOString(),
        }));

        setRawData((prev) => ({
          ...prev,
          attendance: adjustedAttendance,
        }));

        setSelectedEmployeeId(employeeId);
      } catch (error) {
        console.error("Error fetching employee attendance:", error);
        setError("Failed to load attendance data. Please try again.");
        setRawData((prev) => ({ ...prev, attendance: [] }));
      } finally {
        setIsLoadingAttendance(false);
      }
    },
    [url, token]
  );

  // Watch for employee filter changes and fetch attendance data
  useEffect(() => {
    if (filters.employee !== selectedEmployeeId) {
      fetchEmployeeAttendance(filters.employee);
    }
  }, [filters.employee, selectedEmployeeId, fetchEmployeeAttendance]);

  // Employee profile mapping
  const employeeProfileMap = useMemo(() => {
    const map = new Map();
    rawData.employees.forEach((employee) => {
      // Multiple lookup strategies
      if (employee.userId) map.set(String(employee.userId), employee);
      if (employee._id) map.set(employee._id, employee);
      if (employee.name) {
        map.set(employee.name.toLowerCase(), employee);
        map.set(employee.name.toLowerCase().replace(/\s+/g, ""), employee);
      }
    });
    return map;
  }, [rawData.employees]);

  // Processed attendance data with memoization
  const processedAttendanceData = useMemo(() => {
    if (!rawData.attendance?.length || !rawData.employees?.length) return [];

    // Group attendance by employee and date for duration calculation
    const groupedByEmployeeAndDate = rawData.attendance.reduce(
      (acc, record) => {
        const employeeKey = record.user_name;
        const dateKey = format(new Date(record.timestamp), "yyyy-MM-dd");
        const key = `${employeeKey}-${dateKey}`;

        if (!acc[key]) {
          acc[key] = { checkIn: null, checkOut: null, records: [] };
        }

        acc[key].records.push(record);

        if (record.status === "Check-in") {
          if (
            !acc[key].checkIn ||
            new Date(record.timestamp) < new Date(acc[key].checkIn.timestamp)
          ) {
            acc[key].checkIn = record;
          }
        } else if (record.status === "Check-out") {
          if (
            !acc[key].checkOut ||
            new Date(record.timestamp) > new Date(acc[key].checkOut.timestamp)
          ) {
            acc[key].checkOut = record;
          }
        }

        return acc;
      },
      {}
    );

    return rawData.attendance.map((record) => {
      // Find matching employee using optimized function
      const matchedEmployee = findMatchingEmployee(
        record.user_name,
        rawData.employees
      );

      // Find matching time profile

      const matchedProfile = rawData.timeProfiles.find((profile) => {
        if (!matchedEmployee) return false;

        // Check if the employee's userId is in the profile's userId array

        return (
          profile.userId &&
          profile.userId.includes(String(matchedEmployee.userId))
        );
      });

      // Calculate work duration with cross-day logic
      let workDuration = null;
      if (record.status === "Check-in") {
        const employeeKey = record.user_name;
        const dateKey = format(new Date(record.timestamp), "yyyy-MM-dd");
        const key = `${employeeKey}-${dateKey}`;
        const group = groupedByEmployeeAndDate[key];

        if (group) {
          workDuration = calculateWorkDurationWithCrossDay(
            group.checkIn?.timestamp,
            group.checkOut?.timestamp,
            rawData.attendance,
            record.user_name
          );

          // If no work duration calculated, try to find check-out on next day
          if (!workDuration && group.checkIn && !group.checkOut) {
            // Force cross-day calculation
            workDuration = calculateWorkDurationWithCrossDay(
              group.checkIn.timestamp,
              null, // This will trigger next-day lookup
              rawData.attendance,
              record.user_name
            );
          }
        }
      }

      // Determine attendance status
      // Determine attendance status
      let attendanceStatus = "unassigned";
      let statusMessage = "No schedule assigned";
      let extraTimeMinutes = 0;

      if (matchedProfile && matchedEmployee) {
        const recordDate = new Date(record.timestamp);
        const dayOfWeek = format(recordDate, "EEEE").toLowerCase();
        const effectiveSchedule = getEffectiveSchedule(
          matchedProfile,
          dayOfWeek
        );

        if (effectiveSchedule) {
          const recordTime = format(recordDate, "HH:mm");
          const scheduleStart = effectiveSchedule.startTime;
          const scheduleEnd = effectiveSchedule.endTime;

          // Get grace minutes from profile (with defaults if not set)
          const graceMinutesLate = matchedProfile.graceMinutesLate || 0;
          const graceMinutesEarly = matchedProfile.graceMinutesEarly || 0;

          if (effectiveSchedule.type === "on-call") {
            attendanceStatus = "on-time";
            statusMessage = "On-call schedule - flexible timing";
          } else {
            const recordMinutes =
              parseInt(recordTime.split(":")[0]) * 60 +
              parseInt(recordTime.split(":")[1]);
            const startMinutes =
              parseInt(scheduleStart.split(":")[0]) * 60 +
              parseInt(scheduleStart.split(":")[1]);
            const endMinutes =
              parseInt(scheduleEnd.split(":")[0]) * 60 +
              parseInt(scheduleEnd.split(":")[1]);

            if (record.status === "Check-in") {
              const minutesLate = recordMinutes - startMinutes;

              if (minutesLate <= 0) {
                // Arrived early or exactly on time
                attendanceStatus = "on-time";
                statusMessage =
                  minutesLate === 0
                    ? "Arrived exactly on time"
                    : `Arrived ${Math.abs(minutesLate)} minutes early`;
              } else if (minutesLate <= graceMinutesLate) {
                // Within grace period - still considered on time
                attendanceStatus = "on-time";
                statusMessage = `Arrived ${minutesLate} minutes late (within ${graceMinutesLate}-minute grace period)`;
              } else {
                // Beyond grace period - marked as late
                attendanceStatus = "late";
                statusMessage = `Late by ${minutesLate} minutes (exceeded ${graceMinutesLate}-minute grace period)`;
              }
            } else {
              // Check-out logic with extra time detection
              const minutesAfterSchedule = recordMinutes - endMinutes;

              if (minutesAfterSchedule > 0) {
                // Employee worked beyond scheduled time - Extra Time!
                extraTimeMinutes = minutesAfterSchedule;
                attendanceStatus = "extra-time";
                const extraHours = Math.floor(extraTimeMinutes / 60);
                const extraMins = extraTimeMinutes % 60;

                if (extraHours > 0) {
                  statusMessage = `Extra time: ${extraHours}h ${extraMins}m beyond scheduled hours`;
                } else {
                  statusMessage = `Extra time: ${extraMins} minutes beyond scheduled hours`;
                }
              } else {
                // Regular check-out logic
                const minutesEarly = Math.abs(minutesAfterSchedule);

                if (minutesEarly === 0) {
                  attendanceStatus = "on-time";
                  statusMessage = "Left exactly on time";
                } else if (minutesEarly <= graceMinutesEarly) {
                  // Within early grace period - still considered on time
                  attendanceStatus = "on-time";
                  statusMessage = `Left ${minutesEarly} minutes early (within ${graceMinutesEarly}-minute grace period)`;
                } else {
                  // Beyond early grace period - marked as early
                  attendanceStatus = "early";
                  statusMessage = `Left early by ${minutesEarly} minutes (exceeded ${graceMinutesEarly}-minute grace period)`;
                }
              }
            }
          }
        }
      }

      return {
        ...record,
        employee: matchedEmployee,
        profile: matchedProfile,
        workDuration,
        attendanceStatus,
        statusMessage,
        extraTimeMinutes, // Add this new field for extra time tracking
        effectiveSchedule: matchedProfile
          ? getEffectiveSchedule(
              matchedProfile,
              format(new Date(record.timestamp), "EEEE").toLowerCase()
            )
          : null,
      };
    });
  }, [rawData]);

  // Filtered data based on filters
  const filteredData = useMemo(() => {
    let filtered = [...processedAttendanceData];

    // Status filter
    if (filters.status && filters.status !== "All") {
      filtered = filtered.filter((record) => record.status === filters.status);
    }

    // Attendance performance filter
    if (filters.attendance && filters.attendance !== "All") {
      filtered = filtered.filter(
        (record) => record.attendanceStatus === filters.attendance
      );
    }

    // Date range filter
    if (filters.fromDate || filters.toDate) {
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.timestamp);
        return (
          (!fromDate || recordDate >= fromDate) &&
          (!toDate || recordDate <= toDate)
        );
      });
    }

    return filtered;
  }, [processedAttendanceData, filters]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredData.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredData, currentPage, recordsPerPage]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Calculate total hours for filtered data (check-ins only)
  const totalHours = useMemo(() => {
    return calculateTotalHours(filteredData);
  }, [filteredData]);

  // All employees for dropdown (not filtered by attendance)
  const filteredEmployees = useMemo(() => {
    let employees = [...rawData.employees];

    if (searchInput) {
      employees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(searchInput.toLowerCase())
      );
    }

    return employees.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 50);
  }, [searchInput, rawData.employees]);

  // Pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }
    return items;
  }, [currentPage, totalPages]);

  // Active employee name
  const activeEmployeeName = useMemo(() => {
    if (!filters.employee || filters.employee === "All") return "All Employees";
    const employee = rawData.employees.find(
      (emp) =>
        emp._id === filters.employee ||
        String(emp.userId) === String(filters.employee)
    );
    return employee?.name || "Unknown Employee";
  }, [filters.employee, rawData.employees]);

  // Manual attendance submission
  const handleManualAttendanceSubmit = useCallback(
    async (attendanceData) => {
      try {
        const dataArray = [attendanceData];
        await axios.post(`${url}attendance/create`, dataArray);

        // Refresh attendance data for the current employee
        if (selectedEmployeeId) {
          await fetchEmployeeAttendance(selectedEmployeeId);
        }

        return { success: true };
      } catch (error) {
        console.error("Error creating manual attendance:", error);
        throw error;
      }
    },
    [url, selectedEmployeeId, fetchEmployeeAttendance]
  );

  // Initial data load
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Add a comprehensive refresh function
  const refreshAllData = useCallback(async () => {
    await fetchInitialData();
    // If there's a selected employee, also refresh their attendance
    if (selectedEmployeeId) {
      await fetchEmployeeAttendance(selectedEmployeeId);
    }
  }, [fetchInitialData, fetchEmployeeAttendance, selectedEmployeeId]);

  return {
    rawData,
    isLoading: isLoading || isLoadingAttendance,
    error,
    processedAttendanceData,
    filteredData,
    paginatedData,
    totalPages,
    totalHours,
    filteredEmployees,
    paginationItems,
    activeEmployeeName,
    fetchAllData: refreshAllData, // Use the new comprehensive refresh function
    handleManualAttendanceSubmit,
    selectedEmployeeId,
  };
};
