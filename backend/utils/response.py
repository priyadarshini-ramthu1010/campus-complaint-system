from rest_framework.response import Response
from rest_framework import status

def standard_success_response(message="Success", data=None, status_code=status.HTTP_200_OK):
    """
    Returns a unified success JSON structure:
    {
      "success": true,
      "message": "...",
      "data": {...}
    }
    """
    return Response({
        "success": True,
        "message": message,
        "data": data if data is not None else {}
    }, status=status_code)

def standard_error_response(message="Error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Returns a unified error JSON structure:
    {
      "success": false,
      "message": "...",
      "errors": {...}
    }
    """
    return Response({
        "success": False,
        "message": message,
        "errors": errors if errors is not None else {}
    }, status=status_code)
