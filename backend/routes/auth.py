from flask import Blueprint, request, session
import re
from ..models import UserModel
from ..api_utils import success_response, error_response

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    confirm_password = data.get("confirm_password") or ""

    if not name:
        return error_response("Full name is required", 400)
    if not email:
        return error_response("Email address is required", 400)
    if not re.match(EMAIL_REGEX, email):
        return error_response("Please enter a valid email address", 400)
    if not password:
        return error_response("Password is required", 400)
    if len(password) < 6:
        return error_response("Password must be at least 6 characters", 400)
    if password != confirm_password:
        return error_response("Passwords do not match", 400)

    # Check duplicate
    existing = UserModel.get_by_email(email)
    if existing:
        return error_response("An account with this email address already exists", 409)

    created_user = UserModel.create({
        "name": name,
        "email": email,
        "password": password,
        "role": data.get("role", "Examinations Officer"),
        "department": data.get("department", "Office of Academic Affairs")
    })

    return success_response(created_user, "Account created successfully", 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("Email and password are required", 400)

    user = UserModel.get_by_email(email)
    if not user:
        return error_response("Invalid email or password", 401)

    # Verify password hash
    if not UserModel.verify_password(user["password_hash"], password):
        return error_response("Invalid email or password", 401)

    # Remove password hash from response
    user_data = dict(user)
    user_data.pop("password_hash", None)

    # Store in flask session if cookies are used
    session["user_id"] = user_data["id"]

    return success_response({
        "user": user_data,
        "token": f"smartseat_jwt_{user_data['id']}"
    }, "Logged in successfully")


@auth_bp.route("/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return error_response("Not authenticated", 401)
    user = UserModel.get_by_id(user_id)
    if not user:
        return error_response("User not found", 404)
    user.pop("password_hash", None)
    return success_response(user)


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return success_response(None, "Logged out successfully")
