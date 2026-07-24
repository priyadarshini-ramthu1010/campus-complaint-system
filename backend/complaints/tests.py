from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from complaints.validators import validate_complaint_payload, validate_status_update
from complaints.services import ComplaintService
from authentication.services import AuthService
from db_connection import get_collection

class ComplaintModuleTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.complaints_col = get_collection("complaints")
        self.users_col = get_collection("users")

        # Create or fetch a test student user
        student_doc = self.users_col.find_one({"role": "student"})
        if not student_doc:
            student_doc = AuthService.create_student_user(
                name="QA Student Test",
                roll_number="STU-QA-100",
                email="qastudenttest@gmail.com",
                plain_password="Password@123",
                phone="9876543210",
                department="Electrical",
                year="2nd Year"
            )
        self.student_user = student_doc
        self.student_token = AuthService.generate_jwt_token(self.student_user)

        # Create or fetch a test admin user
        admin_doc = self.users_col.find_one({"role": "admin"})
        if not admin_doc:
            admin_doc = {
                "name": "QA Admin Test",
                "email": "qaadmintest@gmail.com",
                "password": AuthService.hash_password("Admin@1234"),
                "role": "admin",
                "department": "Administration"
            }
            res = self.users_col.insert_one(admin_doc)
            admin_doc["_id"] = res.inserted_id
        self.admin_user = admin_doc
        self.admin_token = AuthService.generate_jwt_token(self.admin_user)

    def test_complaint_payload_validator(self):
        valid_payload = {
            "title": "Broken Fan in Room 302",
            "description": "The ceiling fan is making loud noises and not spinning.",
            "category": "Electrical",
            "building": "Hostel Block A",
            "floor": "3rd Floor",
            "room_number": "302"
        }
        is_valid, errors = validate_complaint_payload(valid_payload)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

        invalid_payload = {
            "title": "",
            "description": "Short"
        }
        is_valid, errors = validate_complaint_payload(invalid_payload)
        self.assertFalse(is_valid)
        self.assertIn("title", errors)


    def test_complaint_creation_and_retrieval(self):
        # 1. Create complaint via service
        new_complaint = ComplaintService.create_complaint(
            student_id=str(self.student_user["_id"]),
            student_name=self.student_user["name"],
            roll_number=self.student_user.get("roll_number", "N/A"),
            department=self.student_user.get("department", "Computer Science"),
            title="QA Test Water Leakage",
            description="Pipe leaking in restroom on 2nd floor",
            category="Plumbing",
            building="Academic Block B",
            floor="2nd Floor",
            room_number="204",
            location="Block B Restroom",
            priority="High",
            images=[]
        )
        self.assertIsNotNone(new_complaint)
        self.assertEqual(new_complaint["status"], "Pending")


        # 2. Get complaint via API
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.student_token}')
        res = self.client.get('/api/complaints')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get("success"))

        # 3. Clean up created complaint
        self.complaints_col.delete_one({"_id": new_complaint["_id"]})

    def test_serve_db_image_placeholder(self):
        # Request non-existent or default sample image
        res = self.client.get('/media/complaints/sample_default.jpg')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res['Content-Type'], 'image/gif')
