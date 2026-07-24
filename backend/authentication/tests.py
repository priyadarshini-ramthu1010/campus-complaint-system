import jwt
import os
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from authentication.validators import validate_registration_data, validate_login_data
from authentication.services import AuthService
from db_connection import get_collection

class AuthenticationUnitTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.users_col = get_collection("users")

    def test_validators(self):
        # Valid registration
        valid_reg = {
            "name": "Test Scholar",
            "roll_number": "STU1234",
            "email": "testscholar@gmail.com",
            "password": "Password@123",
            "phone": "9876543210"
        }
        is_valid, errors = validate_registration_data(valid_reg)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

        # Invalid registration
        invalid_reg = {
            "name": "A",
            "email": "invalid_email.com",
            "password": "simple"
        }
        is_valid, errors = validate_registration_data(invalid_reg)
        self.assertFalse(is_valid)
        self.assertIn("email", errors)
        self.assertIn("password", errors)

        # Login validator
        is_valid, _ = validate_login_data({"email": "testscholar@gmail.com", "password": "Password@123"})
        self.assertTrue(is_valid)

    def test_password_hashing_and_verification(self):
        pwd = "SecurePassword@123"
        hashed = AuthService.hash_password(pwd)
        self.assertTrue(AuthService.verify_password(pwd, hashed))
        self.assertFalse(AuthService.verify_password("WrongPassword", hashed))

    def test_jwt_generation_and_decode(self):
        user_doc = {
            "_id": "65f123456789abcdef000099",
            "name": "JWT Test User",
            "email": "jwttest@gmail.com",
            "role": "student"
        }
        token = AuthService.generate_jwt_token(user_doc)
        self.assertIsNotNone(token)

        secret = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "super-secret-key-12345-campus-maintenance"))
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        self.assertEqual(decoded["email"], "jwttest@gmail.com")
        self.assertEqual(decoded["role"], "student")

    def test_register_and_login_api_flow(self):
        # Clean test user if exists
        self.users_col.delete_one({"email": "qa_automation_test@gmail.com"})

        # 1. Register API
        reg_payload = {
            "name": "QA Automation User",
            "roll_number": "QA-9999",
            "email": "qa_automation_test@gmail.com",
            "password": "Password@1234",
            "phone": "9998887776",
            "department": "Computer Science",
            "year": "3rd Year"
        }
        response = self.client.post('/api/register', reg_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data.get("success"))

        # 2. Login API
        login_payload = {
            "email": "qa_automation_test@gmail.com",
            "password": "Password@1234"
        }
        login_res = self.client.post('/api/login', login_payload, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        token = login_res.data.get("data", {}).get("token")
        self.assertIsNotNone(token)

        # 3. Access Protected /api/me with JWT Token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_res = self.client.get('/api/me')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data.get("data", {}).get("email"), "qa_automation_test@gmail.com")

        # Cleanup
        self.users_col.delete_one({"email": "qa_automation_test@gmail.com"})
