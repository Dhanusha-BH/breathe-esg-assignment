import pandas as pd
import math

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import EmissionRecord, AuditLog, Company
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


# =========================
# TOKEN
# =========================
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# =========================
# CLEANER
# =========================
import pandas as pd
import math

def clean(value):

    # Handles empty CSV cells
    if pd.isna(value):
        return None

    try:
        value = str(value).strip()

        # Handles blank strings
        if value == "":
            return None

        # Handles nan/none text
        if value.lower() in ["nan", "none"]:
            return None

        return float(value)

    except:
        return None


# =========================
# COMPANY
# =========================
def get_user_company(request):
    user = request.user
    if not user or not user.is_authenticated:
        return None
    return user.companies.first()


# =========================
# HOME
# =========================
@api_view(['GET'])
def home(request):
    return Response({"message": "Backend Running"})


# =========================
# DASHBOARD
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):

    company = get_user_company(request)
    if not company:
        return Response({"error": "No company assigned"})

    records = EmissionRecord.objects.filter(company=company)

    return Response({
        "total_records": records.count(),
        "scope_1": records.filter(scope="SCOPE_1").count(),
        "scope_2": records.filter(scope="SCOPE_2").count(),
        "scope_3": records.filter(scope="SCOPE_3").count(),
        "suspicious": records.filter(is_suspicious=True).count(),
        "pending": records.filter(status="PENDING").count(),
        "approved": records.filter(status="APPROVED").count(),
        "rejected": records.filter(status="REJECTED").count(),
        "locked": records.filter(status="LOCKED").count(),
        "failed": records.filter(status="FAILED").count(),
    })


# =========================
# LIST RECORDS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_records(request):

    company = get_user_company(request)

    records = EmissionRecord.objects.filter(company=company).order_by("-id")

    return Response([
        {
            "id": r.id,
            "scope": r.scope,
            "category": r.category,
            "activity_type": r.activity_type,
            "status": r.status,
            "normalized_value": r.normalized_value,
            "is_suspicious": r.is_suspicious,
            "travel_from": r.travel_from,
            "travel_to": r.travel_to,
            "travel_type": r.travel_type,
            "travel_date": r.travel_date,
            "source_type": r.source_type,
            "company_name": r.company.name if r.company else "Unknown",
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }
        for r in records
    ])


