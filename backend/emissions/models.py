from django.db import models
from django.contrib.auth.models import User


# =========================
# COMPANY MODEL
# =========================
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    users = models.ManyToManyField(User, related_name="companies")

    def __str__(self):
        return self.name


# =========================
# AUDIT LOG
# =========================
class AuditLog(models.Model):
    record = models.ForeignKey("EmissionRecord", on_delete=models.CASCADE)
    action = models.CharField(max_length=50)

    old_value = models.CharField(max_length=50, null=True, blank=True)
    new_value = models.CharField(max_length=50, null=True, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.record.id} - {self.action}"


# =========================
# EMISSION RECORD
# =========================
class EmissionRecord(models.Model):

    SOURCE_CHOICES = [
        ("SAP", "SAP"),
        ("UTILITY", "Utility"),
        ("TRAVEL", "Travel"),
    ]

    SCOPE_CHOICES = [
        ("SCOPE_1", "Scope 1"),
        ("SCOPE_2", "Scope 2"),
        ("SCOPE_3", "Scope 3"),
    ]

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("LOCKED", "Locked"),
        ("FAILED", "Failed"),
    ]

    # =====================
    # MULTI TENANCY
    # =====================
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    source_type = models.CharField(max_length=50, choices=SOURCE_CHOICES, null=True, blank=True)
    scope = models.CharField(max_length=20, choices=SCOPE_CHOICES)
    category = models.CharField(max_length=100)
    activity_type = models.CharField(max_length=100)

    raw_value = models.FloatField(null=True, blank=True)
    normalized_value = models.FloatField(null=True, blank=True)

    travel_from = models.CharField(max_length=255, null=True, blank=True)
    travel_to = models.CharField(max_length=255, null=True, blank=True)
    travel_type = models.CharField(max_length=100, null=True, blank=True)
    travel_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    is_suspicious = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    failed_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.company.name if self.company else 'Unknown'} - {self.scope} - {self.activity_type}"