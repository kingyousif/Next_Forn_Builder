import {
  format,
  differenceInMinutes,
  startOfDay,
  endOfDay,
  addDays,
  isSameDay,
} from "date-fns";

// Optimized work duration calculation with cross-day logic
export const calculateWorkDurationWithCrossDay = (
  checkInTime,
  checkOutTime,
  allRecords,
  employeeName
) => {
  if (!checkInTime || !employeeName) return null;

  let actualCheckOut = checkOutTime;

  // If no check-out on the same day, look for the first check-out on the next day
  if (!checkOutTime) {
    const checkInDate = new Date(checkInTime);
    const nextDay = new Date(checkInDate);
    nextDay.setDate(checkInDate.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);

    const nextDayEnd = new Date(nextDay);
    nextDayEnd.setHours(23, 59, 59, 999);

    // Find records for this employee on the next day
    const nextDayRecords = allRecords
      .filter(
        (record) =>
          record.user_name === employeeName &&
          new Date(record.timestamp) >= nextDay &&
          new Date(record.timestamp) <= nextDayEnd
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Check if the first record on the next day is a check-out
    const firstNextDayRecord = nextDayRecords[0];

    if (firstNextDayRecord && firstNextDayRecord.status === "Check-out") {
      actualCheckOut = firstNextDayRecord.timestamp;
    } else {
      // If first record is not check-out, don't calculate (employee didn't work cross-day)
      return null;
    }
  }

  if (!actualCheckOut) return null;

  const startTime = new Date(checkInTime);
  const endTime = new Date(actualCheckOut);

  // Check if this is a cross-day scenario by comparing times
  // If check-out time (hours:minutes) is earlier than check-in time, it's likely next day
  const checkInHours = startTime.getHours() * 60 + startTime.getMinutes();
  const checkOutHours = endTime.getHours() * 60 + endTime.getMinutes();
  const isCrossDay =
    checkOutHours < checkInHours || !isSameDay(startTime, endTime);

  // For same-day scenarios, validate that check-out is after check-in
  if (!isCrossDay && endTime <= startTime) {
    console.warn(
      `Invalid time range: Check-out (${endTime}) is not after check-in (${startTime})`
    );
    return null;
  }

  // For cross-day scenarios, if they appear to be on the same date but check-out time is earlier,
  // treat the check-out as next day
  let adjustedEndTime = endTime;
  if (isSameDay(startTime, endTime) && checkOutHours < checkInHours) {
    adjustedEndTime = new Date(endTime);
    adjustedEndTime.setDate(adjustedEndTime.getDate() + 1);
  }

  const diffInMinutes = differenceInMinutes(adjustedEndTime, startTime);
  const hours = Math.floor(diffInMinutes / 60);
  const minutes = diffInMinutes % 60;

  return {
    hours,
    minutes,
    totalMinutes: diffInMinutes,
    crossDay: isCrossDay,
    actualCheckOutTime: actualCheckOut,
  };
};

// Enhanced total hours calculation with late, early, and extra time tracking
export const calculateTotalHours = (filteredData) => {
  // Group check-in records by date and user to avoid double counting
  const checkInRecords = filteredData.filter(
    (record) => record.status === "Check-in" && record.workDuration
  );

  // Group by date and user ID to get unique daily records
  const dailyRecords = checkInRecords.reduce((acc, record) => {
    const recordDate = new Date(record.timestamp);
    const dateKey = recordDate.toDateString(); // e.g., "Mon Feb 01 2023"
    const userKey = record.employee?.id || record.userId || "unknown";
    const compositeKey = `${dateKey}-${userKey}`;

    if (
      !acc[compositeKey] ||
      (record.workDuration?.totalMinutes || 0) >
        (acc[compositeKey].workDuration?.totalMinutes || 0)
    ) {
      acc[compositeKey] = record;
    }

    return acc;
  }, {});

  // Convert back to array and calculate total
  const uniqueDailyRecords = Object.values(dailyRecords);

  const totalMinutes = uniqueDailyRecords.reduce((total, record) => {
    return total + (record.workDuration?.totalMinutes || 0);
  }, 0);

  // Calculate late time statistics (also group by date and user)
  const lateRecords = filteredData.filter(
    (record) =>
      record.status === "Check-in" && record.attendanceStatus === "late"
  );

  // Group late records by date and user
  const dailyLateRecords = lateRecords.reduce((acc, record) => {
    const recordDate = new Date(record.timestamp);
    const dateKey = recordDate.toDateString();
    const userKey = record.employee?.id || record.userId || "unknown";
    const compositeKey = `${dateKey}-${userKey}`;

    if (!acc[compositeKey]) {
      acc[compositeKey] = record;
    }

    return acc;
  }, {});

  const uniqueLateRecords = Object.values(dailyLateRecords);

  const totalLateMinutes = uniqueLateRecords.reduce((total, record) => {
    if (record.profile && record.employee) {
      const recordDate = new Date(record.timestamp);
      const recordTime = format(recordDate, "HH:mm");
      const effectiveSchedule = getEffectiveSchedule(
        record.profile,
        format(recordDate, "EEEE").toLowerCase()
      );

      if (effectiveSchedule && effectiveSchedule.type !== "on-call") {
        const recordMinutes =
          parseInt(recordTime.split(":")[0]) * 60 +
          parseInt(recordTime.split(":")[1]);
        const startMinutes =
          parseInt(effectiveSchedule.startTime.split(":")[0]) * 60 +
          parseInt(effectiveSchedule.startTime.split(":")[1]);
        const minutesLate = Math.max(0, recordMinutes - startMinutes);
        return total + minutesLate;
      }
    }
    return total;
  }, 0);

  // Calculate early time statistics (group by date and user)
  const earlyRecords = filteredData.filter(
    (record) =>
      record.status === "Check-out" && record.attendanceStatus === "early"
  );

  // Group early records by date and user
  const dailyEarlyRecords = earlyRecords.reduce((acc, record) => {
    const recordDate = new Date(record.timestamp);
    const dateKey = recordDate.toDateString();
    const userKey = record.employee?.id || record.userId || "unknown";
    const compositeKey = `${dateKey}-${userKey}`;

    if (!acc[compositeKey]) {
      acc[compositeKey] = record;
    }

    return acc;
  }, {});

  const uniqueEarlyRecords = Object.values(dailyEarlyRecords);

  const totalEarlyMinutes = uniqueEarlyRecords.reduce((total, record) => {
    if (record.profile && record.employee) {
      const recordDate = new Date(record.timestamp);
      const recordTime = format(recordDate, "HH:mm");
      const effectiveSchedule = getEffectiveSchedule(
        record.profile,
        format(recordDate, "EEEE").toLowerCase()
      );

      if (effectiveSchedule && effectiveSchedule.type !== "on-call") {
        const recordMinutes =
          parseInt(recordTime.split(":")[0]) * 60 +
          parseInt(recordTime.split(":")[1]);
        const endMinutes =
          parseInt(effectiveSchedule.endTime.split(":")[0]) * 60 +
          parseInt(effectiveSchedule.endTime.split(":")[1]);
        const minutesEarly = Math.max(0, endMinutes - recordMinutes);
        return total + minutesEarly;
      }
    }
    return total;
  }, 0);

  // Calculate extra time statistics (group by date and user)
  const extraTimeRecords = filteredData.filter(
    (record) =>
      record.status === "Check-out" && record.attendanceStatus === "extra-time"
  );

  // Group extra time records by date and user
  const dailyExtraRecords = extraTimeRecords.reduce((acc, record) => {
    const recordDate = new Date(record.timestamp);
    const dateKey = recordDate.toDateString();
    const userKey = record.employee?.id || record.userId || "unknown";
    const compositeKey = `${dateKey}-${userKey}`;

    if (
      !acc[compositeKey] ||
      (record.extraTimeMinutes || 0) > (acc[compositeKey].extraTimeMinutes || 0)
    ) {
      acc[compositeKey] = record;
    }

    return acc;
  }, {});

  const uniqueExtraRecords = Object.values(dailyExtraRecords);

  const totalExtraMinutes = uniqueExtraRecords.reduce((total, record) => {
    return total + (record.extraTimeMinutes || 0);
  }, 0);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const lateHours = Math.floor(totalLateMinutes / 60);
  const lateMinutesRemainder = totalLateMinutes % 60;

  const earlyHours = Math.floor(totalEarlyMinutes / 60);
  const earlyMinutesRemainder = totalEarlyMinutes % 60;

  const extraHours = Math.floor(totalExtraMinutes / 60);
  const extraMinutesRemainder = totalExtraMinutes % 60;

  return {
    hours,
    minutes,
    totalMinutes,
    recordCount: uniqueDailyRecords.length, // Now shows unique daily records
    // New statistics
    lateTime: {
      hours: lateHours,
      minutes: lateMinutesRemainder,
      totalMinutes: totalLateMinutes,
      count: uniqueLateRecords.length,
    },
    earlyTime: {
      hours: earlyHours,
      minutes: earlyMinutesRemainder,
      totalMinutes: totalEarlyMinutes,
      count: uniqueEarlyRecords.length,
    },
    extraTime: {
      hours: extraHours,
      minutes: extraMinutesRemainder,
      totalMinutes: totalExtraMinutes,
      count: uniqueExtraRecords.length,
    },
  };
};

// Optimized employee matching with caching
const employeeMatchCache = new Map();

export const findMatchingEmployee = (userName, employees) => {
  // Check cache first
  if (employeeMatchCache.has(userName)) {
    return employeeMatchCache.get(userName);
  }

  let matchedEmployee = employees.find((emp) => emp.name === userName);

  if (!matchedEmployee) {
    matchedEmployee = employees.find((emp) => emp._id === userName);
  }

  if (!matchedEmployee) {
    matchedEmployee = employees.find((emp) => emp.userId === userName);
  }

  // Enhanced name matching with variations
  if (!matchedEmployee) {
    const normalizedRecordName = userName.toLowerCase().trim();
    matchedEmployee = employees.find((emp) => {
      const normalizedEmpName = emp.name.toLowerCase().trim();
      return (
        normalizedEmpName === normalizedRecordName ||
        normalizedEmpName.includes(normalizedRecordName) ||
        normalizedRecordName.includes(normalizedEmpName)
      );
    });
  }

  // Cache the result
  employeeMatchCache.set(userName, matchedEmployee || null);
  return matchedEmployee;
};

// Clear cache when employees data changes
export const clearEmployeeCache = () => {
  employeeMatchCache.clear();
};

// Optimized schedule helper
export const getEffectiveSchedule = (profile, dayOfWeek) => {
  if (!profile) return null;

  if (profile.scheduleType === "on-call") {
    return {
      startTime: "00:00",
      endTime: "23:59",
      type: "on-call",
    };
  }

  if (
    profile.scheduleType === "flexible" &&
    profile.schedulePatterns?.length > 0
  ) {
    // Convert day name to number (0=Sunday, 1=Monday, etc.)
    const dayNameToNumber = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const dayNumber = dayNameToNumber[dayOfWeek.toLowerCase()];

    const pattern = profile.schedulePatterns.find((p) =>
      p.days?.includes(dayNumber)
    );
    if (pattern) {
      return {
        startTime: pattern.startTime,
        endTime: pattern.endTime,
        type: "flexible",
      };
    }
  }

  return {
    startTime: profile.startTime || "09:00",
    endTime: profile.endTime || "17:00",
    type: "standard",
  };
};

// Export and print utilities
export const exportToExcel = (data, filename = "attendance-report") => {
  const headers = [
    "Employee Name",
    "Employee ID",
    "Date",
    "Time",
    "Status",
    "Attendance Status",
    "Profile Name",
    "Schedule Type",
    "Work Duration",
    "Status Message",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((record) =>
      [
        `"${record.employee?.name || "Unknown"}",`,
        `"${record.employee?.userId || "N/A"}",`,
        `"${format(new Date(record.timestamp), "yyyy-MM-dd")}",`,
        `"${format(new Date(record.timestamp), "HH:mm:ss")}",`,
        `"${record.status}",`,
        `"${record.attendanceStatus}",`,
        `"${record.profile?.name || "Unassigned"}",`,
        `"${record.profile?.scheduleType || "N/A"}",`,
        `"${
          record.workDuration
            ? `${record.workDuration.hours}h ${record.workDuration.minutes}m`
            : "N/A"
        }",`,
        `"${record.statusMessage}"`,
      ].join("")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const printFilteredData = (data, totalHours, filters) => {
  const printWindow = window.open("", "_blank");
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          margin: 0;
          padding: 16px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          min-height: 100vh;
          font-size: 14px;
        }
        .container {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          max-width: 1100px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f1f5f9;
        }
        .header-left h1 {
          color: #1e293b;
          font-size: 1.75rem;
          margin: 0;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-left p {
          color: #64748b;
          font-size: 0.875rem;
          margin: 4px 0 0 0;
          font-weight: 500;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .summary-card {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .summary-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: translate(15px, -15px);
        }
        .summary-card h3 {
          margin: 0 0 8px 0;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.9;
        }
        .summary-card p {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        th {
          background: #f8fafc;
          color: #374151;
          padding: 12px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }
        tr:hover {
          background-color: #f8fafc;
        }
        .employee-info {
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
        }
        .employee-id {
          font-size: 0.7rem;
          color: #64748b;
          font-weight: 400;
        }
        .date-time {
          color: #475569;
          font-weight: 500;
        }
        .badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: inline-block;
        }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-danger { background: #fef2f2; color: #dc2626; }
        .badge-warning { background: #fef3c7; color: #d97706; }
        .badge-secondary { background: #f1f5f9; color: #64748b; }
        .profile-info {
          color: #475569;
          line-height: 1.3;
        }
        .profile-schedule {
          font-size: 0.7rem;
          color: #64748b;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #64748b;
          font-size: 0.8rem;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        @media print {
          body { 
            background: white !important; 
            padding: 0 !important;
          }
          .container { 
            box-shadow: none !important; 
            border-radius: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .header { flex-direction: column; align-items: flex-start; }
          .summary { grid-template-columns: 1fr; }
          table { font-size: 0.75rem; }
          th, td { padding: 8px 6px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-left">
            <h1>📋 Attendance Report</h1>
            <p>Generated on ${format(new Date(), "MMM dd, yyyy • HH:mm")}</p>
          </div>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Records</h3>
            <p>${data.length}</p>
          </div>
          <div class="summary-card">
            <h3>Check-ins</h3>
            <p>${totalHours.recordCount}</p>
          </div>
          <div class="summary-card">
            <h3>Total Hours</h3>
            <p>${totalHours.hours}h ${totalHours.minutes}m</p>
          </div>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Attendance</th>
                <th>Duration</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (record) => `
                <tr>
                  <td>
                    <div class="employee-info">${
                      record.employee?.name || "Unknown"
                    }</div>
                    <div class="employee-id">ID: ${
                      record.employee?.userId || "N/A"
                    }</div>
                  </td>
                  <td class="date-time">${format(
                    new Date(record.timestamp),
                    "yyyy-MM-dd"
                  )}</td>
                  <td class="date-time">${format(
                    new Date(record.timestamp),
                    "HH:mm:ss"
                  )}</td>
                  <td><span class="badge ${
                    record.status === "Check-in"
                      ? "badge-success"
                      : "badge-danger"
                  }">${record.status}</span></td>
                  <td><span class="badge ${
                    record.attendanceStatus === "on-time"
                      ? "badge-success"
                      : record.attendanceStatus === "late"
                      ? "badge-danger"
                      : record.attendanceStatus === "early"
                      ? "badge-warning"
                      : "badge-secondary"
                  }">${record.attendanceStatus}</span></td>
                  <td class="date-time">${
                    record.workDuration
                      ? `${record.workDuration.hours}h ${record.workDuration.minutes}m`
                      : "N/A"
                  }</td>
                  <td>
                    <div class="profile-info">${
                      record.profile?.name || "Unassigned"
                    }</div>
                    <div class="profile-schedule">${
                      record.profile?.scheduleType || "N/A"
                    }</div>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Report contains ${data.length} records • ${totalHours.hours}h ${
    totalHours.minutes
  }m total work time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const printInvoice = (
  employeeName,
  profileName,
  dateFrom,
  dateTo,
  totalHours
) => {
  const printWindow = window.open("", "_blank");
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Attendance Report - ${employeeName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 15px;
          font-size: 11px;
          line-height: 1.5;
          width: 58mm;
          background: white;
          color: #333;
        }
        .report {
          border: 1px solid #2c5aa0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }
        .header {
          background: linear-gradient(135deg, #2c5aa0 0%, #1e3d6f 100%);
          color: white;
          padding: 12px;
          text-align: center;
          position: relative;
        }
        .logo {
          width: 24px;
          height: 24px;
          margin: 0 auto 8px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .logo img {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
        .hospital-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
        }
        .report-title {
          font-size: 10px;
          opacity: 0.9;
          font-weight: 400;
        }
        .content {
          padding: 12px;
        }
        .section {
          margin-bottom: 12px;
        }
        .section-header {
          background: #f8f9fa;
          color: #2c5aa0;
          font-weight: 600;
          font-size: 9px;
          padding: 4px 8px;
          margin: -2px -2px 6px -2px;
          border-left: 3px solid #2c5aa0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 4px 0;
          padding: 2px 0;
        }
        .info-label {
          font-weight: 500;
          color: #666;
          font-size: 10px;
        }
        .info-value {
          font-weight: 600;
          color: #333;
          font-size: 10px;
        }
        .summary-box {
          background: linear-gradient(135deg, #e8f2ff 0%, #f0f7ff 100%);
          border: 1px solid #2c5aa0;
          border-radius: 6px;
          padding: 8px;
          margin: 8px 0;
          text-align: center;
        }
        .total-hours {
          font-size: 16px;
          font-weight: 700;
          color: #2c5aa0;
          margin-bottom: 2px;
        }
        .total-label {
          font-size: 8px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .footer {
          border-top: 1px solid #e0e0e0;
          padding: 8px 12px;
          background: #f8f9fa;
          text-align: center;
          font-size: 8px;
          color: #666;
        }
        .generated-info {
          margin-bottom: 4px;
        }
        .hospital-footer {
          font-weight: 500;
          color: #2c5aa0;
        }
        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e0e0e0, transparent);
          margin: 8px 0;
        }
        @media print {
          body { 
            width: 58mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="report">
        <div class="header">
          <div class="logo">
            <img src="/harem.png" alt="Hospital Logo" />
          </div>
          <div class="hospital-name">HAREM HOSPITAL</div>
          <div class="report-title">Staff Attendance Report</div>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-header">Employee Information</div>
            <div class="info-row">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${employeeName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Department:</span>
              <span class="info-value">${profileName}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="section-header">Reporting Period</div>
            <div class="info-row">
              <span class="info-label">Start Date:</span>
              <span class="info-value">${dateFrom || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">End Date:</span>
              <span class="info-value">${
                dateTo || format(new Date(), "yyyy-MM-dd")
              }</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="section">
            <div class="section-header">Attendance Summary</div>
            <div class="info-row">
              <span class="info-label">Total Days:</span>
              <span class="info-value">${totalHours.recordCount} Day</span>
            </div>
          </div>
          
          <div class="summary-box">
            <div class="total-hours">${totalHours.hours}h ${
    totalHours.minutes
  }m</div>
            <div class="total-label">Total Working Hours</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="generated-info">
            Report Generated: ${format(new Date(), "dd/MM/yyyy 'at' HH:mm")}
          </div>
          <div class="hospital-footer">
            Harem Hospital - Developed by Harem IT
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
