import json
from zk import ZK, const

# Configuration
device_ip = '172.17.0.133'  # Replace with your device's IP address
port = 4370                   # Default port for ZKTeco devices

# Status code mapping
status_mapping = {
    25: 'Check-in',
    1: 'Check-out',
    2: 'Break-out',
    3: 'Break-in',
    4: 'Overtime-in',
    5: 'Overtime-out',
    15: 'Undefined'  # Adjust this based on your device's configuration
}

# Connect to the device
zk = ZK(device_ip, port=port, timeout=5)
conn = None

try:
    conn = zk.connect()
    conn.disable_device()
    print("Connected to device.")

    # Retrieve all users
    users = conn.get_users()
    user_dict = {user.user_id: user.name for user in users}

    # Retrieve attendance records
    attendance = conn.get_attendance()
    attendance_data = []

    for record in attendance:
        user_name = user_dict.get(str(record.user_id), f"User {record.user_id}")
        status = status_mapping.get(record.status, f"Unknown Status {record.status}")
        attendance_data.append({
            'user_name': user_name,
            'timestamp': record.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'status': status
        })

    # Output data in JSON format
    json_output = json.dumps(attendance_data, indent=4)
    print(json_output)

    # Optionally, save to a file
    with open('attendance_records.json', 'w') as file:
        file.write(json_output)

    conn.enable_device()
except Exception as e:
    print(f"Process terminated: {e}")
finally:
    if conn:
        conn.disconnect()
