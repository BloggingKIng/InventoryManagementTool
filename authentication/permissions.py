from rest_framework import permissions

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.userType == 'Manager' or request.user.userType == 'Admin' or request.user.is_superuser:
            return True
        else:
            return False