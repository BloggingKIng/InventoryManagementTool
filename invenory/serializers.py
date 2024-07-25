from rest_framework import serializers
from .models import Inventory, Order, OrderItem, StockAlert, Alert
from authentication.serializers import UserSerializer

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
    
class StockAlertSerializer(serializers.ModelSerializer):
    product = InventorySerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Inventory.objects.all())
    class Meta:
        model = StockAlert
        fields = '__all__'

    def create(self, validated_data):
        print(validated_data)
        return StockAlert.objects.create(product=validated_data['product_id'], threshold=validated_data['threshold'])

class AlertSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = Alert
        fields = '__all__'