from django.urls import path
from .views import RegisterView, LoginView, ProfileView, MeView, ResetPasswordView, ChangePasswordView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('profile', ProfileView.as_view(), name='profile'),
    path('me', MeView.as_view(), name='me'),
    path('change-password', ChangePasswordView.as_view(), name='change-password'),
    path('reset-password', ResetPasswordView.as_view(), name='reset-password'),
]
