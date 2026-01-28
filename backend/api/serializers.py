from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import (
    Customer, Vendor, Store, StorePhoto, Product, ProductMedia,
    Category, Brand, CartItem, Order, OrderItem, OrderStatus,
    CancelledItem, WishlistItem, Promotion, Review
)



# Authentication Serializers

class CustomerRegisterSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    firstName = serializers.CharField(max_length=100, required=False, allow_blank=True)
    lastName = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phoneNo = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shippingAddress1 = serializers.CharField(required=False, allow_blank=True)
    shippingAddress2 = serializers.CharField(required=False, allow_blank=True)
    shippingAddress3 = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        # Create Django User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Create Customer Profile
        customer = Customer.objects.create(
            user=user,
            firstName=validated_data.get('firstName', ''),
            lastName=validated_data.get('lastName', ''),
            phoneNo=validated_data.get('phoneNo', ''),
            shippingAddress1=validated_data.get('shippingAddress1', ''),
            shippingAddress2=validated_data.get('shippingAddress2', ''),
            shippingAddress3=validated_data.get('shippingAddress3', '')
        )
        # Create Token
        Token.objects.create(user=user)
        return customer


class VendorRegisterSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    phoneNo = serializers.CharField(max_length=20, required=False, allow_blank=True)
    profileImage = serializers.ImageField(required=False, allow_null=True)

    def create(self, validated_data):
        # Create Django User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Create Vendor Profile
        vendor = Vendor.objects.create(
            user=user,
            phoneNo=validated_data.get('phoneNo', ''),
            profileImage=validated_data.get('profileImage', None)
        )
        # Create Token
        Token.objects.create(user=user)
        return vendor


class LoginSerializer(serializers.Serializer):

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return data


# User Serializers

class CustomerSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['customerID', 'user', 'firstName', 'lastName', 'phoneNo', 'shippingAddress1', 'shippingAddress2', 'shippingAddress3', 'createdTime']
        read_only_fields = ['customerID', 'createdTime']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email
        }


class VendorSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = ['vendorID', 'user', 'phoneNo', 'profileImage', 'createdTime']
        read_only_fields = ['vendorID', 'createdTime']

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email
        }



# Brand & Category Serializers

class BrandSerializer(serializers.ModelSerializer):

    class Meta:
        model = Brand
        fields = ['brandID', 'brandName', 'description', 'logoURL']
        read_only_fields = ['brandID']


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ['categoryID', 'categoryName', 'description']
        read_only_fields = ['categoryID']



# Store Serializers

class StorePhotoSerializer(serializers.ModelSerializer):

    class Meta:
        model = StorePhoto
        fields = ['storePhotoID', 'photoURL', 'sortedOrder', 'isPrimary', 'uploadedTime']
        read_only_fields = ['storePhotoID', 'uploadedTime']


class StoreSerializer(serializers.ModelSerializer):

    photos = StorePhotoSerializer(many=True, read_only=True)
    vendor_username = serializers.CharField(source='vendorID.user.username', read_only=True)

    class Meta:
        model = Store
        fields = ['storeID', 'vendor_username', 'storeName', 'description', 'photos', 'createdTime']
        read_only_fields = ['storeID', 'createdTime']



# Product Serializers

class ProductMediaSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductMedia
        fields = ['productMediaID', 'mediaURL', 'mediaType', 'mediaContent', 'isPrimary', 'sortedOrder']
        read_only_fields = ['productMediaID']


class ProductListSerializer(serializers.ModelSerializer):
 
    brand_name = serializers.CharField(source='brand.brandName', read_only=True)
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    store_name = serializers.CharField(source='storeID.storeName', read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_rate = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'productID', 'productName', 'price', 'quantity',
            'brand_name', 'category_name', 'store_name',
            'primary_image', 'discount_rate', 'discounted_price', 'createdTime'
        ]
        read_only_fields = ['productID']

    def get_primary_image(self, obj):
        media = obj.media.filter(isPrimary=True).first()
        return media.mediaURL if media else None

    def get_discount_rate(self, obj):
        promo = obj.promotions.filter(status='Active').first()
        return promo.discountRate if promo and promo.is_active() else 0

    def get_discounted_price(self, obj):
        promo = obj.promotions.filter(status='Active').first()
        if promo and promo.is_active():
            discount = obj.price * promo.discountRate / 100
            return float(obj.price - discount)
        return float(obj.price)


