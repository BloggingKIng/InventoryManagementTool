from django.urls import path, include
from . import views

urlpatterns = [
    path('users/',views.UserView.as_view()),
    path('',include('djoser.urls')),
    path('',include('djoser.urls.authtoken')),
]