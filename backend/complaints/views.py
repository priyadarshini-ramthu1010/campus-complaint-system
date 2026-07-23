import os
import uuid
import datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from utils.response import standard_success_response, standard_error_response
from .validators import validate_complaint_payload, validate_status_update
from .services import ComplaintService

ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg'}

def validate_image_file(file):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False, f"Unsupported file type: {ext}. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
    if file.size > 5 * 1024 * 1024:
        return False, f"File {file.name} exceeds the 5MB size limit"
    return True, ext

class ComplaintListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        if request.user.role != "student":
            return standard_error_response(
                message="Only students are allowed to raise complaints",
                status_code=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        is_valid, errs = validate_complaint_payload(data)
        if not is_valid:
            return standard_error_response(
                message="Validation failed",
                errors=errs,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Process multiple image uploads
        images_data = []
        uploaded_files = request.FILES.getlist("images")
        
        for file in uploaded_files:
            valid, msg_or_ext = validate_image_file(file)
            if not valid:
                return standard_error_response(
                    message="Image validation failed",
                    errors={"images": msg_or_ext},
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            unique_name = f"{uuid.uuid4()}{msg_or_ext}"
            
            import base64
            try:
                file.seek(0)
                file_bytes = file.read()
                base64_data = base64.b64encode(file_bytes).decode('utf-8')
            except Exception as e:
                return standard_error_response(
                    message=f"Failed to process image: {str(e)}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            images_data.append({
                "image_path": f"complaints/{unique_name}",
                "image_data": base64_data,
                "original_filename": file.name,
                "uploaded_at": datetime.datetime.utcnow(),
                "uploaded_by": request.user.id
            })

        try:
            new_comp = ComplaintService.create_complaint(
                student_id=request.user.id,
                student_name=request.user.name,
                roll_number=request.user.roll_number,
                department=request.user.department,
                title=data.get("title"),
                description=data.get("description"),
                category=data.get("category"),
                building=data.get("building"),
                floor=data.get("floor"),
                room_number=data.get("room_number"),
                location=data.get("location", ""),
                priority=data.get("priority", "Medium"),
                images=images_data
            )
            return standard_success_response(
                message="Complaint raised successfully",
                data={"complaint": new_comp},
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to create complaint: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        sort_by = request.query_params.get("sort_by", "created_at").strip()
        sort_order = request.query_params.get("sort_order", "desc").strip()
        
        try:
            page = int(request.query_params.get("page", 1))
            limit = int(request.query_params.get("limit", 10))
        except ValueError:
            page = 1
            limit = 10

        filters = {}
        for field in ["status", "priority", "category", "department", "building", "assigned_staff_id"]:
            val = request.query_params.get(field, "").strip()
            if val:
                filters[field] = val

        try:
            list_data = ComplaintService.list_complaints(
                user_id=request.user.id,
                user_role=request.user.role,
                search=search,
                filters=filters,
                sort_by=sort_by,
                sort_order=sort_order,
                page=page,
                limit=limit
            )
            return standard_success_response(
                message="Complaints retrieved successfully",
                data=list_data,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch complaints: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ComplaintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        complaint = ComplaintService.get_complaint_by_id(pk, request.user.id, request.user.role)
        
        if complaint is None:
            return standard_error_response(
                message="Complaint not found",
                status_code=status.HTTP_404_NOT_FOUND
            )
        if complaint == "forbidden":
            return standard_error_response(
                message="Permission denied to access this complaint",
                status_code=status.HTTP_403_FORBIDDEN
            )

        return standard_success_response(
            message="Complaint details retrieved successfully",
            data={"complaint": complaint},
            status_code=status.HTTP_200_OK
        )


class AssignStaffView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin privileges required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        staff_id = data.get("staff_id")
        remarks = data.get("remarks", "").strip()

        if not staff_id:
            return standard_error_response(
                message="Staff member ID is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        success, msg = ComplaintService.assign_staff(
            complaint_id=pk,
            staff_id=staff_id,
            remarks=remarks,
            admin_id=request.user.id,
            admin_name=request.user.name
        )

        if not success:
            return standard_error_response(
                message=msg,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        return standard_success_response(
            message="Staff member assigned successfully",
            status_code=status.HTTP_200_OK
        )


class UpdateStatusView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        if request.user.role not in ["admin", "super_admin", "staff"]:
            return standard_error_response(
                message="Forbidden. Admin or Staff permission required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        is_valid, errs = validate_status_update(data)
        if not is_valid:
            return standard_error_response(
                message="Validation failed",
                errors=errs,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        new_status = data.get("status")
        remarks = (data.get("remarks") or "").strip() or f"Status updated to {new_status} by {request.user.name}"

        # Process optional resolution image
        res_images = []
        uploaded_files = request.FILES.getlist("resolution_images")
        
        for file in uploaded_files:
            valid, msg_or_ext = validate_image_file(file)
            if not valid:
                return standard_error_response(
                    message="Resolution image validation failed",
                    errors={"resolution_images": msg_or_ext},
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            unique_name = f"res_{uuid.uuid4()}{msg_or_ext}"
            
            import base64
            try:
                file.seek(0)
                file_bytes = file.read()
                base64_data = base64.b64encode(file_bytes).decode('utf-8')
            except Exception as e:
                return standard_error_response(
                    message=f"Failed to process resolution image: {str(e)}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            
            res_images.append({
                "image_path": f"complaints/{unique_name}",
                "image_data": base64_data,
                "original_filename": file.name,
                "uploaded_at": datetime.datetime.utcnow(),
                "uploaded_by": request.user.id
            })

        success, msg = ComplaintService.update_status(
            complaint_id=pk,
            new_status=new_status,
            remarks=remarks,
            user_id=request.user.id,
            user_name=request.user.name,
            user_role=request.user.role,
            resolution_images=res_images if res_images else None
        )

        if not success:
            return standard_error_response(
                message=msg,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        return standard_success_response(
            message="Complaint status updated successfully",
            status_code=status.HTTP_200_OK
        )


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        try:
            stats = ComplaintService.get_dashboard_stats()
            return standard_success_response(
                message="Dashboard statistics retrieved successfully",
                data=stats,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to aggregate stats: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


from django.http import HttpResponse, Http404
from db_connection import get_collection
import base64
import mimetypes

def serve_db_image(request, filename):
    """
    Serves images directly from MongoDB as an HTTP response.
    Returns a default placeholder gray pixel for missing/sample images.
    """
    complaints_collection = get_collection("complaints")
    image_path = f"complaints/{filename}"
    
    complaint = complaints_collection.find_one({"images.image_path": image_path})
    if not complaint:
        if filename == "sample_default.jpg":
            pixel_data = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
            return HttpResponse(pixel_data, content_type="image/gif")
        raise Http404("Image not found in MongoDB")
        
    image_subdoc = None
    for img in complaint.get("images", []):
        if img.get("image_path") == image_path:
            image_subdoc = img
            break
            
    if not image_subdoc or "image_data" not in image_subdoc:
        pixel_data = base64.b64decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
        return HttpResponse(pixel_data, content_type="image/gif")
        
    try:
        image_bytes = base64.b64decode(image_subdoc["image_data"])
    except Exception:
        raise Http404("Invalid image encoding")
        
    content_type, _ = mimetypes.guess_type(filename)
    if not content_type:
        content_type = "image/jpeg"
        
    return HttpResponse(image_bytes, content_type=content_type)


class AIChatAssistantView(APIView):
    """
    AI Endpoint for handling smart campus maintenance queries, issue diagnosis, and SLA suggestions.
    """
    permission_classes = []

    def post(self, request):
        prompt = request.data.get("prompt", "")
        if not prompt:
            return standard_error_response(message="Prompt is required", status_code=status.HTTP_400_BAD_REQUEST)

        prompt_lower = prompt.lower()
        
        # Smart AI response generator
        if any(w in prompt_lower for w in ["water", "leak", "pipe", "toilet", "tap", "sink", "flush"]):
          reply = "💧 **AI Plumbing Analysis**: Water leak identified. Technicians usually arrive in 1-2 hours. Priority set to High. Please shut off isolated valve if accessible."
          category = "Plumbing"
          priority = "High"
          sla = "1-2 Hours"
        elif any(w in prompt_lower for w in ["spark", "wire", "shock", "short", "fire"]):
          reply = "⚡ **AI Electrical Emergency**: Danger detected! Emergency Electrical Squad dispatched within 30 minutes. Please keep safe distance from switches."
          category = "Electrical"
          priority = "Critical"
          sla = "30 Mins"
        elif any(w in prompt_lower for w in ["ac", "cool", "fan", "light", "power", "bulb"]):
          reply = "🔌 **AI Electrical/HVAC Analysis**: Power or cooling concern logged. Average repair time is 2-4 hours. Technician will inspect voltage & breakers."
          category = "Electrical"
          priority = "Medium"
          sla = "2-4 Hours"
        elif any(w in prompt_lower for w in ["projector", "wifi", "internet", "computer", "lab"]):
          reply = "💻 **AI IT Infrastructure Analysis**: Academic IT issue recognized. Dedicated IT department handles classroom AV within 2 hours."
          category = "IT Support"
          priority = "Medium"
          sla = "2 Hours"
        else:
          reply = f"✨ **AI Campus Assistant**: I have analyzed your request: '{prompt}'. Our campus maintenance team monitors all issues 24/7. Average resolution turnaround is 4 hours!"
          category = "General"
          priority = "Low"
          sla = "4 Hours"

        return standard_success_response(
            message="AI Analysis completed",
            data={
                "reply": reply,
                "category": category,
                "priority": priority,
                "sla": sla
            },
            status_code=status.HTTP_200_OK
        )


class AssignedComplaintsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "staff":
            return standard_error_response(
                message="Forbidden. Only staff members can access assigned complaints.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        try:
            result = ComplaintService.list_complaints(
                user_id=request.user.id,
                user_role="staff",
                page=int(request.query_params.get("page", 1)),
                limit=int(request.query_params.get("limit", 100))
            )
            return standard_success_response(
                message="Assigned complaints retrieved successfully",
                data=result,
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch assigned complaints: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        from db_connection import get_collection
        from bson import ObjectId
        notif_col = get_collection("notifications")

        user_id = pk or request.user.id
        try:
            u_oid = ObjectId(str(user_id))
        except Exception:
            u_oid = user_id

        try:
            query = {"$or": [{"user_id": u_oid}, {"user_id": str(user_id)}]}
            cursor = notif_col.find(query).sort("created_at", -1).limit(50)
            notifications = []
            unread_count = 0
            for doc in cursor:
                doc["id"] = str(doc["_id"])
                doc["_id"] = str(doc["_id"])
                doc["user_id"] = str(doc["user_id"])
                if doc.get("complaint_id"):
                    doc["complaint_id"] = str(doc["complaint_id"])
                if doc.get("created_at") and hasattr(doc["created_at"], "isoformat"):
                    doc["created_at"] = doc["created_at"].isoformat()
                elif doc.get("created_at") and isinstance(doc["created_at"], str):
                    pass
                if not doc.get("is_read"):
                    unread_count += 1
                notifications.append(doc)

            return standard_success_response(
                message="Notifications retrieved successfully",
                data={
                    "notifications": notifications,
                    "unread_count": unread_count
                },
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch notifications: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        from db_connection import get_collection
        from bson import ObjectId
        import datetime

        data = request.data
        user_id = data.get("user_id") or data.get("userId")
        if not user_id:
            return standard_error_response(message="userId is required", status_code=status.HTTP_400_BAD_REQUEST)

        notif_col = get_collection("notifications")
        now = datetime.datetime.utcnow()

        try:
            u_oid = ObjectId(str(user_id))
        except Exception:
            u_oid = user_id

        c_id = data.get("complaint_id") or data.get("complaintId")
        try:
            c_oid = ObjectId(str(c_id)) if c_id else None
        except Exception:
            c_oid = c_id

        doc = {
            "user_id": u_oid,
            "role": data.get("role", "student"),
            "title": data.get("title", "System Notification"),
            "message": data.get("message", ""),
            "complaint_id": c_oid,
            "is_read": False,
            "created_at": now
        }
        res = notif_col.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        doc["_id"] = str(res.inserted_id)
        doc["user_id"] = str(doc["user_id"])

        return standard_success_response(message="Notification created", data={"notification": doc}, status_code=status.HTTP_201_CREATED)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        from db_connection import get_collection
        from bson import ObjectId
        notif_col = get_collection("notifications")

        try:
            n_oid = ObjectId(str(pk))
        except Exception:
            n_oid = pk

        notif_col.update_one({"_id": n_oid}, {"$set": {"is_read": True}})
        return standard_success_response(message="Notification marked as read", status_code=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        from db_connection import get_collection
        from bson import ObjectId
        notif_col = get_collection("notifications")

        try:
            u_oid = ObjectId(str(request.user.id))
        except Exception:
            u_oid = request.user.id

        notif_col.update_many({"user_id": u_oid}, {"$set": {"is_read": True}})
        return standard_success_response(message="All notifications marked as read", status_code=status.HTTP_200_OK)


class StaffDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != "staff":
            return standard_error_response(
                message="Forbidden. Only staff members can access the staff dashboard.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        from db_connection import get_collection
        from bson import ObjectId

        try:
            complaints_col = get_collection("complaints")
            try:
                u_oid = ObjectId(str(request.user.id))
            except Exception:
                u_oid = request.user.id

            now = datetime.datetime.utcnow()
            today_start = datetime.datetime(now.year, now.month, now.day)

            query = {"assigned_staff_id": u_oid, "is_deleted": False}

            assigned_today = complaints_col.count_documents({
                **query,
                "assigned_date": {"$gte": today_start}
            })

            pending = complaints_col.count_documents({
                **query,
                "status": "Pending"
            })

            in_progress = complaints_col.count_documents({
                **query,
                "status": {"$in": ["In Progress", "Accepted", "Assigned", "Waiting for Parts"]}
            })

            completed = complaints_col.count_documents({
                **query,
                "status": {"$in": ["Resolved", "Completed"]}
            })

            stats = {
                "assignedToday": assigned_today,
                "pending": pending,
                "inProgress": in_progress,
                "completed": completed
            }

            profile = {
                "id": str(request.user.id),
                "name": request.user.name,
                "employee_id": getattr(request.user, "employee_id", "STF-001"),
                "department": getattr(request.user, "department", "General Maintenance"),
                "designation": "Technician Specialist",
                "today_date": now.strftime("%d %b %Y")
            }

            return standard_success_response(
                message="Staff dashboard summary retrieved successfully",
                data={
                    "stats": stats,
                    "profile": profile
                },
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch staff dashboard: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UploadImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        if "image" not in request.FILES and "file" not in request.FILES:
            return standard_error_response(message="No image file provided", status_code=status.HTTP_400_BAD_REQUEST)

        file = request.FILES.get("image") or request.FILES.get("file")
        valid, msg_or_ext = validate_image_file(file)
        if not valid:
            return standard_error_response(message=msg_or_ext, status_code=status.HTTP_400_BAD_REQUEST)

        unique_name = f"repair_{uuid.uuid4()}{msg_or_ext}"
        import base64
        try:
            file.seek(0)
            file_bytes = file.read()
            base64_data = base64.b64encode(file_bytes).decode('utf-8')
            img_url = f"data:image/jpeg;base64,{base64_data}"
        except Exception as e:
            return standard_error_response(message=f"Failed to process file: {str(e)}", status_code=status.HTTP_400_BAD_REQUEST)

        return standard_success_response(
            message="Image uploaded successfully",
            data={
                "image_path": f"complaints/{unique_name}",
                "url": img_url
            },
            status_code=status.HTTP_201_CREATED
        )


class StaffAcceptWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        complaint_id = request.data.get("complaint_id") or request.data.get("complaintId")
        if not complaint_id:
            return standard_error_response(message="complaintId is required", status_code=status.HTTP_400_BAD_REQUEST)

        success, msg = ComplaintService.update_status(
            complaint_id=complaint_id,
            new_status="Accepted",
            remarks=request.data.get("remarks", "Staff accepted assignment"),
            user_id=request.user.id,
            user_name=request.user.name,
            user_role=request.user.role
        )
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)
        return standard_success_response(message=msg, status_code=status.HTTP_200_OK)


class StaffStartWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        complaint_id = request.data.get("complaint_id") or request.data.get("complaintId")
        if not complaint_id:
            return standard_error_response(message="complaintId is required", status_code=status.HTTP_400_BAD_REQUEST)

        success, msg = ComplaintService.update_status(
            complaint_id=complaint_id,
            new_status="In Progress",
            remarks=request.data.get("remarks", "Work started by staff"),
            user_id=request.user.id,
            user_name=request.user.name,
            user_role=request.user.role
        )
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)
        return standard_success_response(message=msg, status_code=status.HTTP_200_OK)


class StaffCompleteWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        complaint_id = request.data.get("complaint_id") or request.data.get("complaintId")
        if not complaint_id:
            return standard_error_response(message="complaintId is required", status_code=status.HTTP_400_BAD_REQUEST)

        success, msg = ComplaintService.update_status(
            complaint_id=complaint_id,
            new_status="Waiting for Admin Verification",
            remarks=request.data.get("remarks") or request.data.get("completionRemarks", "Work completed. Sent for admin verification."),
            user_id=request.user.id,
            user_name=request.user.name,
            user_role=request.user.role,
            before_image=request.data.get("before_image"),
            after_image=request.data.get("after_image")
        )
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)
        return standard_success_response(message="Completion report sent to Admin successfully", status_code=status.HTTP_200_OK)


class AdminApproveWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(message="Forbidden. Admin privileges required.", status_code=status.HTTP_403_FORBIDDEN)

        complaint_id = request.data.get("complaint_id") or request.data.get("complaintId")
        if not complaint_id:
            return standard_error_response(message="complaintId is required", status_code=status.HTTP_400_BAD_REQUEST)

        success, msg = ComplaintService.update_status(
            complaint_id=complaint_id,
            new_status="Resolved",
            remarks=request.data.get("remarks", "Admin approved work completion"),
            user_id=request.user.id,
            user_name=request.user.name,
            user_role=request.user.role
        )
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)
        return standard_success_response(message="Complaint work approved & resolved", status_code=status.HTTP_200_OK)


class AdminRejectWorkView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(message="Forbidden. Admin privileges required.", status_code=status.HTTP_403_FORBIDDEN)

        complaint_id = request.data.get("complaint_id") or request.data.get("complaintId")
        reason = request.data.get("reason") or request.data.get("remarks")
        if not complaint_id:
            return standard_error_response(message="complaintId is required", status_code=status.HTTP_400_BAD_REQUEST)
        if not reason:
            return standard_error_response(message="Rejection reason is mandatory", status_code=status.HTTP_400_BAD_REQUEST)

        success, msg = ComplaintService.update_status(
            complaint_id=complaint_id,
            new_status="Reopened",
            remarks=reason,
            user_id=request.user.id,
            user_name=request.user.name,
            user_role=request.user.role
        )
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)
        return standard_success_response(message="Work rejected and complaint reopened for staff", status_code=status.HTTP_200_OK)

