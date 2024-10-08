from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Inventory, Order, OrderItem, StockAlert, Alert
from .serializers import InventorySerializer, OrderSerializer, StockAlertSerializer, AlertSerializer
from rest_framework.decorators import permission_classes
from .permissions import InventoryPermission, OrderPermission, StatsPermission
from rest_framework import status
from rest_framework.decorators import api_view
from authentication.models import User
from datetime import datetime, timedelta
from django.utils import timezone
import json
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
        id = request.data['id']
        try:
            inventory_item = Inventory.objects.get(pk=id)
        except Inventory.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = InventorySerializer(inventory_item, data=request.data, partial=True)  
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        inventory = Inventory.objects.filter(barcode=request.data['barcode']).first()
        inventory.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_inventory_details(request, barcode):
    inventory = Inventory.objects.filter(barcode=barcode).first()
    if not inventory or inventory.quantity <= 0:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = InventorySerializer(inventory)
    return Response(serializer.data, status=status.HTTP_200_OK)
    
class OrderView(APIView):
    permission_classes = (OrderPermission,)
    def get(self, request):
        orders = Order.objects.all()
        # orders = orders.order_by('-orderDate')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        customer_name = request.data['customer_name']
        customer_phone = request.data['customer_phone']
        product_data = request.data['order_items'] # We expect it to be a dict storing values in the format produc_id: quatity 
        product_data = json.loads(product_data)
        order_items = []
        for product_id, quantity in product_data.items():
            product_id = int(product_id)
            quantity = int(quantity)
            product = Inventory.objects.filter(id=product_id).first()
            if not product:
                continue
            order_item = OrderItem.objects.create(product=product, quantity=quantity)
            order_item.save()
            product.quantity -= quantity
            product.save()
            stock_alerts = StockAlert.objects.filter(product=product)
            for alerts in stock_alerts:
                if product.quantity <= alerts.threshold:
                    for users in User.objects.filter(userType__in=['admin', 'manager', 'Admin','Manager']):
                        alert = Alert.objects.create(user=users, content=f"Stock for {product.productName} ({product.barcode}) is below threshold. Current stock: {product.quantity}. Threshold: {alerts.threshold}")
                        alert.save()
            order_items.append(order_item)
        
        order = Order.objects.create(customerName=customer_name, customerPhone=customer_phone)
        order.products.set(order_items)
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    def delete(self, request):
        order = Order.objects.filter(orderId=request.data['orderId']).first()
        for order_item in order.products.all():
            order_item.product.quantity += order_item.quantity
            order_item.product.save()
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_order_details(request, orderId):
    order = Order.objects.filter(orderId=f"#{orderId}").first()
    if not order:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = OrderSerializer(order)
    return Response(serializer.data)

