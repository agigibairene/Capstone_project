from django.contrib import admin
from .models import *


# Register your models here.
class InvestorAdmin(admin.ModelAdmin):
    prepopulated_fields = {}


admin.site.register(User)
admin.site.register(Investor)
admin.site.register(Farmer)