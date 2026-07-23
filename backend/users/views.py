from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from utils.response import standard_success_response, standard_error_response
from .validators import validate_staff_registration
from .services import UserService

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        role = request.query_params.get("role", None)
        try:
            users_list = UserService.list_users(role=role)
            return standard_success_response(
                message="Users list retrieved successfully",
                data={"users": users_list},
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch users list: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RegisterStaffView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        is_valid, errs = validate_staff_registration(data)
        if not is_valid:
            return standard_error_response(
                message="Validation failed",
                errors=errs,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        email = data.get("email", "").strip().lower()

        if UserService.get_user_by_email(email):
            return standard_error_response(
                message="Staff registration failed",
                errors={"email": "Email address already registered"},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_staff = UserService.create_staff_user(
                name=data.get("name"),
                email=email,
                plain_password=data.get("password"),
                phone=data.get("phone"),
                department=data.get("department"),
                created_by_id=request.user.id
            )

            staff_data = {
                "id": str(new_staff["_id"]),
                "name": new_staff["name"],
                "email": new_staff["email"],
                "role": new_staff["role"],
                "department": new_staff["department"],
                "phone": new_staff["phone"]
            }

            return standard_success_response(
                message="Staff registered successfully",
                data={"staff": staff_data},
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return standard_error_response(
                message=f"Database error during staff registration: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        try:
            admins_list = UserService.list_users(role="admin")
            return standard_success_response(
                message="Admin list retrieved successfully",
                data={"admins": admins_list},
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch admin list: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required to create Admin accounts.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        name = str(data.get("name") or "").strip()
        employee_id = str(data.get("employee_id") or "").strip().upper()
        email = str(data.get("email") or "").strip().lower()
        password = str(data.get("password") or "")
        confirm_password = str(data.get("confirm_password") or "")
        phone = str(data.get("phone") or "").strip()
        department = str(data.get("department") or "").strip()
        role = str(data.get("role") or "admin").strip().lower()
        user_status = str(data.get("status") or "active").strip().lower()

        if not name or not employee_id or not email or not password:
            return standard_error_response(
                message="All required fields must be filled.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if password != confirm_password:
            return standard_error_response(
                message="Passwords do not match.",
                errors={"confirm_password": "Passwords do not match."},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if len(password) < 6:
            return standard_error_response(
                message="Password must be at least 6 characters.",
                errors={"password": "Password must be at least 6 characters."},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if UserService.get_user_by_email(email):
            return standard_error_response(
                message="An account with this email address already exists.",
                errors={"email": "Email address already registered."},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if UserService.get_admin_by_employee_id(employee_id):
            return standard_error_response(
                message="An admin with this Employee ID already exists.",
                errors={"employee_id": "Employee ID already registered."},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            admin_doc = UserService.create_admin_user(
                name=name,
                employee_id=employee_id,
                department=department,
                phone=phone,
                email=email,
                plain_password=password,
                role=role,
                status=user_status,
                created_by_name=request.user.name
            )

            return standard_success_response(
                message="Admin account created successfully",
                data={"admin": admin_doc},
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return standard_error_response(
                message=f"Database error during admin creation: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminStatusToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required to enable/disable admin accounts.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        status_val = str(request.data.get("status") or "active").strip().lower()
        success, msg = UserService.update_admin_status(pk, status_val)
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)

        return standard_success_response(message=msg, status_code=status.HTTP_200_OK)


class AdminPasswordResetView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required to reset admin passwords.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        new_password = str(request.data.get("new_password") or "")
        if not new_password or len(new_password) < 6:
            return standard_error_response(
                message="Password must be at least 6 characters long.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        success, msg = UserService.reset_admin_password(pk, new_password)
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)

        return standard_success_response(message=msg, status_code=status.HTTP_200_OK)


class AdminDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role not in ["admin", "super_admin"]:
            return standard_error_response(
                message="Forbidden. Admin permission required to delete admin accounts.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        success, msg = UserService.delete_admin_user(pk)
        if not success:
            return standard_error_response(message=msg, status_code=status.HTTP_400_BAD_REQUEST)

        return standard_success_response(message=msg, status_code=status.HTTP_200_OK)
