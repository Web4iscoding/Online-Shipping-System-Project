from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CustomerRegisterView, VendorRegisterView, LoginView, LogoutView, MeView,
    ProductViewSet, BrandViewSet, CategoryViewSet, StoreViewSet,
    CartViewSet, OrderViewSet, WishlistViewSet, ReviewViewSet,
    VendorStoreViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'brands', BrandViewSet, basename='brand')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'stores', StoreViewSet, basename='store')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'vendor', VendorStoreViewSet, basename='vendor')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/customer/', CustomerRegisterView.as_view(), name='register-customer'),
    path('auth/register/vendor/', VendorRegisterView.as_view(), name='register-vendor'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    
    # Include router URLs
    path('', include(router.urls)),
]

