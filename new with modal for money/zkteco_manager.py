from zk import ZK
import json
import requests
from datetime import datetime, timedelta
import time
from typing import List, Dict, Any, Optional

class ZKTecoManager:
    def __init__(self, device_ip: str = "172.17.0.133", device_port: int = 4370, timeout: int = 60):
        self.device_ip = device_ip
        self.device_port = device_port
        self.timeout = timeout
        self.conn = None
        self.api_base_url = "http://172.18.1.31:8000"
        self.max_retries = 3
        self.retry_delay = 2
        
    def connect(self) -> bool:
        """Connect to ZKTeco device with retry logic"""
        # If already connected and valid, return True
        if self.conn and hasattr(self.conn, 'is_connect') and self.conn.is_connect:
            try:
                # Test connection by getting device info
                self.conn.get_device_name()
                return True
            except:
                # Connection is stale, disconnect and reconnect
                self.disconnect()
            
        # Ensure clean state
        self.disconnect()
        
        for attempt in range(self.max_retries):
            try:
                print(f"Connection attempt {attempt + 1}/{self.max_retries}")
                zk = ZK(self.device_ip, port=self.device_port, timeout=self.timeout, 
                       password=0, force_udp=False, ommit_ping=False)
                self.conn = zk.connect()
                
                if self.conn and hasattr(self.conn, 'is_connect') and self.conn.is_connect:
                    print(f"Connected to ZKTeco device at {self.device_ip}:{self.device_port}")
                    return True
                    
            except Exception as e:
                print(f"Connection attempt {attempt + 1} failed: {str(e)}")
                self.conn = None
                
                if attempt < self.max_retries - 1:
                    print(f"Retrying in {self.retry_delay} seconds...")
                    time.sleep(self.retry_delay)
                    
        print("All connection attempts failed")
        return False
    
    def disconnect(self):
        """Safely disconnect from ZKTeco device"""
        if self.conn:
            try:
                if hasattr(self.conn, 'is_connect') and self.conn.is_connect:
                    self.conn.disconnect()
                    print("Disconnected from ZKTeco device")
            except Exception as e:
                print(f"Error during disconnect: {str(e)}")
            finally:
                self.conn = None
    
    def _execute_with_retry(self, operation_name: str, operation_func):
        """Execute an operation with retry logic"""
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                if not self.connect():
                    raise Exception("Failed to establish connection")
                    
                result = operation_func()
                return result
                
            except Exception as e:
                last_exception = e
                print(f"{operation_name} attempt {attempt + 1} failed: {str(e)}")
                self.disconnect()  # Clean up connection
                
                if attempt < self.max_retries - 1:
                    print(f"Retrying {operation_name} in {self.retry_delay} seconds...")
                    time.sleep(self.retry_delay)
                    
        raise last_exception

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user on the device"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device"}
            
            # Check if user already exists
            users = self.conn.get_users()
            existing_user = next((u for u in users if u.user_id == str(user_data['userId'])), None)
            
            if existing_user:
                self.disconnect()
                return {
                    "success": False, 
                    "message": f"User with ID {user_data['userId']} already exists on device"
                }
            
            # Create user
            self.conn.set_user(
                uid=int(user_data.get('uid', user_data['userId'])),
                name=user_data['name'],
                privilege=int(user_data.get('privilege', 0)),
                password=user_data.get('password', ''),
                group_id=user_data.get('group_id', ''),
                user_id=str(user_data['userId']),
                card=int(user_data.get('cardNumber', 0)) if user_data.get('cardNumber') else 0
            )
            
            self.disconnect()
            return {
                "success": True, 
                "message": f"User {user_data['name']} created successfully on device"
            }
            
        except Exception as e:
            self.disconnect()
            return {"success": False, "message": f"Failed to create user: {str(e)}"}
    
    def update_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing user on the device without deleting biometric data"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device"}
            
            # Check if user exists
            users = self.conn.get_users()
            existing_user = next((u for u in users if u.user_id == str(user_data['userId'])), None)
            
            if not existing_user:
                self.disconnect()
                return {
                    "success": False, 
                    "message": f"User with ID {user_data['userId']} not found on device"
                }
            
            # Update user directly using set_user with existing UID
            # This preserves fingerprint and face data
            self.conn.set_user(
                uid=existing_user.uid,  # Use existing UID to update, not create new
                name=user_data['name'],
                privilege=int(user_data.get('privilege', existing_user.privilege)),
                password=user_data.get('password', existing_user.password),
                group_id=user_data.get('group_id', existing_user.group_id),
                user_id=str(user_data['userId']),
                card=int(user_data.get('cardNumber', existing_user.card)) if user_data.get('cardNumber') else existing_user.card
            )
            
            self.disconnect()
            return {
                "success": True, 
                "message": f"User {user_data['name']} updated successfully on device (biometric data preserved)"
            }
            
        except Exception as e:
            self.disconnect()
            return {"success": False, "message": f"Failed to update user: {str(e)}"}
    
    def delete_user(self, user_id: str) -> Dict[str, Any]:
        """Delete a user from the device"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device"}
            
            # Find user by user_id
            users = self.conn.get_users()
            user_to_delete = next((u for u in users if u.user_id == str(user_id)), None)
            
            if not user_to_delete:
                self.disconnect()
                return {
                    "success": False, 
                    "message": f"User with ID {user_id} not found on device"
                }
            
            # Delete user using UID
            self.conn.delete_user(uid=user_to_delete.uid)
            
            self.disconnect()
            return {
                "success": True, 
                "message": f"User with ID {user_id} deleted successfully from device"
            }
            
        except Exception as e:
            self.disconnect()
            return {"success": False, "message": f"Failed to delete user: {str(e)}"}
    
    def bulk_delete_users(self, user_ids: List[str]) -> Dict[str, Any]:
        """Delete multiple users from the device"""
        results = {
            "success": [],
            "failed": [],
            "summary": {
                "total": len(user_ids),
                "successful": 0,
                "failed": 0
            }
        }
        
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "results": results}
            
            # Get all users from device
            all_users = self.conn.get_users()
            print(f"Retrieved {len(all_users)} users from device")
            
            for user_id in user_ids:
                try:
                    # Find user by user_id
                    user_to_delete = next((u for u in all_users if u.user_id == str(user_id)), None)
                    
                    if not user_to_delete:
                        results["failed"].append({
                            "userId": user_id,
                            "error": f"User with ID {user_id} not found on device"
                        })
                        results["summary"]["failed"] += 1
                        continue
                    
                    # Delete user using UID
                    self.conn.delete_user(uid=user_to_delete.uid)
                    
                    results["success"].append({
                        "userId": user_id,
                        "message": f"User with ID {user_id} deleted successfully"
                    })
                    results["summary"]["successful"] += 1
                    
                    print(f"Successfully deleted user {user_id}")
                    time.sleep(0.5)  # Small delay between deletions
                    
                except Exception as e:
                    print(f"Error deleting user {user_id}: {str(e)}")
                    results["failed"].append({
                        "userId": user_id,
                        "error": str(e)
                    })
                    results["summary"]["failed"] += 1
            
            self.disconnect()
            
            return {
                "success": results["summary"]["failed"] == 0,
                "message": f"Bulk delete completed. {results['summary']['successful']} successful, {results['summary']['failed']} failed",
                "results": results
            }
            
        except Exception as e:
            self.disconnect()
            return {
                "success": False,
                "message": f"Bulk delete failed: {str(e)}",
                "results": results
            }
    
    def bulk_create_users(self, users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create multiple users on the device"""
        results = {
            "success": [],
            "failed": [],
            "summary": {
                "total": len(users_data),
                "successful": 0,
                "failed": 0
            }
        }
        
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "results": results}
            
            # Get existing users to check for duplicates
            existing_users = self.conn.get_users()
            existing_user_ids = [u.user_id for u in existing_users]
            
            for user_data in users_data:
                try:
                    # Check if user already exists
                    if str(user_data['userId']) in existing_user_ids:
                        results["failed"].append({
                            "userId": user_data['userId'],
                            "error": f"User with ID {user_data['userId']} already exists on device"
                        })
                        results["summary"]["failed"] += 1
                        continue
                    
                    # Create user
                    self.conn.set_user(
                        uid=int(user_data.get('uid', user_data['userId'])),
                        name=user_data['name'],
                        privilege=int(user_data.get('privilege', 0)),
                        password=user_data.get('password', ''),
                        group_id=user_data.get('group_id', ''),
                        user_id=str(user_data['userId']),
                        card=int(user_data.get('cardNumber', 0)) if user_data.get('cardNumber') else 0
                    )
                    
                    results["success"].append({
                        "userId": user_data['userId'],
                        "message": f"User {user_data['name']} created successfully"
                    })
                    results["summary"]["successful"] += 1
                    
                    print(f"Successfully created user {user_data['userId']}")
                    time.sleep(0.5)  # Small delay between creations
                    
                except Exception as e:
                    print(f"Error creating user {user_data['userId']}: {str(e)}")
                    results["failed"].append({
                        "userId": user_data['userId'],
                        "error": str(e)
                    })
                    results["summary"]["failed"] += 1
            
            self.disconnect()
            
            return {
                "success": results["summary"]["failed"] == 0,
                "message": f"Bulk create completed. {results['summary']['successful']} successful, {results['summary']['failed']} failed",
                "results": results
            }
            
        except Exception as e:
            self.disconnect()
            return {
                "success": False,
                "message": f"Bulk create failed: {str(e)}",
                "results": results
            }
    
    def get_users(self) -> Dict[str, Any]:
        """Get all users from the device"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "users": []}
            
            users = self.conn.get_users()
            user_list = []
            
            for user in users:
                user_list.append({
                    "uid": user.uid,
                    "userId": user.user_id,
                    "name": user.name,
                    "privilege": user.privilege,
                    "password": user.password,
                    "group_id": user.group_id,
                    "cardNumber": user.card
                })
            
            self.disconnect()
            
            return {
                "success": True,
                "message": f"Retrieved {len(user_list)} users from device",
                "count": len(user_list),
                "users": user_list
            }
            
        except Exception as e:
            self.disconnect()
            return {
                "success": False,
                "message": f"Failed to get users: {str(e)}",
                "users": []
            }
    
    def get_attendance_data(self) -> Dict[str, Any]:
        """Get attendance records from the device with retry logic"""
        def _get_attendance():
            # Get users for name mapping
            users = self.conn.get_users()
            user_dict = {user.user_id: user.name for user in users}
            
            # Get attendance records
            attendances = self.conn.get_attendance()
         
            attendance_data = []
            
            status_mapping = {
                0: "Check-in",
                1: "Check-out",
                2: "Break-out",
                3: "Break-in",
                4: "Overtime-in",
                5: "Overtime-out"
            }
            
            for attendance in attendances:
                # Print first 3 attendance records for debugging
                if attendances.index(attendance) < 3:
                    print(f"Raw attendance data:")
                    print(f"  User ID: {attendance.user_id}")
                    print(f"  Status: {attendance.status}")
                    print(f"  Time: {attendance.timestamp}")
                    print(f"  Punch: {attendance.punch}")
                    print(f"  Punch Type: {type(attendance.punch)}")
                    print(f"  Raw Attendance Object:")
                    for attr in dir(attendance):
                        if not attr.startswith('_'):  # Only show public attributes
                            print(f"    {attr}: {getattr(attendance, attr)}")
                    print("------------------------")
                user_name = user_dict.get(attendance.user_id, f"User {attendance.user_id}")
                status = status_mapping.get(attendance.punch, f"Unknown Status {attendance.punch}")
                
                # Fix timezone adjustment using timedelta to avoid hour overflow
                timestamp = attendance.timestamp
                uid = attendance.uid
                if timestamp:
                    # Add 3 hours using timedelta to handle day/hour overflow properly
                    timestamp = timestamp + timedelta(hours=3)
                
                attendance_data.append({
                    "uid": uid,
                    "user_name": user_name,
                    "user_id": attendance.user_id,
                    "timestamp": timestamp.isoformat() if timestamp else None,
                    "status": status,
                    "punch": attendance.punch
                })
            
            return {
                "success": True,
                "message": f"Retrieved {len(attendance_data)} attendance records",
                "count": len(attendance_data),
                "data": attendance_data
            }
        
        try:
            result = self._execute_with_retry("get_attendance_data", _get_attendance)
            return result
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to get attendance data: {str(e)}",
                "data": []
            }
        finally:
            self.disconnect()  # Always clean up
    
    def sync_attendance_to_api(self) -> Dict[str, Any]:
        """Get attendance data and send to API with improved error handling"""
        try:
            print("Starting attendance sync...")
            
            # Get attendance data with retry logic
            attendance_result = self.get_attendance_data()
            print(f"Attendance fetch result: {attendance_result['success']}")
            print("Sample attendance data:")
            if attendance_result['success'] and attendance_result.get('data'):
                for i, record in enumerate(attendance_result['data'][:3]):
                    print(f"  Record {i+1}: User: {record['user_name']}, "
                          f"Time: {record['timestamp']}, Status: {record['status']}")
                if len(attendance_result['data']) > 3:
                    print(f"  ... and {len(attendance_result['data']) - 3} more records")
            else:
                print("  No attendance data available")
            
            
            if not attendance_result["success"]:
                return attendance_result
            
            attendance_data = attendance_result["data"]
            
            if not attendance_data:
                return {
                    "success": True,
                    "message": "No attendance records found",
                    "count": 0
                }
            
            print(f"Retrieved {len(attendance_data)} attendance records")
            
            # Get user data separately with retry logic
            def _get_users():
                users = self.conn.get_users()
                return [{
                    "name": user.name,
                    "userId": user.user_id
                } for user in users]
            
            try:
                user_attendance = self._execute_with_retry("get_users_for_sync", _get_users)
                
                # Send user data first
                if user_attendance:
                    try:
                        response = requests.post(
                            f"{self.api_base_url}/attendanceUser/create",
                            json=user_attendance,
                            headers={"Content-Type": "application/json"},
                            timeout=30
                        )
                        print(f"User data sent successfully. Status: {response.status_code}")
                    except Exception as e:
                        print(f"Error sending user data: {str(e)}")
                        # Continue with attendance data even if user data fails
                
            except Exception as e:
                print(f"Error getting users for sync: {str(e)}")
                # Continue with attendance data even if user data fails
            
            # Send attendance data
            try:
                print("Sending attendance data to API...")
                print(f"Total records to send: {len(attendance_data)}")
                print("Sample attendance data (first 3 records):")
                for i, record in enumerate(attendance_data[:3]):
                    print(f"  Record {i+1}: {record}")
                
                if len(attendance_data) > 3:
                    print(f"  ... and {len(attendance_data) - 3} more records")
                
                # print("Full attendance data structure:")
                # print(json.dumps(attendance_data, indent=2, default=str))
                
                response = requests.post(
                    f"{self.api_base_url}/attendance/create",
                    json=attendance_data,
                    headers={"Content-Type": "application/json"},
                    timeout=3000
                )
                
                print(f"Attendance data sent. Status: {response.status_code}")
                
                return {
                    "success": True,
                    "message": f"Attendance data sent successfully. Status: {response.status_code}",
                    "count": len(attendance_data),
                    "data": response.json() if response.content else None
                }
                
            except Exception as e:
                print(f"Error sending attendance data: {str(e)}")
                return {
                    "success": False,
                    "message": f"Failed to send attendance data to server: {str(e)}",
                    "data": attendance_data
                }
            
        except Exception as e:
            print(f"Sync error: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to sync attendance data: {str(e)}"
            }
        
        finally:
            # Ensure connection is always cleaned up
            self.disconnect()

# Example usage and testing
if __name__ == "__main__":
    zk_manager = ZKTecoManager()
    
    # Test connection
    # print("Testing connection...")
    # result = zk_manager.get_users()
    # print(json.dumps(result, indent=2))
    
    # Test delete user
    print("Testing delete user...")
    result = zk_manager.delete_user("1111")
    print(json.dumps(result, indent=2))