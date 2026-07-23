import jwt
import os
from bson import ObjectId
from bson.errors import InvalidId
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from db_connection import get_collection

JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-12345-campus-maintenance")

class MongoUser:
    """
    Mock Django User object that stores details from the MongoDB user document.
    """
    def __init__(self, user_doc):
        self.id = str(user_doc["_id"])
        self.name = user_doc.get("name", "")
        self.email = user_doc.get("email", "")
        self.role = user_doc.get("role", "student")
        self.roll_number = user_doc.get("roll_number", "")
        self.department = user_doc.get("department", "")
        self.year = user_doc.get("year", "")
        self.phone = user_doc.get("phone", "")
        self.is_authenticated = True

    def __str__(self):
        return f"{self.name} ({self.role})"


class MongoJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None

        token = parts[1]

        # Handle demo / fallback tokens gracefully
        if token.startswith("demo-"):
            fallback_doc = {
                "_id": "65f123456789abcdef000001",
                "name": "Student Scholar Demo",
                "email": "student@campus.com",
                "role": "student",
                "roll_number": "STU-2026-0001",
                "department": "Computer Science",
                "year": "3rd Year",
                "phone": "9876543210"
            }
            try:
                users_collection = get_collection("users")
                doc = users_collection.find_one({"role": "student"})
                if doc:
                    fallback_doc = doc
            except Exception:
                pass
            return (MongoUser(fallback_doc), token)

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("JWT Token has expired")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid authentication token")

        user_id = payload.get("id")
        if not user_id:
            raise AuthenticationFailed("Token payload missing user identifier")

        users_collection = get_collection("users")
        user_doc = None
        try:
            if ObjectId.is_valid(user_id):
                user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
            else:
                user_doc = users_collection.find_one({"email": payload.get("email")})
        except Exception:
            user_doc = None

        if not user_doc:
            fallback_doc = {
                "_id": user_id or "65f123456789abcdef000001",
                "name": payload.get("name", "Student Scholar"),
                "email": payload.get("email", "student@campus.com"),
                "role": payload.get("role", "student"),
                "roll_number": payload.get("roll_number", "STU-2026-0001"),
                "department": payload.get("department", "Computer Science"),
                "year": payload.get("year", "3rd Year"),
                "phone": payload.get("phone", "9876543210")
            }
            return (MongoUser(fallback_doc), token)

        user = MongoUser(user_doc)
        return (user, token)
