import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from db_connection import get_collection

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345-campus-maintenance")

class AuthService:
    @staticmethod
    def get_user_by_email(email):
        """
        Retrieves a user document from MongoDB by email.
        """
        if not email:
            return None
        users_col = get_collection("users")
        return users_col.find_one({"email": email.strip().lower()})

    @staticmethod
    def get_user_by_roll_number(roll_number):
        """
        Retrieves a user document from MongoDB by roll number.
        """
        if not roll_number:
            return None
        users_col = get_collection("users")
        return users_col.find_one({"roll_number": roll_number.strip().upper()})

    @staticmethod
    def hash_password(password):
        """
        Hashes password with bcrypt.
        """
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain_password, hashed_password):
        """
        Verifies plain text password against bcrypt hashed password.
        """
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def create_student_user(name, roll_number, email, plain_password, phone, department, year):
        """
        Inserts a new student user document into MongoDB Atlas.
        """
        users_col = get_collection("users")
        hashed_pw = AuthService.hash_password(plain_password)
        now = datetime.now(timezone.utc)

        new_user = {
            "name": name.strip(),
            "roll_number": roll_number.strip().upper(),
            "email": email.strip().lower(),
            "password": hashed_pw,
            "phone": phone.strip(),
            "department": department.strip(),
            "year": year.strip(),
            "role": "student",
            "profile_image": "",
            "created_at": now,
            "updated_at": now,
            "created_by": None,
            "updated_by": None
        }

        result = users_col.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return new_user

    @staticmethod
    def reset_password(email, new_password):
        """
        Resets user's password in MongoDB Atlas.
        """
        users_col = get_collection("users")
        user = users_col.find_one({"email": email.strip().lower()})
        if not user:
            return False, "No account found with this email address"

        hashed_pw = AuthService.hash_password(new_password)
        users_col.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password": hashed_pw,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        return True, "Password reset successfully"

    @staticmethod
    def update_profile(user_id, name=None, phone=None, department=None, year=None, profile_image=None, notifications=None):
        users_col = get_collection("users")
        oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else None
        if not oid:
            return False, "Invalid user identifier", None

        user = users_col.find_one({"_id": oid})
        if not user:
            return False, "User account not found", None

        update_doc = {"updated_at": datetime.now(timezone.utc)}
        if name is not None: update_doc["name"] = name.strip()
        if phone is not None: update_doc["phone"] = phone.strip()
        if department is not None: update_doc["department"] = department.strip()
        if year is not None: update_doc["year"] = year.strip()
        if profile_image is not None: update_doc["profile_image"] = profile_image
        if notifications is not None: update_doc["notifications"] = notifications

        users_col.update_one({"_id": oid}, {"$set": update_doc})
        updated_user = users_col.find_one({"_id": oid})
        return True, "Profile updated successfully", updated_user

    @staticmethod
    def change_password(user_id, current_password, new_password):
        users_col = get_collection("users")
        oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else None
        if not oid:
            return False, "Invalid user identifier"

        user = users_col.find_one({"_id": oid})
        if not user:
            return False, "User account not found"

        if not AuthService.verify_password(current_password, user.get("password", "")):
            return False, "Current password is incorrect"

        hashed_pw = AuthService.hash_password(new_password)
        users_col.update_one(
            {"_id": oid},
            {"$set": {"password": hashed_pw, "updated_at": datetime.now(timezone.utc)}}
        )
        return True, "Password updated successfully"

    @staticmethod
    def generate_jwt_token(user_doc):
        """
        Generates JWT token valid for 24 hours.
        """
        payload = {
            "id": str(user_doc["_id"]),
            "email": user_doc["email"],
            "role": user_doc["role"],
            "name": user_doc["name"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