class StockAlertView(APIView):
    permission_classes = (InventoryPermission,)
    def get(self, request):
        stock_alerts = StockAlert.objects.all()
        serializer = StockAlertSerializer(stock_alerts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            product_ids = request.data['product_ids']
            print(product_ids)
            product_ids = json.loads(product_ids)
        except KeyError:
            return Response({"error": "Field product_ids is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            threshold = request.data['threshold']
        except KeyError:
            return Response({"error": "Field threshold is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        print(product_ids)
        data = []

        for product_id in product_ids:
            product = Inventory.objects.filter(id=product_id).first()
            product = InventorySerializer(product).data
            if not product:
                continue
            stock_alert = StockAlertSerializer(data={'product_id': product_id, 'threshold': threshold})
            if stock_alert.is_valid():
                stock_alert.save()
            else:
                return Response(stock_alert.errors, status=status.HTTP_400_BAD_REQUEST)

            data.append(dict(stock_alert.data))

        return Response(data,status=status.HTTP_201_CREATED)

    def delete(self, request):
        stock_id = request.data['stock_id']
        stock = StockAlert.objects.filter(id=stock_id).first()
        if not stock:
            return Response({"error": "Stock alert not found"}, status=status.HTTP_404_NOT_FOUND)
        stock.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def put(self, request):
        stock_id = request.data['stock_id']
        stock = StockAlert.objects.filter(id=stock_id).first()
        if not stock:
            return Response({"error": "Stock alert not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = StockAlertSerializer(stock, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DisplayAlerts(APIView):
    def get(self, request):
        user = request.user
        alerts = Alert.objects.filter(user=user)
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        # Its just for marking the alerts as seen
        id = request.data['id']
        alert = Alert.objects.filter(id=id).first()
        seen = request.data['seen']
        if not alert:
            return Response({"error": "Alert not found"}, status=status.HTTP_404_NOT_FOUND)
        alert.seen = seen
        alert.save()
        return Response(status=status.HTTP_200_OK)
    
    def delete(self, request):
        id = request.data['id']
        alert = Alert.objects.filter(id=id).first()
        if not alert:
            return Response({"error": "Alert not found"}, status=status.HTTP_404_NOT_FOUND)
        alert.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
@permission_classes([StatsPermission])
def get_stats(request):
    products = Inventory.objects.all()
    # orders = Order.objects.all()
    # we want to find the sales in last 7 days, last 30 days and all time sales 
    # of the products
    sales_in_7_days = 0
    sales_in_30_days = 0
    sales_in_all_time = 0
    sales_today = 0
    value_in_7_days = 0
    value_in_30_days = 0
    value_in_all_time = 0
    sales_value_today = 0
    products_data = []
    for product in products:
        sales_data = {}
        filtered_orders = Order.objects.filter(products__product=product)
        sales_value = 0
        sales = 0
        todaySales =0
        sales7days = 0
        sales30days = 0
        value7days = 0
        value30days = 0
        todaySalesValue = 0
        sevenDaysAgo = timezone.now() - timedelta(days=7)
        thirtyDaysAgo = timezone.now() - timedelta(days=30)
        oneDayAgo = timezone.now() - timedelta(days=1)
        for order in filtered_orders:
            sales += order.products.filter(product=product).first().quantity
            todaySales += order.products.filter(product=product).first().quantity if order.orderDate >= oneDayAgo else 0
            sales7days += order.products.filter(product=product).first().quantity if order.orderDate >= sevenDaysAgo else 0
            sales30days += order.products.filter(product=product).first().quantity if order.orderDate >= thirtyDaysAgo else 0
            sales_value = sales * product.price
            value7days = sales7days * product.price
            value30days = sales30days * product.price    
            todaySalesValue = todaySales * product.price    

        sales_in_all_time += sales
        value_in_all_time += sales_value
        sales_in_7_days += sales7days
        sales_in_30_days += sales30days
        value_in_7_days += value7days
        value_in_30_days += value30days
        sales_value_today += todaySalesValue
        sales_today += todaySales
        products_data.append(sales_data)
    
        sales_data['name'] = product.productName
        sales_data['barcode'] = product.barcode
        sales_data['price'] = product.price
        sales_data['sale_quantity'] = sales
        sales_data['sales_today'] = todaySales
        sales_data['sale_quantity_in_7_days'] = sales7days
        sales_data['sale_quantity_in_30_days'] = sales30days
        sales_data['sale_value'] = sales_value
        sales_data['sale_value_today'] = todaySalesValue
        sales_data['sale_value_in_7_days'] = value7days
        sales_data['sale_value_in_30_days'] = value30days

    data = {
        'sales_today': sales_today,
        'sales_in_7_days': sales_in_7_days,
        'sales_in_30_days': sales_in_30_days,
        'sales_in_all_time': sales_in_all_time,
        'sales_value_today': sales_value_today,
        'value_in_7_days': value_in_7_days,
        'value_in_30_days': value_in_30_days,
        'value_in_all_time': value_in_all_time,
        'totalOrders': len(Order.objects.all()),
        'orders_in_7_days': len(Order.objects.filter(orderDate__gte=timezone.now() - timedelta(days=7))),
        'orders_in_30_days': len(Order.objects.filter(orderDate__gte=timezone.now() - timedelta(days=30))),
        'orders_today': len(Order.objects.filter(orderDate__gte=timezone.now() - timedelta(days=1))),
        'product_data': products_data
    }

    return Response(data, status=status.HTTP_200_OK)
        