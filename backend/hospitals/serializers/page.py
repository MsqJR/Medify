from rest_framework import serializers
from hospitals.models import Page, Block


class BlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Block
        fields = '__all__'
        read_only_fields = ('id', 'page', 'created_at', 'updated_at')


class PageSerializer(serializers.ModelSerializer):
    blocks = BlockSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = '__all__'
        read_only_fields = ('id', 'website_setup', 'created_at', 'updated_at')
