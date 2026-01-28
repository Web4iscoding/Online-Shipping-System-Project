from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# Represents a customer in the system.
# Links to Django User for authentication.
class Customer(models.Model):
    customerID = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    firstName = models.CharField(max_length=50, blank=False)
    lastName = models.CharField(max_length=50, blank=False)
    phoneNo = models.CharField(max_length=20, blank=False)
    shippingAddress1 = models.TextField(blank=False)
    shippingAddress2 = models.TextField(blank=False)
    shippingAddress3 = models.TextField(blank=False)
    createdTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Customers"

    def __str__(self):
        return f"Customer: {self.user.username} ({self.firstName} {self.lastName})"


# Represents a vendor in the system.
# Links to Django User for authentication.
class Vendor(models.Model):
    vendorID = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    phoneNo = models.CharField(max_length=20, blank=False)
    profileImage = models.ImageField(upload_to='vendor_profiles/', blank=True, null=True)
    createdTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Vendors"

    def __str__(self):
        return f"Vendor: {self.user.username}"


# Represents a vendor's store.
class Store(models.Model):
    storeID = models.AutoField(primary_key=True)
    vendorID = models.OneToOneField(Vendor, on_delete=models.CASCADE, related_name='stores')
    storeName = models.CharField(max_length=100, blank=False)
    description = models.TextField(blank=True)
    createdTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('vendorID', 'storeName')

    def __str__(self):
        return f"Store: {self.storeName} (Vendor: {self.vendorID.user.username})"


# Represents photos for a store.
class StorePhoto(models.Model):
    storePhotoID = models.AutoField(primary_key=True)
    storeID = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='photos')
    photoURL = models.ImageField(upload_to='store_photos/')
    sortedOrder = models.IntegerField(default=0)
    isPrimary = models.BooleanField(default=False)
    uploadedTime = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sortedOrder']

    def __str__(self):
        return f"StorePhoto: {self.storeID.storeName} (Order: {self.sortedOrder})"


# Category for grouping fashion items (accessories, bags, shoes, etc.)
class Category(models.Model):
    categoryID = models.AutoField(primary_key=True)
    categoryName = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.categoryName


# Brand for grouping fashion items (Vivienne Westwood, Gucci, Balenciaga, etc.)
class Brand(models.Model):
    brandID = models.AutoField(primary_key=True)
    brandName = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    logoURL = models.ImageField(upload_to='brand_logos/', blank=True, null=True)

    def __str__(self):
        return self.brandName


# Represents a fashion item for sale.
class Product(models.Model):
    productID = models.AutoField(primary_key=True)
    storeID = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='products')
    productName = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    availability = models.BooleanField(default=True)
    createdTime = models.DateTimeField(auto_now_add=True)
    updatedTime = models.DateTimeField(auto_now=True)
    isHidden = models.BooleanField(default=False)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')

    class Meta:
        ordering = ['-createdTime']

    def __str__(self):
        return f"Product: {self.productName} (Brand: {self.brand}, Price: ${self.price})"

    def is_in_stock(self):
        return self.availability and self.quantity > 0


# Represents images/media for a product.
class ProductMedia(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    productMediaID = models.AutoField(primary_key=True)
    productID = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='media')
    mediaURL = models.ImageField(upload_to='product_media/')
    mediaType = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    mediaContent = models.TextField(blank=True)
    isPrimary = models.BooleanField(default=False)
    sortedOrder = models.IntegerField(default=0)

    class Meta:
        ordering = ['sortedOrder']

    def __str__(self):
        return f"ProductMedia: {self.productID.productName} ({self.mediaType})"

# Represents a product in a customer's shopping cart.
class CartItem(models.Model):
    customerID = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='cart_items')
    productID = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    addedTime = models.DateTimeField(auto_now_add=True)
    updatedTime = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('customerID', 'productID')

    def __str__(self):
        return f"CartItem: {self.customerID.user.username} - {self.productID.productName} (Qty: {self.quantity})"


# Represents a customer's order.
class Order(models.Model):
    orderID = models.AutoField(primary_key=True)
    customerID = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    orderDate = models.DateTimeField(auto_now_add=True)
    shippingAddress = models.TextField()
    totalAmount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        ordering = ['-orderDate']

    def __str__(self):
        return f"Order {self.orderID}: Customer {self.customerID.user.username} - ${self.totalAmount}"


# Represents a single product line item in an order.
class OrderItem(models.Model):
    orderItemID = models.AutoField(primary_key=True)
    orderID = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    productID = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    productName = models.CharField(max_length=200)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    paidPrice = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"OrderItem {self.orderItemID}: {self.productName} (Qty: {self.quantity})"


# Tracks the status of an order item through its lifecycle.
class OrderStatus(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Holding', 'Holding'),
        ('Shipped', 'Shipped'),
        ('Cancelled', 'Cancelled'),
    ]

    orderStatusID = models.AutoField(primary_key=True)
    orderItemID = models.OneToOneField(OrderItem, on_delete=models.CASCADE, related_name='status')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    updatedDate = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "OrderStatuses"

    def __str__(self):
        return f"OrderStatus: {self.orderItemID.productName} - {self.status}"


# Records reason for cancelled order items.
class CancelledItem(models.Model):
    orderStatusID = models.OneToOneField(OrderStatus, on_delete=models.CASCADE, related_name='cancellation')
    reason = models.TextField()
    cancelledDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "CancelledItems"

    def __str__(self):
        return f"Cancelled: {self.orderStatusID.orderItemID.productName} - {self.reason}"


# Represents a product in a customer's wishlist.
# Tracks original price and discount rate at the time of adding.
class WishlistItem(models.Model):
    wishlistItemID = models.AutoField(primary_key=True)
    customerID = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='wishlist_items')
    productID = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist_items')
    addedDate = models.DateTimeField(auto_now_add=True)
    isNotified = models.BooleanField(default=False)
    original_price_at_added = models.DecimalField(max_digits=10, decimal_places=2)
    discount_rate_at_added = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    price_at_added = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('customerID', 'productID')

    def __str__(self):
        return f"WishlistItem: {self.customerID.user.username} - {self.productID.productName}"


# Represents a promotional discount for a product.
class Promotion(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    promotionID = models.AutoField(primary_key=True)
    productID = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='promotions')
    discountRate = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    startDate = models.DateTimeField()
    endDate = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Inactive')
    createdTime = models.DateTimeField(auto_now_add=True)
    updatedTime = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-createdTime']

    def __str__(self):
        return f"Promotion: {self.productID.productName} - {self.discountRate}% off"

    def is_active(self):
        now = timezone.now()
        return self.status == 'Active' and self.startDate <= now <= self.endDate


# Represents a customer review for an ordered item.
class Review(models.Model):
    RATING_CHOICES = [
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    ]

    reviewID = models.AutoField(primary_key=True)
    orderItemID = models.OneToOneField(OrderItem, on_delete=models.CASCADE, related_name='review')
    comment = models.TextField()
    rating = models.IntegerField(choices=RATING_CHOICES, default=5)
    createdDate = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-createdDate']

    def __str__(self):
        return f"Review: {self.orderItemID.productName} - {self.rating} stars"
