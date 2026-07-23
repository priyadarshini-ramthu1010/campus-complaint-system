import re

def validate_registration_data(data):
    """
    Validates input fields for a student registration request.
    Returns: (is_valid, errors_dict)
    """
    if not isinstance(data, dict):
        return False, {"non_field_errors": "Invalid request payload format"}

    errors = {}
    name = str(data.get("name") or "").strip()
    roll_number = str(data.get("roll_number") or "").strip().upper()
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")
    phone = str(data.get("phone") or "").strip()
    department = str(data.get("department") or "").strip()
    year = str(data.get("year") or "").strip()

    if not name:
        errors["name"] = "Name is required"
    elif len(name) < 2:
        errors["name"] = "Name must be at least 2 characters long"

    if not email:
        errors["email"] = "Email is required"
    elif not re.match(r"^[\w\.\+-]+@[\w\.-]+\.\w+$", email):
        errors["email"] = "Invalid email address format"

    if roll_number and len(roll_number) < 2:
        errors["roll_number"] = "Roll number must be at least 2 characters"

    if not password:
        errors["password"] = "Password is required"
    elif len(password) < 6:
        errors["password"] = "Password must be at least 6 characters long"

    if not phone:
        errors["phone"] = "Phone number is required"
    elif not re.match(r"^\+?1?\d{9,15}$", phone):
        errors["phone"] = "Invalid phone number format"

    if not department:
        errors["department"] = "Department is required"

    if not year:
        errors["year"] = "Year of study is required"

    return len(errors) == 0, errors

def validate_login_data(data):
    """
    Validates input fields for a login request.
    Returns: (is_valid, errors_dict)
    """
    if not isinstance(data, dict):
        return False, {"non_field_errors": "Invalid request payload format"}

    errors = {}
    email = str(data.get("email") or "").strip().lower()
    password = str(data.get("password") or "")

    if not email:
        errors["email"] = "Email is required"
    elif not re.match(r"^[\w\.\+-]+@[\w\.-]+\.\w+$", email):
        errors["email"] = "Invalid email address format"

    if not password:
        errors["password"] = "Password is required"

    return len(errors) == 0, errors
