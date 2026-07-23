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
