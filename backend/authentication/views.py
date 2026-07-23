from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from utils.response import standard_success_response, standard_error_response
from rest_framework import status
from pymongo.errors import DuplicateKeyError
from bson import ObjectId
from .validators import validate_registration_data, validate_login_data
from .services import AuthService

class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        is_valid, errs = validate_registration_data(data)
        if not is_valid:
            return standard_error_response(
                message="Validation failed",
                errors=errs,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        email = data.get("email", "").strip().lower()
        roll_number = data.get("roll_number", "").strip().upper()

        # Check existing email
        if AuthService.get_user_by_email(email):
            return standard_error_response(
                message="Registration failed",
                errors={"email": "Email address already registered"},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Check existing roll number
        if AuthService.get_user_by_roll_number(roll_number):
            return standard_error_response(
                message="Registration failed",
                errors={"roll_number": "Roll number already registered"},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_user = AuthService.create_student_user(
                name=data.get("name"),
                roll_number=roll_number,
                email=email,
                plain_password=data.get("password"),
                phone=data.get("phone"),
                department=data.get("department"),
                year=data.get("year")
            )

            token = AuthService.generate_jwt_token(new_user)
            user_data = {
                "id": str(new_user["_id"]),
                "name": new_user["name"],
                "email": new_user["email"],
                "role": new_user["role"],
                "roll_number": new_user["roll_number"],
                "department": new_user["department"],
                "year": new_user["year"],
                "phone": new_user["phone"],
                "status": new_user.get("status", "active"),
                "employee_id": new_user.get("employee_id", "")
            }

            return standard_success_response(
                message="User registered successfully",
                data={"token": token, "user": user_data},
                status_code=status.HTTP_201_CREATED
            )
        except DuplicateKeyError as dup_err:
            err_msg = str(dup_err)
            field = "email" if "email" in err_msg else "roll_number"
            return standard_error_response(
                message="Registration failed",
                errors={field: f"A user with this {field} already exists."},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return standard_error_response(
                message=f"Database error during registration: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        is_valid, errs = validate_login_data(data)
        if not is_valid:
            return standard_error_response(
                message="Validation failed",
                errors=errs,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        email = data.get("email", "").strip().lower()
        password = data.get("password", "")

        user = AuthService.get_user_by_email(email)
        if not user:
            return standard_error_response(
                message="Authentication failed",
                errors={"non_field_errors": "Invalid email or password"},
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        if not AuthService.verify_password(password, user.get("password", "")):
            return standard_error_response(
                message="Authentication failed",
                errors={"non_field_errors": "Invalid email or password"},
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        if user.get("status") == "inactive":
            return standard_error_response(
                message="Your account has been disabled. Please contact the System Administrator.",
                errors={"non_field_errors": "Your account has been disabled. Please contact the System Administrator."},
                status_code=status.HTTP_403_FORBIDDEN
            )

        token = AuthService.generate_jwt_token(user)
        user_data = {
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "student"),
            "roll_number": user.get("roll_number", ""),
            "employee_id": user.get("employee_id", ""),
            "department": user.get("department", ""),
            "year": user.get("year", ""),
            "phone": user.get("phone", ""),
            "status": user.get("status", "active"),
            "profile_image": user.get("profile_image", "")
        }

        return standard_success_response(
            message="Login successful",
            data={"token": token, "user": user_data},
            status_code=status.HTTP_200_OK
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "roll_number": user.roll_number,
            "employee_id": getattr(user, "employee_id", ""),
            "department": user.department,
            "year": user.year,
            "phone": user.phone,
            "status": getattr(user, "status", "active")
        }
        return standard_success_response(
            message="Profile retrieved successfully",
            data=user_data,
            status_code=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = str(data.get("email") or "").strip().lower()
        new_password = str(data.get("new_password") or "")

        if not email:
            return standard_error_response(
                message="Email address is required",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if not new_password or len(new_password) < 6:
            return standard_error_response(
                message="New password must be at least 6 characters long",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        success, msg = AuthService.reset_password(email, new_password)
        if not success:
            return standard_error_response(
                message=msg,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        return standard_success_response(
            message=msg,
            status_code=status.HTTP_200_OK
        )
