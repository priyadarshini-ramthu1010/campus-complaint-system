import datetime
import bcrypt
from datetime import timezone
from bson import ObjectId
from db_connection import get_collection

class UserService:
    @staticmethod
    def get_user_by_email(email):
        if not email:
            return None
        users_col = get_collection("users")
        admins_col = get_collection("admins")
        user = users_col.find_one({"email": email.strip().lower()})
        if not user:
            user = admins_col.find_one({"email": email.strip().lower()})
        return user

    @staticmethod
    def get_admin_by_employee_id(employee_id):
        if not employee_id:
            return None
        users_col = get_collection("users")
        admins_col = get_collection("admins")
        user = users_col.find_one({"employee_id": employee_id.strip().upper()})
        if not user:
            user = admins_col.find_one({"employee_id": employee_id.strip().upper()})
        return user

    @staticmethod
    def create_staff_user(name, email, plain_password, phone, department, created_by_id):
        """
        Registers a new staff user.
        """
        users_col = get_collection("users")
        hashed_pw = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        now = datetime.datetime.now(timezone.utc)

        new_staff = {
            "name": name.strip(),
            "roll_number": None,
            "employee_id": f"STF-{int(now.timestamp()) % 10000}",
            "email": email.strip().lower(),
            "password": hashed_pw,
            "phone": phone.strip(),
            "department": department.strip(),
            "year": "N/A",
            "role": "staff",
            "status": "active",
            "profile_image": "",
            "created_at": now,
            "updated_at": now,
            "created_by": ObjectId(created_by_id) if created_by_id else None,
            "updated_by": ObjectId(created_by_id) if created_by_id else None
        }

        users_col.insert_one(new_staff)
        return new_staff

    @staticmethod
    def create_admin_user(name, employee_id, department, phone, email, plain_password, role="admin", status="active", created_by_name="Super Admin"):
        """
        Registers a new Admin or Super Admin user.
        """
        users_col = get_collection("users")
        admins_col = get_collection("admins")
        hashed_pw = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        now = datetime.datetime.now(timezone.utc)

        admin_doc = {
            "name": name.strip(),
            "employee_id": employee_id.strip().upper(),
            "department": department.strip(),
            "phone": phone.strip(),
            "email": email.strip().lower(),
            "password": hashed_pw,
            "role": role if role in ["super_admin", "admin"] else "admin",
            "status": status if status in ["active", "inactive"] else "active",
            "profile_image": "",
            "created_by": created_by_name,
            "created_at": now,
            "updated_at": now
        }

        # Save to both admins and users collection for unified authentication
        admins_col.insert_one(dict(admin_doc))
        users_col.insert_one(dict(admin_doc))
        return admin_doc

    @staticmethod
    def list_users(role=None):
        """
        Retrieves users filtered optionally by role.
        """
        users_col = get_collection("users")
        query = {}
        if role:
            if role in ["admin", "super_admin"]:
                query["role"] = {"$in": ["admin", "super_admin"]}
            else:
                query["role"] = role

        cursor = users_col.find(query).sort("created_at", -1)
        results = []
        seen_emails = set()
        for doc in cursor:
            email = doc.get("email")
            if email in seen_emails:
                continue
            seen_emails.add(email)

            doc["id"] = str(doc["_id"])
            doc["_id"] = str(doc["_id"])
            for key, val in doc.items():
                if isinstance(val, ObjectId):
                    doc[key] = str(val)
                elif isinstance(val, datetime.datetime):
                    doc[key] = val.isoformat()
            doc.pop("password", None)
            results.append(doc)
        return results

    @staticmethod
    def update_admin_status(user_id, status_val):
        """
        Enables or Disables an Admin account.
        """
        users_col = get_collection("users")
        admins_col = get_collection("admins")
        oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else None
        if not oid:
            return False, "Invalid Admin ID"

        user = users_col.find_one({"_id": oid})
        if not user:
            user = admins_col.find_one({"_id": oid})
            if not user:
                return False, "Admin account not found"

        email = user.get("email")
        users_col.update_many({"email": email}, {"$set": {"status": status_val, "updated_at": datetime.datetime.now(timezone.utc)}})
        admins_col.update_many({"email": email}, {"$set": {"status": status_val, "updated_at": datetime.datetime.now(timezone.utc)}})
        return True, f"Admin status updated to {status_val}"

    @staticmethod
    def reset_admin_password(user_id, new_password):
        """
        Resets an Admin's password.
        """
        users_col = get_collection("users")
        admins_col = get_collection("admins")
        oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else None
        if not oid:
            return False, "Invalid Admin ID"

        user = users_col.find_one({"_id": oid}) or admins_col.find_one({"_id": oid})
        if not user:
            return False, "Admin account not found"

        hashed_pw = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        email = user.get("email")
        now = datetime.datetime.now(timezone.utc)

        users_col.update_many({"email": email}, {"$set": {"password": hashed_pw, "updated_at": now}})
        admins_col.update_many({"email": email}, {"$set": {"password": hashed_pw, "updated_at": now}})
        return True, "Admin password reset successfully"

    @staticmethod
    def delete_admin_user(user_id):
        """
        Deletes an Admin user (Super Admin permission).
        """
        users_col = get_collection("users")
        admins_col = get_collection("admins")
        oid = ObjectId(user_id) if ObjectId.is_valid(user_id) else None
        if not oid:
            return False, "Invalid Admin ID"

        user = users_col.find_one({"_id": oid}) or admins_col.find_one({"_id": oid})
        if not user:
            return False, "Admin account not found"

        if user.get("role") == "super_admin" and user.get("employee_id") == "ADM001":
            return False, "The Primary Super Admin account (ADM001) cannot be deleted!"

        email = user.get("email")
        users_col.delete_many({"email": email})
        admins_col.delete_many({"email": email})
        return True, "Admin account deleted successfully"
