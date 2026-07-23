def validate_complaint_payload(data):
    """
    Validates input parameters for creating a new complaint.
    Returns: (is_valid, errors_dict)
    """
    errors = {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "").strip()
    building = data.get("building", "").strip()
    floor = data.get("floor", "").strip()
    room_number = data.get("room_number", "").strip()
    priority = data.get("priority", "Medium").strip()

    if not title:
        errors["title"] = "Complaint title is required"
    elif len(title) < 5:
        errors["title"] = "Title must be at least 5 characters long"

    if not description:
        errors["description"] = "Complaint description is required"
    elif len(description) < 10:
        errors["description"] = "Description must be at least 10 characters long"

    valid_categories = {
        "Electrical", "Plumbing", "Internet", "Furniture", "Cleaning", 
        "Laboratory", "Classroom", "Hostel", "Civil", "Water Supply", "Others"
    }
    if not category:
        errors["category"] = "Category is required"
    elif category not in valid_categories:
        errors["category"] = f"Invalid category. Choose from: {', '.join(valid_categories)}"

    if not building:
        errors["building"] = "Building name/location is required"

    if not floor:
        errors["floor"] = "Floor level is required"

    if not room_number:
        errors["room_number"] = "Room number is required"

    valid_priorities = {"Low", "Medium", "High", "Emergency"}
    if priority not in valid_priorities:
        errors["priority"] = f"Invalid priority. Choose from: {', '.join(valid_priorities)}"

    return len(errors) == 0, errors


def validate_status_update(data):
    """
    Validates status update payload parameters.
    """
    errors = {}
    new_status = data.get("status", "").strip()

    valid_statuses = {"Pending", "Assigned", "In Progress", "Resolved", "Rejected"}
    if not new_status:
        errors["status"] = "Status value is required"
    elif new_status not in valid_statuses:
        errors["status"] = f"Invalid status. Choose from: {', '.join(valid_statuses)}"

    return len(errors) == 0, errors
