from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from complaints.views import serve_db_image

urlpatterns = [
    path('media/complaints/<str:filename>', serve_db_image, name='serve-db-image'),
    path('api/', include('authentication.urls')),
    path('api/', include('users.urls')),
    path('api/', include('complaints.urls')),
    path('api/', include('feedback.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
