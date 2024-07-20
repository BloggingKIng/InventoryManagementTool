from rest_framework import permissions

class InventoryPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        
        if request.method in ['POST', 'PUT', 'DELETE']:
            if request.user.userType == 'Manager' or request.user.userType == 'Admin' or request.user.is_superuser:
                return True
            else:
                return False
            
class OrderPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return request.user.is_authenticated
        
        if request.method == 'POST':
            return request.user.is_authenticated
        
        if request.method in ['PUT', 'DELETE']:
            return request.user.userType == 'Manager' or request.user.userType == 'Admin' or request.user.is_superuser