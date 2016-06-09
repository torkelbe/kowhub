from __future__ import unicode_literals
from django.db import models
# Create your models here.

class Army(models.Model):
    name = models.CharField(max_length=30)
    alignment = models.CharField(max_length=10)

class Unit(models.Model):
    army = models.ForeignKey(Army, on_delete=models.CASCADE)
    unit_type = models.CharField(max_length=20)
