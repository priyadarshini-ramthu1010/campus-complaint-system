import re

def validate_registration_data(data):
    """
    Validates input fields for a student registration request.
    Enforces strict Gmail and Strong Password rules while gracefully defaulting optional fields.
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

    if not name:
        errors["name"] = "Name is required"
    elif len(name) < 2:
        errors["name"] = "Name must be at least 2 characters long"

    if not email:
        errors["email"] = "Email is required"
    elif not re.match(r"^[a-zA-Z0-9._%+-]+@gmail\.com$", email):
        errors["email"] = "Please enter a valid Gmail address ending with @gmail.com"

    if roll_number and len(roll_number) < 2:
        errors["roll_number"] = "Roll number must be at least 2 characters"

    if not password:
        errors["password"] = "Password is required"
    elif not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\?.,])[A-Za-z\d!@#$%^&*()_+\-=\?.,]{8,20}$", password):
        errors["password"] = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."

    if phone and not re.match(r"^\+?1?\d{9,15}$", phone):
        errors["phone"] = "Invalid phone number format"

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
    elif not re.match(r"^[a-zA-Z0-9._%+-]+@gmail\.com$", email):
        errors["email"] = "Please enter a valid Gmail address."

    if not password:
        errors["password"] = "Password is required"

    return len(errors) == 0, errors
