from flask import Flask, request, jsonify
from flask_cors import CORS
from zkteco_manager import ZKTecoManager
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize ZKTeco manager
zk_manager = ZKTecoManager()

@app.route('/api/zkteco/get-users', methods=['POST'])
def get_users():
    """Get all users from ZKTeco device"""
    try:
        result = zk_manager.get_users()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting users: {str(e)}",
            "users": []
        }), 500

@app.route('/api/zkteco/create-user', methods=['POST'])
def create_user():
    """Create a new user on ZKTeco device"""
    try:
        data = request.get_json()
        
        # Map React component data to ZKTeco format
        user_data = {
            "userId": data.get("userId"),
            "name": data.get("userName"),
            "password": data.get("password", ""),
            "privilege": data.get("privilege", 0),
            "cardNumber": data.get("cardNumber", "")
        }
        
        result = zk_manager.create_user(user_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error creating user: {str(e)}"
        }), 500

@app.route('/api/zkteco/update-user', methods=['POST'])
def update_user():
    """Update an existing user on ZKTeco device"""
    try:
        data = request.get_json()
        
        # Map React component data to ZKTeco format
        user_data = {
            "userId": data.get("userId"),
            "name": data.get("userName"),
            "password": data.get("password", ""),
            "privilege": data.get("privilege", 0),
            "cardNumber": data.get("cardNumber", "")
        }
        
        result = zk_manager.update_user(user_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error updating user: {str(e)}"
        }), 500

@app.route('/api/zkteco/delete-user', methods=['POST'])
def delete_user():
    """Delete a user from ZKTeco device"""
    try:
        data = request.get_json()
        user_id = data.get("userId")
        
        if not user_id:
            return jsonify({
                "success": False,
                "message": "User ID is required"
            }), 400
        
        result = zk_manager.delete_user(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error deleting user: {str(e)}"
        }), 500

@app.route('/api/zkteco/bulk-delete-users', methods=['POST'])
def bulk_delete_users():
    """Delete multiple users from ZKTeco device"""
    try:
        data = request.get_json()
        user_ids = data.get("userIds", [])
        
        if not user_ids:
            return jsonify({
                "success": False,
                "message": "User IDs are required"
            }), 400
        
        result = zk_manager.bulk_delete_users(user_ids)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error bulk deleting users: {str(e)}"
        }), 500

@app.route('/api/zkteco/bulk-create-users', methods=['POST'])
def bulk_create_users():
    """Create multiple users on ZKTeco device"""
    try:
        data = request.get_json()
        users_data = data.get("usersData", [])
        
        if not users_data:
            return jsonify({
                "success": False,
                "message": "Users data is required"
            }), 400
        
        result = zk_manager.bulk_create_users(users_data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error bulk creating users: {str(e)}"
        }), 500

@app.route('/api/zkteco/get-attendance', methods=['POST'])
def get_attendance():
    """Get attendance data from ZKTeco device"""
    try:
        result = zk_manager.get_attendance_data()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error getting attendance data: {str(e)}",
            "data": []
        }), 500

@app.route('/api/zkteco/sync-attendance', methods=['POST'])
def sync_attendance():
    """Sync attendance data to API server"""
    try:
        result = zk_manager.sync_attendance_to_api()
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error syncing attendance data: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "message": "ZKTeco API server is running"
    })

if __name__ == '__main__':
    print("Starting ZKTeco API server...")
    print("Available endpoints:")
    print("  POST /api/zkteco/get-users")
    print("  POST /api/zkteco/create-user")
    print("  POST /api/zkteco/update-user")
    print("  POST /api/zkteco/delete-user")
    print("  POST /api/zkteco/bulk-delete-users")
    print("  POST /api/zkteco/bulk-create-users")
    print("  POST /api/zkteco/get-attendance")
    print("  POST /api/zkteco/sync-attendance")
    print("  GET  /health")
    
    app.run(host='0.0.0.0', port=5000, debug=True)