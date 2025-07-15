const ZKLib = require("node-zklib");
const axios = require("axios"); // Added missing import
const { format, addHours } = require("date-fns");

const createUserOnDevice = async (userData) => {
  const device = new ZKLib("172.17.0.133", 4370, 5200, 5000);

  try {
    await device.createSocket();

    // Check if user exists first
    const usersResult = await device.getUsers();
    let users;
    if (Array.isArray(usersResult)) {
      users = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      users = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      users = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      // Handle error appropriately for each function
    }
    const existingUser = users.find((user) => user.userId === userData.userId);

    if (existingUser) {
      return {
        success: false,
        message: `User with ID ${userData.userId} already exists on device`,
      };
    }

    // Create user with same parameters
    await device.setUser(
      userData.uid,
      userData.userId,
      userData.name,
      userData.password || "",
      userData.privilege || 0,
      userData.cardno || 0
    );

    await device.disconnect();

    return {
      success: true,
      message: `User ${userData.name} created successfully on device`,
    };
  } catch (error) {
    console.error("Error creating user on device:", error);
    try {
      await device.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }

    return {
      success: false,
      message: `Failed to create user: ${error.message}`,
    };
  }
};

const updateUserOnDevice = async (userData) => {
  const device = new ZKLib("172.17.0.133", 4370, 5200, 5000);

  try {
    await device.createSocket();

    // Check if user exists
    const usersResult = await device.getUsers();
    let users;
    if (Array.isArray(usersResult)) {
      users = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      users = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      users = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      // Handle error appropriately for each function
    }
    const existingUser = users.find((user) => user.userId === userData.userId);

    if (!existingUser) {
      await device.disconnect();
      return {
        success: false,
        message: `User with ID ${userData.userId} not found on device`,
      };
    }

    // Delete existing user
    await device.deleteUser(existingUser.uid);

    // Wait a moment for device to process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create user with updated information
    await device.setUser(
      userData.uid,
      userData.userId,
      userData.name,
      userData.password || "",
      userData.privilege || 0,
      userData.cardno || 0
    );

    await device.disconnect();

    return {
      success: true,
      message: `User ${userData.name} updated successfully on device`,
    };
  } catch (error) {
    console.error("Error updating user on device:", error);
    try {
      await device.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }

    return {
      success: false,
      message: `Failed to update user: ${error.message}`,
    };
  }
};

const deleteUserFromDevice = async (userId) => {
  const device = new ZKLib("172.17.0.133", 4370, 5200, 5000);

  try {
    await device.createSocket();

    // Get all users to find the correct UID
    const usersResult = await device.getUsers();

    // Handle different return formats from node-zklib
    let users;
    if (Array.isArray(usersResult)) {
      users = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      users = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      // If it's an object, try to extract users array
      users = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      await device.disconnect();
      return {
        success: false,
        message: "Failed to retrieve users from device - unexpected format",
      };
    }


    console.log(`Retrieved ${users.length} users from device`);

    const userToDelete = users.find((user) => user.userId === userId);

    if (!userToDelete) {
      await device.disconnect();
      return {
        success: false,
        message: `User with ID ${userId} not found on device`,
      };
    }

    // Delete user using UID
    await device.deleteUser(userToDelete.uid);

    await device.disconnect();

    return {
      success: true,
      message: `User with ID ${userId} deleted successfully from device`,
    };
  } catch (error) {
    console.error("Error deleting user from device:", error);
    try {
      await device.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }

    return {
      success: false,
      message: `Failed to delete user: ${error.message}`,
    };
  }
};

// NEW: Bulk delete users function
const bulkDeleteUsers = async (userIds) => {
  const device = new ZKLib("172.17.0.133", 4370, 5200, 5000);
  const results = {
    success: [],
    failed: [],
    summary: {
      total: userIds.length,
      successful: 0,
      failed: 0,
    },
  };

  try {
    await device.createSocket();
    console.log(`Starting bulk delete for ${userIds.length} users`);

    // Get all users from device first
    const usersResult = await device.getUsers();
    let allUsers;
    if (Array.isArray(usersResult)) {
      allUsers = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      allUsers = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      allUsers = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      // Handle error appropriately for each function
    }
    console.log(`Retrieved ${allUsers.length} users from device`);

    for (const userId of userIds) {
      try {
        // Find user by userId
        const userToDelete = allUsers.find((user) => user.userId === userId);

        if (!userToDelete) {
          results.failed.push({
            userId,
            error: `User with ID ${userId} not found on device`,
          });
          results.summary.failed++;
          continue;
        }

        // Delete user using UID
        await device.deleteUser(userToDelete.uid);

        results.success.push({
          userId,
          message: `User with ID ${userId} deleted successfully`,
        });
        results.summary.successful++;

        console.log(`Successfully deleted user ${userId}`);

        // Small delay between deletions to avoid overwhelming the device
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        results.failed.push({
          userId,
          error: error.message,
        });
        results.summary.failed++;
      }
    }

    await device.disconnect();

    return {
      success: results.summary.failed === 0,
      message: `Bulk delete completed. ${results.summary.successful} successful, ${results.summary.failed} failed`,
      results,
    };
  } catch (error) {
    console.error("Error in bulk delete operation:", error);
    try {
      await device.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }

    return {
      success: false,
      message: `Bulk delete failed: ${error.message}`,
      results,
    };
  }
};

