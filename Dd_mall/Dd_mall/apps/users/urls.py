from django.urls import re_path
from . import views
urlpatterns = [
    re_path(r'^register/$', views.RegisterView.as_view(), name='register'),
]
