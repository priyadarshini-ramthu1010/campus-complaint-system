from django.urls import path
from .views import (
    UserListView, 
    RegisterStaffView, 
    AdminManagementView, 
    AdminStatusToggleView, 
    AdminPasswordResetView, 
    AdminDeleteView
)

urlpatterns = [
    path('users', UserListView.as_view(), name='users-list'),
    path('users/staff', RegisterStaffView.as_view(), name='register-staff'),
    path('users/admins', AdminManagementView.as_view(), name='admin-management-list-create'),
    path('users/admins/<str:pk>/status', AdminStatusToggleView.as_view(), name='admin-status-toggle'),
    path('users/admins/<str:pk>/password', AdminPasswordResetView.as_view(), name='admin-password-reset'),
    path('users/admins/<str:pk>', AdminDeleteView.as_view(), name='admin-delete'),
]
