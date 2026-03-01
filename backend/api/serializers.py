from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import (
    Customer, Vendor, Store, StorePhoto, Product, ProductMedia,
    Category, Brand, CartItem, Order, OrderItem,
    WishlistItem, Promotion, Review, ReviewMedia, Notification
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


class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        if data['new_password'] == data['current_password']:
            raise serializers.ValidationError({"new_password": "New password must be different from current password."})
        return data


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


class CustomerUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating customer profile fields."""
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    current_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Customer
        fields = ['firstName', 'lastName', 'phoneNo', 'profileImage',
                  'shippingAddress1', 'shippingAddress2', 'shippingAddress3',
                  'username', 'email', 'current_password']

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email already taken.")
        return value

    def validate(self, data):
        if 'email' in data:
            password = data.get('current_password')
            if not password:
                raise serializers.ValidationError(
                    {'current_password': 'Your current password is required to change your email.'}
                )
            if not self.context['request'].user.check_password(password):
                raise serializers.ValidationError(
                    {'current_password': 'Current password is incorrect.'}
                )
        return data

    def update(self, instance, validated_data):
        validated_data.pop('current_password', None)
        # Extract and apply User-level fields
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        if username is not None:
            instance.user.username = username
        if email is not None:
            instance.user.email = email
        if username is not None or email is not None:
            instance.user.save()

        # Apply remaining Customer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


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


class VendorUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating vendor profile fields."""
    username = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(required=False)
    current_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Vendor
        fields = ['firstName', 'lastName', 'phoneNo', 'profileImage',
                  'username', 'email', 'current_password']

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email already taken.")
        return value

    def validate(self, data):
        if 'email' in data:
            password = data.get('current_password')
            if not password:
                raise serializers.ValidationError(
                    {'current_password': 'Your current password is required to change your email.'}
                )
            if not self.context['request'].user.check_password(password):
                raise serializers.ValidationError(
                    {'current_password': 'Current password is incorrect.'}
                )
        return data

    def update(self, instance, validated_data):
        validated_data.pop('current_password', None)
        # Extract and apply User-level fields
        username = validated_data.pop('username', None)
        email = validated_data.pop('email', None)
        if username is not None:
            instance.user.username = username
        if email is not None:
            instance.user.email = email
        if username is not None or email is not None:
            instance.user.save()

        # Apply remaining Vendor fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance



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
    total_products = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    total_reviews = serializers.SerializerMethodField()

    class Meta:
        model = Store
        fields = ['storeID', 'vendor_username', 'vendor_profileImage', 'storeName', 'description', 'photos', 'total_products', 'average_rating', 'total_reviews', 'createdTime']
        read_only_fields = ['storeID', 'createdTime']

    def get_total_products(self, obj):
        return obj.products.filter(isHidden=False, availability=True).count()

    def get_average_rating(self, obj):
        from django.db.models import Avg
        result = Review.objects.filter(
            orderItemID__productID__storeID=obj
        ).aggregate(avg=Avg('rating'))
        avg = result['avg']
        if avg is not None:
            return round(float(avg) * 2) / 2  # round to nearest 0.5
        return None

    def get_total_reviews(self, obj):
        return Review.objects.filter(
            orderItemID__productID__storeID=obj
        ).count()



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



# Review Serializers

class ReviewMediaSerializer(serializers.ModelSerializer):

    class Meta:
        model = ReviewMedia
        fields = ['reviewMediaID', 'mediaURL', 'mediaType', 'sortedOrder']
        read_only_fields = ['reviewMediaID']


class ReviewSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(source='orderItemID.productName', read_only=True)
    media = ReviewMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['reviewID', 'product_name', 'comment', 'rating', 'createdDate', 'media']


class ProductReviewSerializer(serializers.ModelSerializer):
    """Serializer for displaying reviews on a product detail page (includes customer name)."""

    customer_name = serializers.SerializerMethodField()
    customer_username = serializers.SerializerMethodField()
    customer_avatar = serializers.SerializerMethodField()
    media = ReviewMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['reviewID', 'customer_name', 'customer_username', 'customer_avatar', 'comment', 'rating', 'createdDate', 'media']

    def get_customer_name(self, obj):
        customer = obj.orderItemID.orderID.customerID
        return f"{customer.firstName} {customer.lastName}"

    def get_customer_username(self, obj):
        return obj.orderItemID.orderID.customerID.user.username

    def get_customer_avatar(self, obj):
        customer = obj.orderItemID.orderID.customerID
        if customer.profileImage:
            return customer.profileImage.url
        return None



# Promotion Serializer

class PromotionSerializer(serializers.ModelSerializer):
    
    product_name = serializers.CharField(source='productID.productName', read_only=True)
    product_price = serializers.DecimalField(source='productID.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Promotion
        fields = [
            'promotionID', 'productID', 'product_name', 'product_price', 'product_image',
            'discountRate', 'startDate', 'endDate', 'status', 'is_currently_active', 'discounted_price'
        ]
        read_only_fields = ['promotionID']

    def get_product_image(self, obj):
        media = obj.productID.media.filter(isPrimary=True).first()
        return media.mediaURL.url if media else None

    def get_is_currently_active(self, obj):
        return obj.is_active()

    def get_discounted_price(self, obj):
        discount = obj.productID.price * obj.discountRate / 100
        return float(obj.productID.price - discount)



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


# Notification Serializer

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""
    product_name = serializers.CharField(source='productID.productName', read_only=True, default=None)
    product_image = serializers.SerializerMethodField()
    order_status = serializers.CharField(source='orderID.status', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = [
            'notificationID', 'notificationType', 'title', 'message', 'link',
            'isRead', 'createdTime', 'orderID', 'productID',
            'product_name', 'product_image', 'order_status'
        ]
        read_only_fields = ['notificationID', 'createdTime']

    def get_product_image(self, obj):
        if obj.productID:
            primary = obj.productID.media.filter(isPrimary=True).first()
            if not primary:
                primary = obj.productID.media.first()
            if primary:
                return primary.mediaURL.url
        return None


