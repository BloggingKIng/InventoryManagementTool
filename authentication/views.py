from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework import status
import random

from .models import User
from .serializers import UserSerializer
from .permissions import IsManager

class UserView(APIView):
    # For future self :) , we only want the manager or super user to be able to create accounts. Because the system 
    # is intended for small stores and we dont want everyone to be able to signup and view/modify the data
    permission_classes = (IsManager,)  
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        email = request.data['email']
        password = request.data['password']
        userName = request.data['email'].split('@')[0] + str(random.randint(1, 9999))
        userType = request.data['userType']
        if userType.lower() not in ['manager','cashier','admin']:
            return Response({'message': 'Invalid user type'}, status=status.HTTP_400_BAD_REQUEST)
        user = UserSerializer(data={'email': email, 'password': password, 'username': userName, 'userType': userType})
        if user.is_valid():
            user.save()
            return Response(user.data, status=status.HTTP_201_CREATED)
        return Response(user.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        email = request.data['email']
        user = User.objects.filter(email=email).first()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
