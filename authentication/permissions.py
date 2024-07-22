from rest_framework import permissions

class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
       if request.method == 'GET':
           return request.user.is_superuser or request.user.userType == 'manager' or request.user.userType == 'admin'
       if request.method == 'POST':
           return request.user.is_superuser or request.user.userType == 'admin' 
       if request.method == 'DELETE':
           return request.user.is_superuser or request.user.userType == 'admin' 
       if request.method in ['PUT', 'PATCH']:
           return request.user.is_superuser or request.user.userType == 'admin'