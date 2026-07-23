import datetime
import hashlib
from bson import ObjectId
from db_connection import get_collection

def to_object_id(val):
    if not val:
        return None
    if isinstance(val, ObjectId):
        return val
    val_str = str(val)
    if ObjectId.is_valid(val_str):
        return ObjectId(val_str)
    hex_24 = hashlib.md5(val_str.encode('utf-8')).hexdigest()[:24]
    return ObjectId(hex_24)

class ComplaintService:
    @staticmethod
    def generate_complaint_number():
        """
        Atomically queries database to find current year's complaints and generate the next increment.
        Format: CMP-YYYY-XXXX (e.g. CMP-2026-0001)
        """
        complaints_col = get_collection("complaints")
        year = datetime.datetime.now().year
        prefix = f"CMP-{year}-"
        
        # Query highest matching complaint number for this year
        last_complaint = complaints_col.find_one(
            {"complaint_number": {"$regex": f"^{prefix}"}},
            sort=[("complaint_number", -1)]
        )
        if last_complaint:
            try:
                last_num_str = last_complaint["complaint_number"].split("-")[-1]
                next_num = int(last_num_str) + 1
            except Exception:
                next_num = 1
        else:
            next_num = 1
            
        return f"{prefix}{next_num:04d}"

    @staticmethod
    def create_complaint(student_id, student_name, roll_number, department, title, description,
                         category, building, floor, room_number, location, priority, images):
        """
        Creates a new complaint ticket and appends to status audit timeline.
        """
        complaints_col = get_collection("complaints")
        history_col = get_collection("status_history")
        
        comp_number = ComplaintService.generate_complaint_number()
        now = datetime.datetime.utcnow()

        std_oid = to_object_id(student_id)

        new_comp = {
            "complaint_number": comp_number,
            "student_id": std_oid,
            "student_name": student_name,
            "roll_number": roll_number,
            "department": department,
            "title": title.strip(),
            "description": description.strip(),
            "category": category,
            "building": building,
            "floor": floor,
            "room_number": room_number,
            "location": location.strip(),
            "priority": priority,
            "images": images,  # List of dict: [{"image_path", "original_filename", "uploaded_at", "uploaded_by"}]
            "status": "Pending",
            "assigned_staff_id": None,
            "assigned_staff_name": None,
            "resolution_notes": None,
            "resolution_date": None,
            "resolved_by": None,
            "is_read_by_student": False,
            "is_read_by_admin": False,
            "is_read_by_staff": False,
            "is_deleted": False,
            "created_at": now,
            "updated_at": now,
            "created_by": std_oid,
            "updated_by": std_oid
        }

        result = complaints_col.insert_one(new_comp)
        complaint_id = result.inserted_id

        # Insert audit history
        history_col.insert_one({
            "complaint_id": complaint_id,
            "status": "Pending",
            "remarks": "Complaint registered successfully by student",
            "updated_by": std_oid,
            "updated_by_name": student_name,
            "updated_at": now
        })

        new_comp["id"] = str(complaint_id)
        new_comp["_id"] = str(complaint_id)
        new_comp["student_id"] = str(new_comp["student_id"])
        new_comp["created_by"] = str(new_comp["created_by"])
        new_comp["updated_by"] = str(new_comp["updated_by"])
        for img in new_comp["images"]:
            if isinstance(img.get("uploaded_at"), datetime.datetime):
                img["uploaded_at"] = img["uploaded_at"].isoformat()
            if img.get("uploaded_by"):
                img["uploaded_by"] = str(img["uploaded_by"])

        return new_comp

    @staticmethod
    def list_complaints(user_id, user_role, search="", filters=None, sort_by="created_at", sort_order="desc", page=1, limit=10):
        """
        Lists complaints matching search query and filters with pagination and sorting.
        """
        complaints_col = get_collection("complaints")
        query = {"is_deleted": False}

        # Role-based restriction
        if user_role == "student":
            query["student_id"] = to_object_id(user_id)
        elif user_role == "staff":
            query["assigned_staff_id"] = to_object_id(user_id)

        # Search parameter
        if search:
            query["$or"] = [
                {"complaint_number": {"$regex": search, "$options": "i"}},
                {"student_name": {"$regex": search, "$options": "i"}},
                {"roll_number": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}},
                {"building": {"$regex": search, "$options": "i"}},
                {"room_number": {"$regex": search, "$options": "i"}},
                {"status": {"$regex": search, "$options": "i"}},
                {"title": {"$regex": search, "$options": "i"}},
            ]

        # Standard filters
        if filters:
            for field in ["status", "priority", "category", "department", "building"]:
                if filters.get(field):
                    query[field] = filters[field]
            
            assigned_staff_id = filters.get("assigned_staff_id")
            if assigned_staff_id:
                if assigned_staff_id.lower() == "none" or assigned_staff_id.lower() == "null":
                    query["assigned_staff_id"] = None
                else:
                    query["assigned_staff_id"] = to_object_id(assigned_staff_id)

        # Sort order
        multiplier = -1 if sort_order == "desc" else 1
        
        # Pagination
        skip = (page - 1) * limit

        total_count = complaints_col.count_documents(query)
        cursor = complaints_col.find(query).sort(sort_by, multiplier).skip(skip).limit(limit)

        results = []
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc["_id"] = str(doc["_id"])
            doc["student_id"] = str(doc["student_id"])
            if doc.get("assigned_staff_id"):
                doc["assigned_staff_id"] = str(doc["assigned_staff_id"])
            if doc.get("resolved_by"):
                doc["resolved_by"] = str(doc["resolved_by"])
            if doc.get("created_by"):
                doc["created_by"] = str(doc["created_by"])
            if doc.get("updated_by"):
                doc["updated_by"] = str(doc["updated_by"])
            
            # Formats dates
            for date_field in ["created_at", "updated_at", "resolution_date"]:
                if doc.get(date_field) and isinstance(doc[date_field], datetime.datetime):
                    doc[date_field] = doc[date_field].isoformat()
            
            for img in doc.get("images", []):
                if img.get("uploaded_at") and isinstance(img["uploaded_at"], datetime.datetime):
                    img["uploaded_at"] = img["uploaded_at"].isoformat()
                if img.get("uploaded_by"):
                    img["uploaded_by"] = str(img["uploaded_by"])

            results.append(doc)

        total_pages = (total_count + limit - 1) // limit

        return {
            "complaints": results,
            "pagination": {
                "total_count": total_count,
                "total_pages": total_pages,
                "current_page": page,
                "limit": limit
            }
        }

    @staticmethod
    def get_complaint_by_id(complaint_id, user_id, user_role):
        """
        Fetch details of a single complaint, including status history and feedback if resolved.
        """
        complaints_col = get_collection("complaints")
        complaint_oid = to_object_id(complaint_id)

        complaint = complaints_col.find_one({"_id": complaint_oid, "is_deleted": False})
        if not complaint:
            return None

        # Check permissions
        if user_role == "student" and str(complaint["student_id"]) != user_id:
            return "forbidden"
        if user_role == "staff" and str(complaint.get("assigned_staff_id")) != user_id:
            return "forbidden"

        # Format details
        complaint["id"] = str(complaint["_id"])
        complaint["_id"] = str(complaint["_id"])
        complaint["student_id"] = str(complaint["student_id"])
        if complaint.get("assigned_staff_id"):
            complaint["assigned_staff_id"] = str(complaint["assigned_staff_id"])
        if complaint.get("resolved_by"):
            complaint["resolved_by"] = str(complaint["resolved_by"])
        if complaint.get("created_by"):
            complaint["created_by"] = str(complaint["created_by"])
        if complaint.get("updated_by"):
            complaint["updated_by"] = str(complaint["updated_by"])
        
        for df in ["created_at", "updated_at", "resolution_date"]:
            if complaint.get(df) and isinstance(complaint[df], datetime.datetime):
                complaint[df] = complaint[df].isoformat()

        for img in complaint.get("images", []):
            if img.get("uploaded_at") and isinstance(img["uploaded_at"], datetime.datetime):
                img["uploaded_at"] = img["uploaded_at"].isoformat()
            if img.get("uploaded_by"):
                img["uploaded_by"] = str(img["uploaded_by"])

        # Timeline
        history_col = get_collection("status_history")
        histories = list(history_col.find({"complaint_id": complaint_oid}).sort("updated_at", 1))
        timeline = []
        for h in histories:
            h["id"] = str(h["_id"])
            h["_id"] = str(h["_id"])
            h["complaint_id"] = str(h["complaint_id"])
            h["updated_by"] = str(h["updated_by"])
            h["updated_at"] = h["updated_at"].isoformat()
            timeline.append(h)
        complaint["timeline"] = timeline

        # Feedback
        feedback_col = get_collection("feedback")
        fb = feedback_col.find_one({"complaint_id": complaint_oid})
        if fb:
            fb["id"] = str(fb["_id"])
            fb["_id"] = str(fb["_id"])
            fb["complaint_id"] = str(fb["complaint_id"])
            fb["student_id"] = str(fb["student_id"])
            fb["created_at"] = fb["created_at"].isoformat()
            complaint["feedback"] = fb
        else:
            complaint["feedback"] = None

        return complaint

    @staticmethod
    def assign_staff(complaint_id, staff_id, remarks, admin_id, admin_name):
        """
        Assigns a staff member to a complaint and updates the audit log.
        """
        complaints_col = get_collection("complaints")
        users_col = get_collection("users")
        history_col = get_collection("status_history")

        complaint_oid = to_object_id(complaint_id)
        staff_oid = to_object_id(staff_id)
        admin_oid = to_object_id(admin_id)

        # Verify staff role
        staff = users_col.find_one({"_id": staff_oid, "role": "staff"})
        if not staff:
            return False, "Staff member not found in database"

        complaint = complaints_col.find_one({"_id": complaint_oid, "is_deleted": False})
        if not complaint:
            return False, "Complaint not found"

        now = datetime.datetime.utcnow()

        try:
            complaints_col.update_one(
                {"_id": complaint_oid},
                {
                    "$set": {
                        "assigned_staff_id": staff_oid,
                        "assigned_staff_name": staff.get("name", ""),
                        "status": "Assigned",
                        "updated_at": now,
                        "updated_by": admin_oid
                    }
                }
            )

            # Insert history
            history_col.insert_one({
                "complaint_id": complaint_oid,
                "status": "Assigned",
                "remarks": remarks or f"Assigned to {staff.get('name')}",
                "updated_by": admin_oid,
                "updated_by_name": admin_name,
                "updated_at": now
            })

            return True, "Staff assigned successfully"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def update_status(complaint_id, new_status, remarks, user_id, user_name, user_role, resolution_images=None):
        """
        Updates the status of a complaint and appends an entry to status history.
        """
        complaints_col = get_collection("complaints")
        history_col = get_collection("status_history")

        complaint_oid = to_object_id(complaint_id)
        u_oid = to_object_id(user_id)

        complaint = complaints_col.find_one({"_id": complaint_oid, "is_deleted": False})
        if not complaint:
            return False, "Complaint not found"

        # Permission check
        if user_role == "staff":
            assigned_id = complaint.get("assigned_staff_id")
            if not assigned_id or str(assigned_id) != user_id:
                return False, "You are not assigned to this complaint"

        now = datetime.datetime.utcnow()
        update_data = {
            "status": new_status,
            "updated_at": now,
            "updated_by": u_oid
        }

        # Resolution details
        if new_status == "Resolved":
            update_data["resolution_notes"] = remarks
            update_data["resolution_date"] = now
            update_data["resolved_by"] = u_oid
            if resolution_images:
                # Add resolution images to complaints images array
                update_data["images"] = complaint.get("images", []) + resolution_images

        try:
            complaints_col.update_one({"_id": complaint_oid}, {"$set": update_data})

            # History entry
            history_col.insert_one({
                "complaint_id": complaint_oid,
                "status": new_status,
                "remarks": remarks or f"Status updated to {new_status}",
                "updated_by": u_oid,
                "updated_by_name": user_name,
                "updated_at": now
            })

            return True, f"Status updated to {new_status}"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_dashboard_stats():
        """
        Aggregates dashboard stats and distributions for the Admin panel.
        """
        complaints_col = get_collection("complaints")
        
        now = datetime.datetime.utcnow()
        today_start = datetime.datetime(now.year, now.month, now.day)

        # Status count stats
        total = complaints_col.count_documents({"is_deleted": False})
        pending = complaints_col.count_documents({"status": "Pending", "is_deleted": False})
        assigned = complaints_col.count_documents({"status": "Assigned", "is_deleted": False})
        in_progress = complaints_col.count_documents({"status": "In Progress", "is_deleted": False})
        resolved = complaints_col.count_documents({"status": "Resolved", "is_deleted": False})
        rejected = complaints_col.count_documents({"status": "Rejected", "is_deleted": False})
        today = complaints_col.count_documents({"created_at": {"$gte": today_start}, "is_deleted": False})

        # Aggregation 1: Complaints by Category
        cat_agg = list(complaints_col.aggregate([
            {"$match": {"is_deleted": False}},
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]))
        by_category = {item["_id"]: item["count"] for item in cat_agg}

        # Aggregation 2: Complaints by Status
        status_agg = list(complaints_col.aggregate([
            {"$match": {"is_deleted": False}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]))
        by_status = {item["_id"]: item["count"] for item in status_agg}

        # Aggregation 3: Priority Distribution
        priority_agg = list(complaints_col.aggregate([
            {"$match": {"is_deleted": False}},
            {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
        ]))
        by_priority = {item["_id"]: item["count"] for item in priority_agg}

        # Aggregation 4: Monthly counts (last 6 months)
        # Note: We can group by year and month
        six_months_ago = now - datetime.timedelta(days=180)
        monthly_agg = list(complaints_col.aggregate([
            {"$match": {"created_at": {"$gte": six_months_ago}, "is_deleted": False}},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$created_at"},
                        "month": {"$month": "$created_at"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]))

        by_month = []
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for item in monthly_agg:
            year = item["_id"]["year"]
            month_idx = item["_id"]["month"] - 1
            by_month.append({
                "label": f"{month_names[month_idx]} {year}",
                "count": item["count"]
            })

        return {
            "cards": {
                "total": total,
                "pending": pending,
                "assigned": assigned,
                "in_progress": in_progress,
                "resolved": resolved,
                "rejected": rejected,
                "today": today
            },
            "charts": {
                "by_category": by_category,
                "by_status": by_status,
                "by_priority": by_priority,
                "monthly": by_month
            }
        }
