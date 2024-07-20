from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Inventory, Order
from .serializers import InventorySerializer, OrderSerializer
from rest_framework.decorators import permission_classes
from .permissions import InventoryPermission
from rest_framework import status
# Create your views here.

class InventoryView(APIView):
    permission_classes = (InventoryPermission,)
    def get(self, request):
        inventory = Inventory.objects.all()
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        serializer = InventorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        inventory = Inventory.objects.filter(barcode=request.data['barcode']).first()
        inventory.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)