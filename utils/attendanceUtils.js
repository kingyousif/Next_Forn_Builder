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
  const checkInRecords = filteredData.filter(
    (record) => record.status === "Check-in" && record.workDuration
  );

  const totalMinutes = checkInRecords.reduce((total, record) => {
    return total + (record.workDuration?.totalMinutes || 0);
  }, 0);

  // Calculate late time statistics
  const lateRecords = filteredData.filter(
    (record) =>
      record.status === "Check-in" && record.attendanceStatus === "late"
  );

  const totalLateMinutes = lateRecords.reduce((total, record) => {
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

  // Calculate early time statistics
  const earlyRecords = filteredData.filter(
    (record) =>
      record.status === "Check-out" && record.attendanceStatus === "early"
  );

  const totalEarlyMinutes = earlyRecords.reduce((total, record) => {
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

  // Calculate extra time statistics
  const extraTimeRecords = filteredData.filter(
    (record) =>
      record.status === "Check-out" && record.attendanceStatus === "extra-time"
  );

  const totalExtraMinutes = extraTimeRecords.reduce((total, record) => {
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
    recordCount: checkInRecords.length,
    // New statistics
    lateTime: {
      hours: lateHours,
      minutes: lateMinutesRemainder,
      totalMinutes: totalLateMinutes,
      count: lateRecords.length,
    },
    earlyTime: {
      hours: earlyHours,
      minutes: earlyMinutesRemainder,
      totalMinutes: totalEarlyMinutes,
      count: earlyRecords.length,
    },
    extraTime: {
      hours: extraHours,
      minutes: extraMinutesRemainder,
      totalMinutes: totalExtraMinutes,
      count: extraTimeRecords.length,
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
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          border-radius: 15px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #667eea;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #2d3748;
          font-size: 2.5em;
          margin: 0;
          font-weight: 700;
        }
        .header p {
          color: #718096;
          font-size: 1.1em;
          margin: 10px 0 0 0;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          font-size: 1.2em;
        }
        .summary-card p {
          margin: 0;
          font-size: 1.5em;
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        th {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 15px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9em;
        }
        td {
          padding: 12px 10px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.85em;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        tr:hover {
          background-color: #edf2f7;
        }
        .badge {
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 0.75em;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-success { background: #48bb78; color: white; }
        .badge-danger { background: #f56565; color: white; }
        .badge-warning { background: #ed8936; color: white; }
        .badge-secondary { background: #a0aec0; color: white; }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #718096;
          font-size: 0.9em;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        @media print {
          body { background: white !important; }
          .container { box-shadow: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Attendance Report</h1>
          <p>Generated on ${format(new Date(), "MMMM dd, yyyy at HH:mm")}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>Total Records</h3>
            <p>${data.length}</p>
          </div>
          <div class="summary-card">
            <h3>Check-in Records</h3>
            <p>${totalHours.recordCount}</p>
          </div>
          <div class="summary-card">
            <h3>Total Hours</h3>
            <p>${totalHours.hours}h ${totalHours.minutes}m</p>
          </div>
          <div class="summary-card">
            <h3>Employee Filter</h3>
            <p>${filters.employee || "All"}</p>
          </div>
        </div>
        
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
                <td><strong>${
                  record.employee?.name || "Unknown"
                }</strong><br><small>ID: ${
                  record.employee?.userId || "N/A"
                }</small></td>
                <td>${format(new Date(record.timestamp), "MMM dd, yyyy")}</td>
                <td>${format(new Date(record.timestamp), "HH:mm:ss")}</td>
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
                <td>${
                  record.workDuration
                    ? `${record.workDuration.hours}h ${record.workDuration.minutes}m`
                    : "N/A"
                }</td>
                <td>${record.profile?.name || "Unassigned"}<br><small>${
                  record.profile?.scheduleType || "N/A"
                }</small></td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report contains ${
            data.length
          } attendance records with a total of ${totalHours.hours} hours and ${
    totalHours.minutes
  } minutes of work time.</p>
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
      <title>Invoice - ${employeeName}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          margin: 0;
          padding: 10px;
          font-size: 12px;
          line-height: 1.4;
          width: 58mm;
          background: white;
        }
        .invoice {
          text-align: center;
          border: 2px solid #000;
          padding: 10px;
        }
        .header {
          border-bottom: 1px dashed #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 10px;
          margin-bottom: 10px;
        }
        .section {
          margin: 10px 0;
          text-align: left;
        }
        .section-title {
          font-weight: bold;
          border-bottom: 1px solid #000;
          margin-bottom: 5px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        .total {
          border-top: 1px dashed #000;
          padding-top: 10px;
          margin-top: 10px;
          font-weight: bold;
          font-size: 14px;
        }
        .footer {
          border-top: 1px dashed #000;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 10px;
          text-align: center;
        }
        @media print {
          body { width: 58mm; }
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div class="title">⏰ ATTENDANCE INVOICE</div>
          <div class="subtitle">Work Hours Summary</div>
        </div>
        
        <div class="section">
          <div class="section-title">EMPLOYEE DETAILS</div>
          <div class="row">
            <span>Name:</span>
            <span>${employeeName}</span>
          </div>
          <div class="row">
            <span>Profile:</span>
            <span>${profileName}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PERIOD</div>
          <div class="row">
            <span>From:</span>
            <span>${dateFrom || "N/A"}</span>
          </div>
          <div class="row">
            <span>To:</span>
            <span>${dateTo || "N/A"}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">WORK SUMMARY</div>
          <div class="row">
            <span>Total Hours:</span>
            <span>${totalHours.hours}h ${totalHours.minutes}m</span>
          </div>
          <div class="row">
            <span>Check-ins:</span>
            <span>${totalHours.recordCount}</span>
          </div>
        </div>
        
        <div class="total">
          TOTAL: ${totalHours.hours}h ${totalHours.minutes}m
        </div>
        
        <div class="footer">
          Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}<br>
          Thank you! 🙏
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
