from rest_framework import serializers
from .models import Inventory, Order

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    products = InventorySerializer(many=True)
    class Meta:
        model = Order
        fields = '__all__'