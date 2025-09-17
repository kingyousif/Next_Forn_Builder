from zk import ZK
import json
import requests
from datetime import datetime, timedelta
import time
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
from functools import lru_cache

class OptimizedZKTecoManager:
    def __init__(self, device_ip: str = "172.17.0.133", device_port: int = 4370, timeout: int = 60):
        self.device_ip = device_ip
        self.device_port = device_port
        self.timeout = timeout
        self.conn = None
        self.api_base_url = "http://172.18.1.31:8000"
        self.max_retries = 3
        self.retry_delay = 1  # Reduced delay
        self._connection_lock = threading.Lock()
        self._user_cache = None
        self._cache_timestamp = None
        self._cache_ttl = 30  # Cache for 30 seconds
        
        # Pre-compiled status mapping for faster lookup
        self.status_mapping = {
            0: "Check-in",
            1: "Check-out", 
            2: "Break-out",
            3: "Break-in",
            4: "Overtime-in",
            5: "Overtime-out"
        }
        
    def connect(self) -> bool:
        """Optimized connection with thread safety"""
        with self._connection_lock:
            # If already connected and valid, return True
            if self.conn and hasattr(self.conn, 'is_connect') and self.conn.is_connect:
                try:
                    # Quick connection test
                    self.conn.get_device_name()
                    return True
                except:
                    self.disconnect()
                
            # Ensure clean state
            self.disconnect()
            
            for attempt in range(self.max_retries):
                try:
                    zk = ZK(self.device_ip, port=self.device_port, timeout=self.timeout, 
                           password=0, force_udp=False, ommit_ping=False)
                    self.conn = zk.connect()
                    
                    if self.conn and hasattr(self.conn, 'is_connect') and self.conn.is_connect:
                        return True
                        
                except Exception as e:
                    self.conn = None
                    if attempt < self.max_retries - 1:
                        time.sleep(self.retry_delay)
                        
            return False
    
    def disconnect(self):
        """Thread-safe disconnect"""
        if self.conn:
            try:
                if hasattr(self.conn, 'is_connect') and self.conn.is_connect:
                    self.conn.disconnect()
            except:
                pass
            finally:
                self.conn = None
    
    def _is_cache_valid(self) -> bool:
        """Check if user cache is still valid"""
        if self._cache_timestamp is None:
            return False
        return (time.time() - self._cache_timestamp) < self._cache_ttl
    
    def get_users_fast(self) -> Dict[str, Any]:
        """Ultra-fast user retrieval with caching"""
        try:
            # Use cache if valid
            if self._is_cache_valid() and self._user_cache:
                return {
                    "success": True,
                    "message": f"Retrieved {len(self._user_cache)} users from cache",
                    "count": len(self._user_cache),
                    "users": self._user_cache
                }
            
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "users": []}
            
            users = self.conn.get_users()
            
            # Optimized user list creation using list comprehension
            user_list = [{
                "uid": user.uid,
                "userId": user.user_id,
                "name": user.name,
                "privilege": user.privilege,
                "password": user.password,
                "group_id": user.group_id,
                "cardNumber": user.card
            } for user in users]
            
            # Update cache
            self._user_cache = user_list
            self._cache_timestamp = time.time()
            
            return {
                "success": True,
                "message": f"Retrieved {len(user_list)} users from device",
                "count": len(user_list),
                "users": user_list
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to get users: {str(e)}",
                "users": []
            }
        finally:
            self.disconnect()
    
    def get_attendance_data_fast(self) -> Dict[str, Any]:
        """Ultra-fast attendance data retrieval with optimizations"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "data": []}
            
            # Get users and attendance in parallel preparation
            users = self.conn.get_users()
            attendances = self.conn.get_attendance()
            
            # Create user dictionary for O(1) lookup
            user_dict = {user.user_id: user.name for user in users}
            
            # Optimized attendance processing using list comprehension
            attendance_data = []
            for attendance in attendances:
                timestamp = attendance.timestamp
                if timestamp:
                    timestamp = timestamp + timedelta(hours=3)
                
                attendance_data.append({
                    "uid": attendance.uid,
                    "user_name": user_dict.get(attendance.user_id, f"User {attendance.user_id}"),
                    "user_id": attendance.user_id,
                    "timestamp": timestamp.isoformat() if timestamp else None,
                    "status": self.status_mapping.get(attendance.punch, f"Unknown Status {attendance.punch}"),
                    "punch": attendance.punch
                })
            
            return {
                "success": True,
                "message": f"Retrieved {len(attendance_data)} attendance records",
                "count": len(attendance_data),
                "data": attendance_data
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Failed to get attendance data: {str(e)}",
                "data": []
            }
        finally:
            self.disconnect()
    
    def bulk_create_users_fast(self, users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Ultra-fast bulk user creation with parallel processing"""
        results = {
            "success": [],
            "failed": [],
            "summary": {"total": len(users_data), "successful": 0, "failed": 0}
        }
        
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "results": results}
            
            # Get existing users once
            existing_users = self.conn.get_users()
            existing_user_ids = {u.user_id for u in existing_users}  # Use set for O(1) lookup
            
            # Process users in batches for better performance
            batch_size = 10
            for i in range(0, len(users_data), batch_size):
                batch = users_data[i:i + batch_size]
                
                for user_data in batch:
                    try:
                        if str(user_data['userId']) in existing_user_ids:
                            results["failed"].append({
                                "userId": user_data['userId'],
                                "error": f"User with ID {user_data['userId']} already exists"
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
                        
                        # Add to existing set to prevent duplicates in same batch
                        existing_user_ids.add(str(user_data['userId']))
                        
                    except Exception as e:
                        results["failed"].append({
                            "userId": user_data['userId'],
                            "error": str(e)
                        })
                        results["summary"]["failed"] += 1
                
                # Small delay between batches
                if i + batch_size < len(users_data):
                    time.sleep(0.1)
            
            return {
                "success": results["summary"]["failed"] == 0,
                "message": f"Bulk create completed. {results['summary']['successful']} successful, {results['summary']['failed']} failed",
                "results": results
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Bulk create failed: {str(e)}",
                "results": results
            }
        finally:
            self.disconnect()
    
    def send_data_chunked(self, url: str, data: List[Dict], chunk_size: int = 100) -> Dict[str, Any]:
        """Send large datasets in chunks with parallel processing"""
        total_records = len(data)
        successful_records = 0
        failed_chunks = []
        
        def send_chunk(chunk_data, chunk_index):
            try:
                response = requests.post(url, json=chunk_data, timeout=30)
                if response.status_code == 200:
                    return len(chunk_data), None
                else:
                    return 0, f"Chunk {chunk_index}: HTTP {response.status_code}"
            except Exception as e:
                return 0, f"Chunk {chunk_index}: {str(e)}"
        
        # Process chunks in parallel
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = []
            
            for i in range(0, total_records, chunk_size):
                chunk = data[i:i + chunk_size]
                chunk_index = i // chunk_size
                future = executor.submit(send_chunk, chunk, chunk_index)
                futures.append(future)
            
            # Collect results
            for future in as_completed(futures):
                success_count, error = future.result()
                successful_records += success_count
                if error:
                    failed_chunks.append(error)
        
        return {
            "success": len(failed_chunks) == 0,
            "total_records": total_records,
            "successful_records": successful_records,
            "failed_chunks": failed_chunks,
            "message": f"Sent {successful_records}/{total_records} records successfully"
        }
    
    def sync_attendance_to_api_fast(self) -> Dict[str, Any]:
        """Ultra-fast attendance synchronization with parallel processing"""
        try:
            # Get attendance data
            attendance_result = self.get_attendance_data_fast()
            
            if not attendance_result["success"]:
                return attendance_result
            
            attendance_data = attendance_result["data"]
            
            if not attendance_data:
                return {
                    "success": True,
                    "message": "No attendance records found",
                    "count": 0
                }
            
            # Get user data for API
            users_result = self.get_users_fast()
            if users_result["success"]:
                user_attendance = [{
                    "name": user["name"],
                    "userId": user["userId"]
                } for user in users_result["users"]]
                
                # Send user data first (smaller dataset)
                if user_attendance:
                    user_response = requests.post(
                        f"{self.api_base_url}/attendanceUser/create",
                        json=user_attendance,
                        timeout=30
                    )
            
            # Send attendance data in optimized chunks
            attendance_result = self.send_data_chunked(
                f"{self.api_base_url}/attendance/create",
                attendance_data,
                chunk_size=200  # Larger chunks for better performance
            )
            
            return {
                "success": attendance_result["success"],
                "message": f"Sync completed: {attendance_result['message']}",
                "attendance_count": len(attendance_data),
                "details": attendance_result
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Sync failed: {str(e)}"
            }
    
    # Wrapper methods for backward compatibility
    def get_users(self) -> Dict[str, Any]:
        return self.get_users_fast()
    
    def get_attendance_data(self) -> Dict[str, Any]:
        return self.get_attendance_data_fast()
    
    def bulk_create_users(self, users_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        return self.bulk_create_users_fast(users_data)
    
    def sync_attendance_to_api(self) -> Dict[str, Any]:
        return self.sync_attendance_to_api_fast()
    
    # Keep existing methods for full compatibility
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user on the device"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device"}
            
            users = self.conn.get_users()
            existing_user = next((u for u in users if u.user_id == str(user_data['userId'])), None)
            
            if existing_user:
                return {
                    "success": False, 
                    "message": f"User with ID {user_data['userId']} already exists on device"
                }
            
            self.conn.set_user(
                uid=int(user_data.get('uid', user_data['userId'])),
                name=user_data['name'],
                privilege=int(user_data.get('privilege', 0)),
                password=user_data.get('password', ''),
                group_id=user_data.get('group_id', ''),
                user_id=str(user_data['userId']),
                card=int(user_data.get('cardNumber', 0)) if user_data.get('cardNumber') else 0
            )
            
            # Invalidate cache
            self._user_cache = None
            
            return {
                "success": True, 
                "message": f"User {user_data['name']} created successfully on device"
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to create user: {str(e)}"}
        finally:
            self.disconnect()
    
    def update_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing user on the device"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device"}
            
            users = self.conn.get_users()
            existing_user = next((u for u in users if u.user_id == str(user_data['userId'])), None)
            
            if not existing_user:
                return {
                    "success": False, 
                    "message": f"User with ID {user_data['userId']} not found on device"
                }
            
            self.conn.set_user(
                uid=existing_user.uid,
                name=user_data['name'],
                privilege=int(user_data.get('privilege', existing_user.privilege)),
                password=user_data.get('password', existing_user.password),
                group_id=user_data.get('group_id', existing_user.group_id),
                user_id=str(user_data['userId']),
                card=int(user_data.get('cardNumber', existing_user.card)) if user_data.get('cardNumber') else existing_user.card
            )
            
            # Invalidate cache
            self._user_cache = None
            
            return {
                "success": True, 
                "message": f"User {user_data['name']} updated successfully on device"
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to update user: {str(e)}"}
        finally:
            self.disconnect()
    
    def delete_user(self, user_id: str) -> Dict[str, Any]:
        """Delete a user from the device"""
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device"}
            
            users = self.conn.get_users()
            user_to_delete = next((u for u in users if u.user_id == str(user_id)), None)
            
            if not user_to_delete:
                return {
                    "success": False, 
                    "message": f"User with ID {user_id} not found on device"
                }
            
            self.conn.delete_user(uid=user_to_delete.uid)
            
            # Invalidate cache
            self._user_cache = None
            
            return {
                "success": True, 
                "message": f"User with ID {user_id} deleted successfully from device"
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to delete user: {str(e)}"}
        finally:
            self.disconnect()
    
    def bulk_delete_users(self, user_ids: List[str]) -> Dict[str, Any]:
        """Delete multiple users from the device"""
        results = {
            "success": [],
            "failed": [],
            "summary": {"total": len(user_ids), "successful": 0, "failed": 0}
        }
        
        try:
            if not self.connect():
                return {"success": False, "message": "Failed to connect to device", "results": results}
            
            all_users = self.conn.get_users()
            user_dict = {u.user_id: u for u in all_users}  # O(1) lookup
            
            for user_id in user_ids:
                try:
                    user_to_delete = user_dict.get(str(user_id))
                    
                    if not user_to_delete:
                        results["failed"].append({
                            "userId": user_id,
                            "error": f"User with ID {user_id} not found on device"
                        })
                        results["summary"]["failed"] += 1
                        continue
                    
                    self.conn.delete_user(uid=user_to_delete.uid)
                    
                    results["success"].append({
                        "userId": user_id,
                        "message": f"User with ID {user_id} deleted successfully"
                    })
                    results["summary"]["successful"] += 1
                    
                except Exception as e:
                    results["failed"].append({
                        "userId": user_id,
                        "error": str(e)
                    })
                    results["summary"]["failed"] += 1
            
            # Invalidate cache
            self._user_cache = None
            
            return {
                "success": results["summary"]["failed"] == 0,
                "message": f"Bulk delete completed. {results['summary']['successful']} successful, {results['summary']['failed']} failed",
                "results": results
            }
            
        except Exception as e:
            return {
                "success": False,
                "message": f"Bulk delete failed: {str(e)}",
                "results": results
            }
        finally:
            self.disconnect()