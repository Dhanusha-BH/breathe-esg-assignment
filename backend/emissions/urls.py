from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView

urlpatterns = [
    # =========================
    # HOME
    # =========================
    path('', views.home),

    # =========================
    # AUTH
    # =========================
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # =========================
    # UPLOAD
    # =========================
    path('upload-sap/', views.upload_sap_csv),
    path('upload-utility/', views.upload_utility_csv),
    path('upload-travel/', views.upload_travel_csv),

    # =========================
    # DASHBOARD
    # =========================
    path('dashboard/', views.dashboard_summary),

    # =========================
    # RECORDS
    # =========================
    path('records/', views.list_records),
    path('records/<int:record_id>/', views.get_record_detail),

    # =========================
    # AUDIT + FAILURES
    # =========================
    path('audit-logs/', views.audit_logs),
    path('failed-records/', views.failed_records),

    # =========================
    # COMPANIES
    # =========================
    path('companies/', views.list_companies),

    # =========================
    # ACTIONS
    # =========================
    path('approve/<int:record_id>/', views.approve_record),
    path('reject/<int:record_id>/', views.reject_record),
    path('lock/<int:record_id>/', views.lock_record),
]