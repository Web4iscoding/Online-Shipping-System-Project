from django.contrib import admin
from .models import (
    Customer, Vendor, Store, StorePhoto, Product, ProductMedia,
    Category, Brand, CartItem, Order, OrderItem, OrderStatus,
    CancelledItem, WishlistItem, Promotion, Review
)

# User Models Admin
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['customerID', 'user', 'firstName', 'lastName', 'phoneNo', 'createdTime']
    search_fields = ['user__username', 'firstName', 'lastName', 'phoneNo']
    list_filter = ['createdTime']
    readonly_fields = ['createdTime']


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ['vendorID', 'user', 'phoneNo', 'createdTime']
    search_fields = ['user__username', 'user__username']
    list_filter = ['createdTime']
    readonly_fields = ['createdTime']


# Store Models Admin
class StorePhotoInline(admin.TabularInline):
    model = StorePhoto
    extra = 1

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ['storeID', 'storeName', 'vendorID', 'createdTime']
    search_fields = ['storeName', 'vendorID__vendorUsername']
    list_filter = ['createdTime']
    readonly_fields = ['createdTime']
    inlines = [StorePhotoInline]

@admin.register(StorePhoto)
class StorePhotoAdmin(admin.ModelAdmin):
    list_display = ['storePhotoID', 'storeID', 'isPrimary', 'sortedOrder', 'uploadedTime']
    list_filter = ['isPrimary', 'uploadedTime']
    ordering = ['storeID', 'sortedOrder']


# Brand & Category Admin
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['brandID', 'brandName']
    search_fields = ['brandName']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['categoryID', 'categoryName']
    search_fields = ['categoryName']



# Product Models Admin
class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['productID', 'productName', 'brand', 'category', 'storeID', 'price', 'quantity', 'availability', 'isHidden']
    search_fields = ['productName', 'brand__brandName', 'category__categoryName']
    list_filter = ['availability', 'isHidden', 'brand', 'category', 'createdTime']
    readonly_fields = ['createdTime', 'updatedTime']
    inlines = [ProductMediaInline]
    fieldsets = (
        ('Basic Info', {'fields': ('productName', 'description', 'brand', 'category', 'storeID')}),
        ('Pricing & Stock', {'fields': ('price', 'quantity', 'availability', 'isHidden')}),
        ('Timestamps', {'fields': ('createdTime', 'updatedTime'), 'classes': ('collapse',)}),
    )

@admin.register(ProductMedia)
class ProductMediaAdmin(admin.ModelAdmin):
    list_display = ['productMediaID', 'productID', 'mediaType', 'isPrimary', 'sortedOrder']
    list_filter = ['mediaType', 'isPrimary']
    ordering = ['productID', 'sortedOrder']



# Cart & Order Models Admin
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['customerID', 'productID', 'quantity', 'addedTime']
    search_fields = ['customerID__user__username', 'productID__productName']
    list_filter = ['addedTime']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['paidPrice']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['orderID', 'customerID', 'orderDate', 'totalAmount']
    search_fields = ['customerID__user__username']
    list_filter = ['orderDate']
    readonly_fields = ['orderDate', 'totalAmount']
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['orderItemID', 'orderID', 'productName', 'quantity', 'paidPrice']
    search_fields = ['productName', 'orderID__orderID']
    list_filter = ['quantity']

class CancelledItemInline(admin.TabularInline):
    model = CancelledItem
    extra = 0

@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):
    list_display = ['orderStatusID', 'orderItemID', 'status', 'updatedDate']
    list_filter = ['status', 'updatedDate']
    search_fields = ['orderItemID__productName']
    readonly_fields = ['updatedDate']
    inlines = [CancelledItemInline]

@admin.register(CancelledItem)
class CancelledItemAdmin(admin.ModelAdmin):
    list_display = ['orderStatusID', 'reason', 'cancelledDate']
    list_filter = ['cancelledDate']
    readonly_fields = ['cancelledDate']


# Wishlist & Promotion Admin
@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ['wishlistItemID', 'customerID', 'productID', 'price_at_added', 'addedDate', 'isNotified']
    search_fields = ['customerID__user__username', 'productID__productName']
    list_filter = ['isNotified', 'addedDate']
    readonly_fields = ['addedDate']

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['promotionID', 'productID', 'discountRate', 'status', 'startDate', 'endDate']
    list_filter = ['status', 'startDate', 'endDate']
    search_fields = ['productID__productName']
    readonly_fields = ['createdTime', 'updatedTime']
    fieldsets = (
        ('Product & Discount', {'fields': ('productID', 'discountRate')}),
        ('Schedule', {'fields': ('startDate', 'endDate', 'status')}),
        ('Timestamps', {'fields': ('createdTime', 'updatedTime'), 'classes': ('collapse',)}),
    )


# Review Admin
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewID', 'orderItemID', 'rating', 'createdDate']
    list_filter = ['rating', 'createdDate']
    search_fields = ['orderItemID__productName', 'comment']
    readonly_fields = ['createdDate']
    fieldsets = (
        ('Order Info', {'fields': ('orderItemID',)}),
        ('Review Content', {'fields': ('comment', 'rating')}),
        ('Dates', {'fields': ('createdDate',)}),
    )
