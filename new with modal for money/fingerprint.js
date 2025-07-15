const ZKLib = require('./zklib')

// Device connection parameters from the image
const deviceIP = '172.17.0.133';
const devicePort = 4370;
const deviceID = 2;  // Device ID from the image
const deviceModel = 'Face850 Plus';  // Model from the image

// Create an instance of ZKLib directly
const zk = new ZKLib({
  ip: deviceIP,
  port: devicePort,
  inport: 5200,  // Default inport
  timeout: 5000  // 5 seconds timeout
});

async function connectToDevice() {
  try {
    console.log(`Attempting to connect to ${deviceModel} at ${deviceIP}:${devicePort}...`);
    
    // Connect to the device
    const conn = await zk.connect();
    if (conn) {
      console.log('Connection successful!');
      
      // Get device information
      console.log('Getting device information...');
      
      try {
        const deviceVersion = await zk.getDeviceVersion();
        console.log(`Device Version: ${deviceVersion}`);
      } catch (e) {
        console.log('Could not get device version:', e.message);
      }
      
      try {
        const serialNumber = await zk.getSerialNumber();
        console.log(`Serial Number: ${serialNumber}`);
      } catch (e) {
        console.log('Could not get serial number:', e.message);
      }
      
      try {
        const deviceInfo = await zk.getInfo();
        console.log('Device Information:', deviceInfo);
      } catch (e) {
        console.log('Could not get device info:', e.message);
      }
      
      return true;
    } else {
      console.log('Connection failed!');
      return false;
    }
  } catch (error) {
    console.error('Connection failed:', error);
    return false;
  }
}

async function getAttendanceLogs() {
  try {
    console.log('Retrieving attendance records...');
    
    // Get attendance logs
    const attendanceData = await zk.getAttendance();
    
    if (attendanceData && attendanceData.length > 0) {
      console.log('Attendance Records:');
      attendanceData.forEach(record => {
        console.log(`User ID: ${record.uid}, Time: ${record.timestamp}`);
      });
      return attendanceData;
    } else {
      console.log('No attendance records found');
      return [];
    }
  } catch (error) {
    console.error('Failed to retrieve attendance logs:', error);
    return null;
  }
}

async function getUsers() {
  try {
    console.log('Retrieving user data...');
    
    // Get users from the device
    const users = await zk.getUsers();
    
    if (users && users.length > 0) {
      console.log('Users:');
      users.forEach(user => {
        console.log(`ID: ${user.uid}, Name: ${user.name || 'N/A'}`);
      });
      return users;
    } else {
      console.log('No users found');
      return [];
    }
  } catch (error) {
    console.error('Failed to retrieve users:', error);
    return null;
  }
}

async function disconnect() {
  try {
    await zk.disconnect();
    console.log('Disconnected from device');
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
}

async function main() {
  try {
    const connected = await connectToDevice();
    
    if (connected) {
      // Example operations - uncomment as needed
      await getUsers();
      await getAttendanceLogs();
      
      // Add more operations here as needed
      
      // Always disconnect when done
      await disconnect();
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();