// NEW: Bulk create users function
const bulkCreateUsers = async (usersData) => {
  const device = new ZKLib("172.17.0.133", 4370, 5200, 5000);
  const results = {
    success: [],
    failed: [],
    summary: {
      total: usersData.length,
      successful: 0,
      failed: 0,
    },
  };

  try {
    await device.createSocket();
    console.log(`Starting bulk create for ${usersData.length} users`);

    // Get existing users to check for duplicates
    const usersResult = await device.getUsers();
    let existingUsers;
    if (Array.isArray(usersResult)) {
      existingUsers = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      existingUsers = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      existingUsers = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      // Handle error appropriately for each function
    }
    const existingUserIds = existingUsers.map((user) => user.userId);

    for (const userData of usersData) {
      try {
        // Check if user already exists
        if (existingUserIds.includes(userData.userId)) {
          results.failed.push({
            userId: userData.userId,
            error: `User with ID ${userData.userId} already exists on device`,
          });
          results.summary.failed++;
          continue;
        }

        // Create user
        await device.setUser(
          userData.uid,
          userData.userId,
          userData.name,
          userData.password || "",
          userData.privilege || 0,
          userData.cardno || 0
        );

        results.success.push({
          userId: userData.userId,
          message: `User ${userData.name} created successfully`,
        });
        results.summary.successful++;

        console.log(`Successfully created user ${userData.userId}`);

        // Small delay between creations
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error creating user ${userData.userId}:`, error);
        results.failed.push({
          userId: userData.userId,
          error: error.message,
        });
        results.summary.failed++;
      }
    }

    await device.disconnect();

    return {
      success: results.summary.failed === 0,
      message: `Bulk create completed. ${results.summary.successful} successful, ${results.summary.failed} failed`,
      results,
    };
  } catch (error) {
    console.error("Error in bulk create operation:", error);
    try {
      await device.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }

    return {
      success: false,
      message: `Bulk create failed: ${error.message}`,
      results,
    };
  }
};

// NEW: Get users from device function
const getUsersFromDevice = async () => {
  const device = new ZKLib("172.17.0.133", 4370, 5200, 5000);

  try {
    await device.createSocket();
    console.log("Connected to ZKTeco device to retrieve users");

    const usersResult = await device.getUsers();
    let users;
    if (Array.isArray(usersResult)) {
      users = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      users = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      users = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      // Handle error appropriately for each function
    }
    await device.disconnect();

    return {
      success: true,
      message: `Retrieved ${users.length} users from device`,
      count: users.length,
      users: users,
    };
  } catch (error) {
    console.error("Error getting users from device:", error);
    try {
      await device.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting:", disconnectError);
    }

    return {
      success: false,
      message: `Failed to get users: ${error.message}`,
      users: [],
    };
  }
};

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

  // Fixed: Use ZKLib consistently instead of Zkteco
  const device = new ZKLib(deviceIp, port, 5200, 5000);

  try {
    await device.createSocket();
    console.log("Connected to ZKTeco device");

    // Get users
    const usersResult = await device.getUsers();
    let users;
    if (Array.isArray(usersResult)) {
      users = usersResult;
    } else if (
      usersResult &&
      usersResult.data &&
      Array.isArray(usersResult.data)
    ) {
      users = usersResult.data;
    } else if (usersResult && typeof usersResult === "object") {
      users = Object.values(usersResult).filter(
        (item) => item && typeof item === "object" && item.userId !== undefined
      );
    } else {
      console.error("Unexpected users format:", usersResult);
      return {
        success: false,
        message: "Failed to retrieve users from device",
        error: "Unexpected users format",
      };
    }

    const userDict = {};
    let userAttendance = [];

    if (users && users.length > 0) {
      users.forEach((user) => {
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

    // Uncomment if you want to send user data
    // if (userAttendance.length > 0) {
    //   try {
    //     const response = await axios.post(
    //       url + "/attendanceUser/create",
    //       userAttendance,
    //       {
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         maxContentLength: Infinity,
    //         maxBodyLength: Infinity,
    //       }
    //     );
    //     console.log("User data sent successfully. Status:", response.status);
    //   } catch (error) {
    //     console.error("Error sending user data:", error);
    //   }
    // }

    // Get attendance records
    const attendanceResult = await device.getAttendances();
    console.log(
      "🚀 ~ getAndSendAttendanceData ~ attendanceResult:",
      attendanceResult
    );
    const attendanceRecords = attendanceResult.data || attendanceResult;

    const attendanceData = [];

    if (attendanceRecords && attendanceRecords.length > 0) {
      console.log(`Retrieved ${attendanceRecords.length} attendance records`);

      for (const record of attendanceRecords) {
        // Skip records with invalid timestamps
        if (!record.recordTime) {
          console.warn(
            `Skipping record with invalid recordTime for user ${record.deviceUserId}`
          );
          continue;
        }

        try {
          const userName = userDict[record.deviceUserId] || `Unknown User`;

          // Fixed: Properly assign status instead of console.log
          const status =
            statusMapping[record.state] || `Unknown Status ${record.state}`;

          // console.log("🚀 ~ getAndSendAttendanceData ~ userName:", userName);

          // Safely parse the recordTime and add 3 hours
          let recordTime;
          try {
            // Convert milliseconds to seconds if recordTime is in milliseconds
            const timestampValue =
              record.recordTime > 9999999999
                ? record.recordTime / 1000
                : record.recordTime;

            recordTime = format(
              addHours(new Date(timestampValue * 1000), 3), // UTC+3 (Baghdad time)
              "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
            );
          } catch (timeError) {
            console.warn(
              `Invalid recordTime format for user ${record.deviceUserId}: ${record.recordTime}`
            );
            continue;
          }

          attendanceData.push({
            user_name: userName,
            timestamp: recordTime, // Fixed: Changed from recordTime to timestamp to match your model
            status,
          });
        } catch (recordError) {
          console.warn(
            `Error processing record for user ${record.deviceUserId}:`,
            recordError
          );
          continue;
        }
      }

      // Send all attendance records in one request
      if (attendanceData.length > 0) {
        try {
          const response = await axios.post(
            url + "/attendance/create",
            attendanceData,
            {
              headers: {
                "Content-Type": "application/json",
              },
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
          message: "No valid attendance records to send",
          count: 0,
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

module.exports = {
  getAndSendAttendanceData,
  createUserOnDevice,
  deleteUserFromDevice,
  bulkDeleteUsers,
  bulkCreateUsers,
  updateUserOnDevice,
  getUsersFromDevice,
};

// Example usage
if (require.main === module) {
  // Test attendance data retrieval
  getAndSendAttendanceData()
    .then((result) => console.log("Attendance:", result))
    .catch((error) => console.error("Unhandled error:", error));
  // Example: Create a single user
  // createUserOnDevice({
  //   uid: 1230,
  //   userId: "1230",
  //   name: "John Doe",
  //   password: "12345",
  //   privilege: 0,
  //   cardno: "1"
  // })
  //     .then((result) => console.log("Create User:", result))
  //     .catch((error) => console.error("Create User Error:", error));
  // Example: Delete a user
  // deleteUserFromDevice("1111")
  //   .then((result) => console.log("Delete User:", result))
  //   .catch((error) => console.error("Delete User Error:", error));
  // Example: Bulk delete users
  // bulkDeleteUsers(["1230", "1231", "1232"])
  //     .then((result) => console.log("Bulk Delete:", result))
  //     .catch((error) => console.error("Bulk Delete Error:", error));
  // Example: Update a user
  // updateUserOnDevice({
  //   uid: 300,
  //   userId: "300",
  //   name: "Abdullah Qadir Ahmed",
  //   password: "",
  //   privilege: 0,
  //   cardno: ""
  // })
  //     .then((result) => console.log("Update User:", result))
  //     .catch((error) => console.error("Update User Error:", error));
  // Example: Get all users
  // getUsersFromDevice()
  //   .then((result) => console.log("Get Users:", result))
  //   .catch((error) => console.error("Get Users Error:", error));
}
