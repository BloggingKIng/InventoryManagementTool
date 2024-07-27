from django.urls import path
from . import views

urlpatterns  = [
    path('inventory/',views.InventoryView.as_view()),
    path('inventory/<str:barcode>/',views.get_inventory_details),
    path('order/',views.OrderView.as_view()),
    path('order/<str:orderId>/',views.get_order_details),
    path('stock-alert/',views.StockAlertView.as_view()),
    path('user/alerts/',views.DisplayAlerts.as_view()),
    path('sales/',views.get_stats),
]