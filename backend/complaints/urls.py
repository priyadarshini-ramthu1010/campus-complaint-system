from django.urls import path
from .views import (
    ComplaintListCreateView,
    ComplaintDetailView,
    AssignStaffView,
    UpdateStatusView,
    DashboardStatsView,
    AIChatAssistantView,
    AssignedComplaintsView,
    NotificationsView,
    NotificationReadView,
    NotificationMarkAllReadView,
    StaffDashboardView,
    UploadImageUploadView
)

urlpatterns = [
    path('complaints', ComplaintListCreateView.as_view(), name='complaints-list-create'),
    path('complaints/upload-image', UploadImageUploadView.as_view(), name='complaints-upload-image'),
    path('complaints/<str:pk>', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('complaints/<str:pk>/assign', AssignStaffView.as_view(), name='complaint-assign-staff'),
    path('complaints/<str:pk>/status', UpdateStatusView.as_view(), name='complaint-update-status'),
    path('admin/dashboard', DashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('ai/chat', AIChatAssistantView.as_view(), name='ai-chat-assistant'),

    # Requested API aliases
    path('staff/dashboard', StaffDashboardView.as_view(), name='staff-dashboard'),
    path('assign-staff', AssignStaffView.as_view(), name='assign-staff-alias'),
    path('staff/assigned-complaints', AssignedComplaintsView.as_view(), name='staff-assigned-complaints'),
    path('complaints/update-status', UpdateStatusView.as_view(), name='update-status-global'),
    path('notifications', NotificationsView.as_view(), name='notifications-list'),
    path('notifications/read', NotificationMarkAllReadView.as_view(), name='notifications-mark-all-read'),
    path('notifications/<str:pk>', NotificationsView.as_view(), name='notifications-user'),
    path('notifications/<str:pk>/read', NotificationReadView.as_view(), name='notification-read-pk'),
]
