# Generated by Django 5.0.7 on 2024-07-20 20:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('invenory', '0002_rename_invenory_inventory'),
    ]

    operations = [
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField()),
                ('prodct', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='invenory.inventory')),
            ],
        ),
        migrations.AlterField(
            model_name='order',
            name='products',
            field=models.ManyToManyField(to='invenory.orderitem'),
        ),
    ]
