from rest_framework import serializers
from .models import Inventory, Order, OrderItem

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = InventorySerializer()
    class Meta:
        model = OrderItem
        fields = '__all__'
    

class OrderSerializer(serializers.ModelSerializer):
    products = OrderItemSerializer(many=True)
    total_price = serializers.SerializerMethodField()
    class Meta:
        model = Order
        fields = '__all__'

    def get_total_price(self, obj):
        total = 0
        for product in obj.products.all():
            price = product.product.price
            price = price * product.quantity
            total += price
        return total