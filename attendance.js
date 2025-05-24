const Zkteco = require("zkteco-js");
const axios = require("axios");

/**
 * Retrieves attendance data from a ZKTeco device and sends it to a database in bulk.
 * @returns {Promise<Object>} Result of the operation
 */
const getAndSendAttendanceData = async () => {
  const url = "http://172.18.1.31:8000";
  const deviceIp = "172.17.0.133";
  const port = 4370;

  const statusMapping = {
    0: "Check-in",
    1: "Check-out",
    2: "Break-out",
    3: "Break-in",
    4: "Overtime-in",
    5: "Overtime-out",
  };

  const device = new Zkteco(deviceIp, port, 5200, 5000);

  try {
    await device.createSocket();
    console.log("Connected to ZKTeco device");

    // Get users
    const usersResponse = await device.getUsers();
    const userDict = {};
    let userAttendance = [];
    if (usersResponse?.data) {
      usersResponse.data.forEach((user) => {
        userDict[user.userId] = user.name;
        userAttendance.push({
          name: user.name,
          userId: user.userId,
        });
      });
      console.log(
        `Retrieved ${Object.keys(userDict).length} users from device`
      );
    }
    if (userAttendance.length > 0) {
      try {
        await axios
          .post(
            url + "/attendanceUser/create",

            userAttendance,
            {
              headers: { "Content-Type": "application/json" },
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            }
          )
          .then((response) =>
            console.log("User data sent successfully. Status:", response.status)
          );
      } catch (error) {
        console.error("Error sending user data:", error);
      }
    }

    // Get attendance records
    const attendanceResponse = await device.getAttendances();
    const attendanceData = [];

    if (attendanceResponse?.data && attendanceResponse.data.length > 0) {
      console.log(
        `Retrieved ${attendanceResponse.data.length} attendance records`
      );

      for (const record of attendanceResponse.data) {
        const userName = userDict[record.user_id] || `User ${record.user_id}`;
        const status =
          statusMapping[record.state] || `Unknown Status ${record.state}`;
        const timestamp = new Date(record.record_time);
        timestamp.setHours(timestamp.getHours() + 3); // UTC+3 (Baghdad time)

        attendanceData.push({
          user_name: userName,
          timestamp: timestamp.toISOString(),
          status,
        });
      }

      // Send all attendance records in one request
      try {
        const response = await axios.post(
          url + "/attendance/create",
          attendanceData,
          {
            headers: { "Content-Type": "application/json" },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        return {
          success: true,
          message: `Bulk data sent successfully. Status: ${response.status}`,
          count: attendanceData.length,
          data: response.data,
        };
      } catch (error) {
        console.error("Error sending data to server:", error.message);

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(
            `Server responded with status: ${error.response.status}`
          );
          console.error("Response data:", error.response.data);
        }

        return {
          success: false,
          message: "Failed to send attendance data to server",
          error: error.message,
          data: attendanceData,
        };
      }
    } else {
      return {
        success: true,
        message: "No attendance records found",
        count: 0,
      };
    }
  } catch (error) {
    console.error(`Device connection error: ${error.message}`);
    return {
      success: false,
      message: "Failed to connect to ZKTeco device",
      error: error.message,
    };
  } finally {
    try {
      await device.disconnect();
      console.log("Disconnected from ZKTeco device");
    } catch (disconnectError) {
      console.error(`Error disconnecting: ${disconnectError.message}`);
    }
  }
};

module.exports = { getAndSendAttendanceData };

// Example usage
if (require.main === module) {
  getAndSendAttendanceData()
    .then((result) => console.log(result))
    .catch((error) => console.error("Unhandled error:", error));
}