# =========================
# APPROVE / REJECT / LOCK
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_record(request, record_id):
    record = get_object_or_404(EmissionRecord, id=record_id)
    old = record.status
    record.status = "APPROVED"
    record.save()

    AuditLog.objects.create(record=record, action="APPROVED", old_value=old, new_value="APPROVED")
    return Response({"message": "Approved"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_record(request, record_id):
    record = get_object_or_404(EmissionRecord, id=record_id)
    old = record.status
    record.status = "REJECTED"
    record.save()

    AuditLog.objects.create(record=record, action="REJECTED", old_value=old, new_value="REJECTED")
    return Response({"message": "Rejected"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def lock_record(request, record_id):
    record = get_object_or_404(EmissionRecord, id=record_id)
    old = record.status
    record.status = "LOCKED"
    record.save()

    AuditLog.objects.create(record=record, action="LOCKED", old_value=old, new_value="LOCKED")
    return Response({"message": "Locked"})


# =========================
# SAP UPLOAD
# =========================
# =========================
# SAP UPLOAD
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_sap_csv(request):

    company = get_user_company(request)

    df = pd.read_csv(request.FILES['file'])
    df.columns = df.columns.str.strip()

    print("COLUMNS:", df.columns.tolist())
    print(df.head())
    print(df.to_dict('records'))

    for _, row in df.iterrows():

        print("SAP ROW:", row.to_dict())

        material = str(row.get("Material")).strip()

        qty_raw = row.get("Quantity")
        qty = clean(qty_raw)

        print("RAW QTY:", qty_raw)
        print("CLEAN QTY:", qty)

        unit = str(row.get("Unit")).strip()

        # FAILED RECORD
        if qty is None or qty <= 0 or material == "":

            EmissionRecord.objects.create(
                company=company,
                source_type="SAP",
                scope="SCOPE_1",
                category="Fuel",
                activity_type="INVALID",
                raw_value=0,
                normalized_value=0,
                status="FAILED",
                is_suspicious=True,
                failed_reason="Invalid SAP data"
            )

        # VALID RECORD
        else:

            normalized = qty * 1000 if unit.upper() == "KL" else qty

            EmissionRecord.objects.create(
                company=company,
                source_type="SAP",
                scope="SCOPE_1",
                category="Fuel",
                activity_type=material,
                raw_value=qty,
                normalized_value=normalized,
                status="PENDING",
                is_suspicious=False
            )

    return Response({"message": "SAP uploaded"})
# =========================
# TRAVEL UPLOAD
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_travel_csv(request):

    company = get_user_company(request)

    df = pd.read_csv(request.FILES['file'])
    df.columns = df.columns.str.strip()

    print("COLUMNS:", df.columns.tolist())
    print(df.head())

    for _, row in df.iterrows():

        travel_from = str(row.get("From")).strip()
        travel_to = str(row.get("To")).strip()
        travel_type = str(row.get("TravelType")).strip()

        # FIX NaN VALUES
        if travel_from.lower() == "nan":
            travel_from = ""

        if travel_to.lower() == "nan":
            travel_to = ""

        if travel_type.lower() == "nan":
            travel_type = ""

        cost_raw = row.get("Cost")

        # CLEAN COST
        try:
            cost = float(str(cost_raw).replace(",", "").strip())
        except:
            cost = None

        # FAILED RECORD
        if (
            cost is None or cost <= 0 or
            travel_from == "" or
            travel_to == "" or
            travel_type == ""
        ):

            EmissionRecord.objects.create(
                company=company,
                source_type="TRAVEL",
                scope="SCOPE_3",
                category="Travel",
                activity_type="INVALID",
                raw_value=0,
                normalized_value=0,
                travel_from=travel_from,
                travel_to=travel_to,
                travel_type=travel_type,
                status="FAILED",
                is_suspicious=True,
                failed_reason="Invalid Travel data"
            )

        # VALID RECORD
        else:

            EmissionRecord.objects.create(
                company=company,
                source_type="TRAVEL",
                scope="SCOPE_3",
                category="Travel",
                activity_type=travel_type,
                raw_value=cost,
                normalized_value=cost * 0.2,
                travel_from=travel_from,
                travel_to=travel_to,
                travel_type=travel_type,
                status="PENDING",
                is_suspicious=False
            )

    return Response({"message": "Travel uploaded"})
# =========================
# UTILITY UPLOAD
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_utility_csv(request):

    company = get_user_company(request)

    df = pd.read_csv(request.FILES['file'])
    df.columns = df.columns.str.strip()

    for _, row in df.iterrows():

        kwh = clean(row.get("kWh"))

        if kwh is None or kwh <= 0:
            record = EmissionRecord.objects.create(
                company=company,
                source_type="UTILITY",
                scope="SCOPE_2",
                category="Electricity",
                activity_type="Electricity",
                raw_value=0,
                normalized_value=0,
                status="FAILED",
                is_suspicious=True,
                failed_reason="Invalid Utility data"
            )

            AuditLog.objects.create(
                record=record,
                action="FAILED",
                old_value="RAW",
                new_value="FAILED"
            )
            continue

        co2 = kwh * 0.82

        record = EmissionRecord.objects.create(
            company=company,
            source_type="UTILITY",
            scope="SCOPE_2",
            category="Electricity",
            activity_type="Electricity",
            raw_value=kwh,
            normalized_value=co2,
            status="PENDING",
            is_suspicious=False
        )

        AuditLog.objects.create(
            record=record,
            action="INGESTED",
            old_value="RAW",
            new_value="PENDING"
        )

    return Response({"message": "Utility uploaded"})


# =========================
# TRAVEL UPLOAD
# =========================

# =========================
# FAILED RECORDS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def failed_records(request):

    company = get_user_company(request)

    records = EmissionRecord.objects.filter(company=company, status="FAILED")

    return Response([
        {
            "id": r.id,
            "scope": r.scope,
            "category": r.category,
            "activity_type": r.activity_type,
            "value": r.raw_value,
            "source_type": r.source_type,
            "failed_reason": r.failed_reason,
            "company_name": r.company.name if r.company else "Unknown"
        }
        for r in records
    ])


# =========================
# RECORD DETAIL
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_record_detail(request, record_id):

    company = get_user_company(request)

    record = get_object_or_404(EmissionRecord, id=record_id, company=company)

    return Response({
        "id": record.id,
        "scope": record.scope,
        "category": record.category,
        "activity_type": record.activity_type,
        "status": record.status,
        "normalized_value": record.normalized_value,
        "source_type": record.source_type,
        "travel_from": record.travel_from,
        "travel_to": record.travel_to,
        "travel_type": record.travel_type,
        "travel_date": record.travel_date,
        "is_suspicious": record.is_suspicious,
        "company_name": record.company.name if record.company else "Unknown",
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    })


# =========================
# COMPANIES
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_companies(request):

    user = request.user

    return Response([
        {"id": c.id, "name": c.name}
        for c in user.companies.all()
    ])


# =========================
# AUDIT LOGS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def audit_logs(request):

    company = get_user_company(request)

    logs = AuditLog.objects.filter(record__company=company).order_by('-timestamp')

    return Response([
        {
            "record_id": log.record.id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "timestamp": log.timestamp,
        }
        for log in logs
    ])