import re

def validate_staff_registration(data):
    """
    Validates payload parameters when registering a new staff member.
    Returns: (is_valid, errors_dict)
    """
    errors = {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    phone = data.get("phone", "").strip()
    department = data.get("department", "").strip()

    if not name:
        errors["name"] = "Name is required"
    elif len(name) < 2:
        errors["name"] = "Name must be at least 2 characters long"

    if not email:
        errors["email"] = "Email is required"
    elif not re.match(r"^[\w\.\+-]+@[\w\.-]+\.\w+$", email):
        errors["email"] = "Invalid email address format"

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

    return len(errors) == 0, errors
