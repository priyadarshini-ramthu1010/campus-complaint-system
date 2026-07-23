import datetime
from bson import ObjectId
from db_connection import get_collection

class FeedbackService:
    @staticmethod
    def create_feedback(complaint_id, student_id, student_name, rating, comment):
        """
        Creates a new feedback entry for a resolved complaint.
        """
        complaints_col = get_collection("complaints")
        feedback_col = get_collection("feedback")

        try:
            complaint_oid = ObjectId(complaint_id)
        except Exception:
            return False, "Invalid complaint ID format"

        complaint = complaints_col.find_one({"_id": complaint_oid, "is_deleted": False})
        if not complaint:
            return False, "Complaint not found"

        # Permission check
        if str(complaint["student_id"]) != student_id:
            return False, "You can only submit feedback for your own complaints"

        # Check status: must be Resolved
        if complaint.get("status") != "Resolved":
            return False, "Feedback can only be submitted after the complaint is Resolved"

        # Check duplicate feedback
        existing = feedback_col.find_one({"complaint_id": complaint_oid})
        if existing:
            return False, "Feedback has already been submitted for this complaint"

        new_fb = {
            "complaint_id": complaint_oid,
            "student_id": ObjectId(student_id),
            "student_name": student_name,
            "rating": rating,
            "comment": comment.strip(),
            "created_at": datetime.datetime.utcnow()
        }

        try:
            feedback_col.insert_one(new_fb)
            return True, "Feedback submitted successfully"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_all_feedbacks():
        """
        Lists all feedback records for the admin console.
        """
        feedback_col = get_collection("feedback")
        complaints_col = get_collection("complaints")

        cursor = feedback_col.find().sort("created_at", -1)
        results = []
        for doc in cursor:
            comp = complaints_col.find_one({"_id": doc["complaint_id"]})
            comp_num = comp.get("complaint_number", "Unknown") if comp else "Deleted"
            comp_title = comp.get("title", "Unknown") if comp else "Deleted"

            results.append({
                "id": str(doc["_id"]),
                "complaint_id": str(doc["complaint_id"]),
                "complaint_number": comp_num,
                "complaint_title": comp_title,
                "student_id": str(doc["student_id"]),
                "student_name": doc.get("student_name", "Anonymous"),
                "rating": doc.get("rating", 5),
                "comment": doc.get("comment", ""),
                "created_at": doc["created_at"].isoformat()
            })
        return results
