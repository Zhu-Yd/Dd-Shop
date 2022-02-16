from django.urls import path,re_path
from . import  views
urlpatterns = [
    re_path(r'^register/$', views.RegisterView.as_view(), name='register'),
]
