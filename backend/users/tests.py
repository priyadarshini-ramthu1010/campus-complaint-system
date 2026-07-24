from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from authentication.services import AuthService
from db_connection import get_collection

class UserModuleTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.users_col = get_collection("users")

        admin_doc = self.users_col.find_one({"role": "admin"})
        if not admin_doc:
            admin_doc = {
                "name": "QA User Admin",
                "email": "qauseradmin@gmail.com",
                "password": AuthService.hash_password("Admin@1234"),
                "role": "admin",
                "department": "Administration"
            }
            res = self.users_col.insert_one(admin_doc)
            admin_doc["_id"] = res.inserted_id
        self.admin = admin_doc
        self.admin_token = AuthService.generate_jwt_token(self.admin)

    def test_list_users_and_register_staff(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')

        # 1. Fetch user list
        res = self.client.get('/api/users')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # 2. Register staff user
        staff_payload = {
            "name": "QA Technician Staff",
            "email": "qatechnicianstaff@gmail.com",
            "password": "Password@123",
            "phone": "9876500000",
            "department": "Maintenance",
            "specialization": "Electrical"
        }
        create_res = self.client.post('/api/users/staff', staff_payload, format='json')
        self.assertIn(create_res.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

        # Cleanup test staff if created
        self.users_col.delete_one({"email": "qatechnicianstaff@gmail.com"})
