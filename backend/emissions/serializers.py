from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # 🔥 ADD CUSTOM CLAIMS
        token["username"] = user.username
        token["email"] = user.email

        # 👉 ROLE (from groups or custom field)
        token["role"] = "admin" if user.is_superuser else "analyst"

        return token