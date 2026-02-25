from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import (
    Customer, Vendor, Store, StorePhoto, Product, ProductMedia,
    Category, Brand, CartItem, Order, OrderItem,
    WishlistItem, Promotion, Review
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
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value


class VendorRegisterSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    phoneNo = serializers.CharField(max_length=20, required=False, allow_blank=True)
    # profileImage = serializers.ImageField(required=False, allow_null=True)
    storeName = serializers.CharField(max_length=100)
    firstName = serializers.CharField(max_length=100, required=False, allow_blank=True)
    lastName = serializers.CharField(max_length=100, required=False, allow_blank=True)


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
            firstName=validated_data.get('firstName', ''),
            lastName=validated_data.get('lastName', '')
            # profileImage=validated_data.get('profileImage', None)
        )
        store = Store.objects.create(
            vendorID=vendor,
            storeName=validated_data.get('storeName', '')
        )
        # Create Token
        Token.objects.create(user=user)
        return vendor
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        data['user'] = user
        return data


# User Serializers

class CustomerSerializer(serializers.ModelSerializer):

    user = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ['customerID', 'user', 'firstName', 'lastName', 'phoneNo', 'profileImage', 'shippingAddress1', 'shippingAddress2', 'shippingAddress3', 'createdTime']
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
        fields = ['vendorID', 'user', 'firstName', 'lastName', 'phoneNo', 'profileImage', 'createdTime']
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
    vendor_profileImage = serializers.CharField(source='vendorID.profileImage', read_only=True)

    class Meta:
        model = Store
        fields = ['storeID', 'vendor_username', 'vendor_profileImage', 'storeName', 'description', 'photos', 'createdTime']
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
        return media.mediaURL.url if media else None

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
    brand_id = serializers.IntegerField(source='brand.brandID', read_only=True)
    category_name = serializers.CharField(source='category.categoryName', read_only=True)
    category_id = serializers.IntegerField(source='category.categoryID', read_only=True)
    store = StoreSerializer(source='storeID', read_only=True)
    media = ProductMediaSerializer(many=True, read_only=True)
    discount_rate = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'productID', 'productName', 'description', 'price', 'quantity',
            'availability', 'brand_name', 'brand_id', 'category_name', 'category_id', 'store',
            'media', 'discount_rate', 'discounted_price', 'createdTime', 'updatedTime', 'isHidden'
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


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(source='customerID.user.username', read_only=True)
    customer_profileImage = serializers.CharField(source='customerID.profileImage', read_only=True)
    storeName = serializers.SerializerMethodField()
    vendor_profileImage = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['orderID', 'customer_username', 'customer_profileImage', 'storeName', 'vendor_profileImage', 'firstName', 'lastName', 'phoneNo', 'orderDate', 'shippingAddress1', 'shippingAddress2', 'shippingAddress3', 'totalAmount', 'status', 'statusUpdatedDate', 'cancellationReason', 'refundRequest', 'refundReason', 'items']
        read_only_fields = ['orderID', 'orderDate', 'statusUpdatedDate']

    def _get_store(self, obj):
        item = obj.items.select_related('productID__storeID__vendorID').first()
        return item.productID.storeID if item else None

    def get_storeName(self, obj):
        store = self._get_store(obj)
        return store.storeName if store else None

    def get_vendor_profileImage(self, obj):
        store = self._get_store(obj)
        if not store or not store.vendorID.profileImage:
            return None
        return store.vendorID.profileImage.url

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



# Vendor Order Serializers (for vendor to view customer orders)

class VendorOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items from vendor's perspective."""
    product_details = ProductListSerializer(source='productID', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['orderItemID', 'product_details', 'productName', 'quantity', 'paidPrice']
        read_only_fields = ['orderItemID']


class VendorOrderSerializer(serializers.ModelSerializer):
    """Serializer for orders from vendor's perspective, includes customer info."""
    items = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    customer_username = serializers.CharField(source='customerID.user.username', read_only=True)
    customer_profileImage = serializers.CharField(source='customerID.profileImage', read_only=True)

    class Meta:
        model = Order
        fields = [
            'orderID', 'customer_name', 'customer_email', 'customer_username', 'customer_profileImage',
            'firstName', 'lastName', 'phoneNo', 'orderDate', 'shippingAddress1', 'shippingAddress2', 
            'shippingAddress3', 'totalAmount', 'status', 'statusUpdatedDate', 'cancellationReason',
            'refundRequest', 'refundReason', 'items'
        ]
        read_only_fields = ['orderID', 'orderDate', 'statusUpdatedDate']


    def get_customer_name(self, obj):
        return f"{obj.customerID.firstName} {obj.customerID.lastName}".strip()

    def get_customer_email(self, obj):
        return obj.customerID.user.email

    def get_items(self, obj):
        """Only return items that belong to the vendor's store."""
        store = self.context.get('store')
        if store:
            vendor_items = obj.items.filter(productID__storeID=store)
        else:
            vendor_items = obj.items.all()
        return VendorOrderItemSerializer(vendor_items, many=True).data


