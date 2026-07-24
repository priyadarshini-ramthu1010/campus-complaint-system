from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from bson import ObjectId
from authentication.services import AuthService
from complaints.services import ComplaintService
from db_connection import get_collection



class FeedbackModuleTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.users_col = get_collection("users")
        self.feedback_col = get_collection("feedback")

        student_doc = self.users_col.find_one({"role": "student"})
        if not student_doc:
            student_doc = AuthService.create_student_user(
                name="QA Feedback Student",
                roll_number="STU-FB-101",
                email="qafeedbackstudent@gmail.com",
                plain_password="Password@123",
                phone="9876543210",
                department="Computer Science",
                year="4th Year"
            )
        self.student = student_doc
        self.token = AuthService.generate_jwt_token(self.student)

    def test_feedback_submission_and_retrieval(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create a Resolved complaint for feedback
        complaint = ComplaintService.create_complaint(
            student_id=str(self.student["_id"]),
            student_name=self.student["name"],
            roll_number=self.student.get("roll_number", "STU-FB-101"),
            department=self.student.get("department", "Computer Science"),
            title="Feedback Test Complaint",
            description="Testing feedback creation flow after complaint resolution",
            category="Internet",
            building="Hostel 1",
            floor="1st Floor",
            room_number="101",
            location="Room 101",
            priority="Low",
            images=[]
        )
        comp_id = str(complaint.get("id") or complaint.get("_id"))

        # Update status to Resolved and set is_deleted False
        get_collection("complaints").update_one(
            {"_id": ObjectId(comp_id)},
            {"$set": {"status": "Resolved", "is_deleted": False}}
        )

        payload = {
            "complaint_id": comp_id,
            "rating": 5,
            "comment": "Great service! Fast resolution."
        }
        res = self.client.post('/api/feedback', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data.get("success"))




        # Fetch feedback list (requires Admin authentication)
        admin_doc = self.users_col.find_one({"role": "admin"})
        if not admin_doc:
            admin_doc = {
                "name": "QA Admin Feedback",
                "email": "qaadminfeedback@gmail.com",
                "password": AuthService.hash_password("Admin@1234"),
                "role": "admin",
                "department": "Administration"
            }
            res = self.users_col.insert_one(admin_doc)
            admin_doc["_id"] = res.inserted_id
        admin_token = AuthService.generate_jwt_token(admin_doc)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

        get_res = self.client.get('/api/feedback')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)


        # Cleanup
        self.feedback_col.delete_many({"comments": "Great service! Fast resolution."})