class ProductDetailSerializer(serializers.ModelSerializer):

    brand_name = serializers.CharField(source='brand.brandName', read_only=True)
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    store = StoreSerializer(source='storeID', read_only=True)
    media = ProductMediaSerializer(many=True, read_only=True)
    discount_rate = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'productID', 'productName', 'description', 'price', 'quantity',
            'availability', 'brand_name', 'category_name', 'store',
            'media', 'discount_rate', 'discounted_price', 'createdTime', 'updatedTime'
        ]
        read_only_fields = ['productID', 'createdTime', 'updatedTime']

    def get_discount_rate(self, obj):
        promo = obj.promotions.filter(status='Active').first()
        return promo.discountRate if promo and promo.is_active() else 0

    def get_discounted_price(self, obj):
        promo = obj.promotions.filter(status='Active').first()
        if promo and promo.is_active():
            discount = obj.price * promo.discountRate / 100
            return float(obj.price - discount)
        return float(obj.price)


class ProductCreateUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = [
            'productID', 'productName', 'description', 'price', 'quantity',
            'availability', 'isHidden', 'brand', 'category'
        ]
        read_only_fields = ['productID']



# Cart Serializers

class CartItemSerializer(serializers.ModelSerializer):

    product = ProductListSerializer(source='productID', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'subtotal', 'addedTime']
        read_only_fields = ['id', 'addedTime']

    def get_subtotal(self, obj):
        # Get effective price (discounted if active promotion)
        promo = obj.productID.promotions.filter(status='Active').first()
        if promo and promo.is_active():
            effective_price = obj.productID.price * (1 - promo.discountRate / 100)
        else:
            effective_price = obj.productID.price
        return float(effective_price * obj.quantity)



# Order Serializers

class OrderItemSerializer(serializers.ModelSerializer):
 
    product_details = ProductListSerializer(source='productID', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['orderItemID', 'product_details', 'productName', 'quantity', 'paidPrice']
        read_only_fields = ['orderItemID']


class OrderStatusSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = OrderStatus
        fields = ['orderStatusID', 'status', 'updatedDate']
        read_only_fields = ['orderStatusID', 'updatedDate']


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['orderID', 'customer_name', 'orderDate', 'shippingAddress', 'totalAmount', 'items']
        read_only_fields = ['orderID', 'orderDate']

    def get_customer_name(self, obj):
        return f"{obj.customerID.firstName} {obj.customerID.lastName}".strip()



# Wishlist Serializer

class WishlistItemSerializer(serializers.ModelSerializer):

    product = ProductListSerializer(source='productID', read_only=True)

    class Meta:
        model = WishlistItem
        fields = [
            'wishlistItemID', 'product', 'addedDate', 'isNotified',
            'original_price_at_added', 'discount_rate_at_added', 'price_at_added'
        ]
        read_only_fields = ['wishlistItemID', 'addedDate']



# Review Serializer

class ReviewSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(source='orderItemID.productName', read_only=True)

    class Meta:
        model = Review
        fields = ['reviewID', 'product_name', 'comment', 'rating', 'createdDate']
        read_only_fields = ['reviewID', 'createdDate']



# Promotion Serializer

class PromotionSerializer(serializers.ModelSerializer):
    
    product_name = serializers.CharField(source='productID.productName', read_only=True)
    is_active = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = ['promotionID', 'product_name', 'discountRate', 'startDate', 'endDate', 'status', 'is_active']
        read_only_fields = ['promotionID']

    def get_is_active(self, obj):
        return obj.is_active()


