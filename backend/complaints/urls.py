from django.urls import path
from .views import (
    ComplaintListCreateView,
    ComplaintDetailView,
    AssignStaffView,
    UpdateStatusView,
    DashboardStatsView,
    AIChatAssistantView
)

urlpatterns = [
    path('complaints', ComplaintListCreateView.as_view(), name='complaints-list-create'),
    path('complaints/<str:pk>', ComplaintDetailView.as_view(), name='complaint-detail'),
    path('complaints/<str:pk>/assign', AssignStaffView.as_view(), name='complaint-assign-staff'),
    path('complaints/<str:pk>/status', UpdateStatusView.as_view(), name='complaint-update-status'),
    path('admin/dashboard', DashboardStatsView.as_view(), name='admin-dashboard-stats'),
    path('ai/chat', AIChatAssistantView.as_view(), name='ai-chat-assistant'),
]
