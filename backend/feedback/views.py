from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from utils.response import standard_success_response, standard_error_response
from .services import FeedbackService

class FeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != "student":
            return standard_error_response(
                message="Forbidden. Only students can submit feedback.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        complaint_id = data.get("complaint_id")
        rating = data.get("rating")
        comment = data.get("comment", "").strip()

        if not complaint_id or rating is None:
            return standard_error_response(
                message="Complaint ID and Rating are required",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                raise ValueError()
        except ValueError:
            return standard_error_response(
                message="Rating must be an integer between 1 and 5",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        success, msg = FeedbackService.create_feedback(
            complaint_id=complaint_id,
            student_id=request.user.id,
            student_name=request.user.name,
            rating=rating,
            comment=comment
        )

        if not success:
            return standard_error_response(
                message=msg,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        return standard_success_response(
            message="Feedback submitted successfully",
            status_code=status.HTTP_211_CREATED if hasattr(status, 'HTTP_211_CREATED') else status.HTTP_201_CREATED
        )

    def get(self, request):
        if request.user.role != "admin":
            return standard_error_response(
                message="Forbidden. Admin permission required.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        try:
            feedbacks = FeedbackService.get_all_feedbacks()
            return standard_success_response(
                message="Feedbacks retrieved successfully",
                data={"feedbacks": feedbacks},
                status_code=status.HTTP_200_OK
            )
        except Exception as e:
            return standard_error_response(
                message=f"Failed to fetch feedback logs: {str(e)}",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
