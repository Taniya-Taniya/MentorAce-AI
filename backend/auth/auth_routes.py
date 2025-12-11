from flask import Blueprint, request, jsonify
from auth.user_model import UserModel
import sqlite3

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        
        # Validate required fields
        if not data or not all(key in data for key in ["name", "email", "password", "role"]):
            return jsonify({"error": "Missing required fields: name, email, password, role"}), 400
        
        # Validate email format (basic check)
        if "@" not in data["email"] or "." not in data["email"]:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Validate role
        if data["role"] not in ["mentor", "institution"]:
            return jsonify({"error": "Role must be 'mentor' or 'institution'"}), 400
        
        # Validate password length
        if len(data["password"]) < 3:
            return jsonify({"error": "Password must be at least 3 characters"}), 400
        
        UserModel.create_user(
            data["name"], data["email"], data["password"], data["role"]
        )
        return jsonify({"message": "Signup successful"})
    
    except sqlite3.IntegrityError as e:
        if "UNIQUE constraint" in str(e) or "email" in str(e).lower():
            return jsonify({"error": "Email already exists. Please use a different email or login."}), 400
        return jsonify({"error": f"Database error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Signup failed: {str(e)}"}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        
        # Validate required fields
        if not data or not all(key in data for key in ["email", "password"]):
            return jsonify({"error": "Missing email or password"}), 400
        
        user = UserModel.get_user(data["email"])

        if not user or user["password"] != data["password"]:
            return jsonify({"error": "Invalid email or password"}), 400

        return jsonify({"message": "Login successful", "role": user["role"]})
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500
