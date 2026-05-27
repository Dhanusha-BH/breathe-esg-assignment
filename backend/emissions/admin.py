from django.contrib import admin
from .models import EmissionRecord


@admin.register(EmissionRecord)
class EmissionRecordAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "scope",
        "category",
        "activity_type",
        "status",
        "normalized_value",
        "is_suspicious",
    )

    list_filter = ("scope", "status", "category")

    search_fields = ("category", "activity_type", "scope")

    def get_fields(self, request, obj=None):

        base_fields = (
            "scope",
            "category",
            "activity_type",
            "raw_value",
            "normalized_value",
            "is_suspicious",
            "status",
        )

        return base_fields