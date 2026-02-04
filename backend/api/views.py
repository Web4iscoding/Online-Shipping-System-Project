from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.authtoken.models import Token
from decimal import Decimal

from .models import (
    Customer, Vendor, Store, Product, ProductMedia, Category, Brand,
    CartItem, Order, OrderItem, OrderStatus, WishlistItem, Promotion, Review
)
from .serializers import (
    CustomerSerializer, VendorSerializer, CustomerRegisterSerializer,
    VendorRegisterSerializer, LoginSerializer,
    ProductListSerializer, ProductDetailSerializer, StoreSerializer,
    ProductCreateUpdateSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer,
    WishlistItemSerializer, ReviewSerializer, PromotionSerializer,
    BrandSerializer, CategorySerializer
)



# Authentication Views

class CustomerRegisterView(APIView):
    """Register a new customer account."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            token = Token.objects.get(user=customer.user)
            return Response({
                'message': 'Customer registered successfully',
                'token': token.key,
                'user': CustomerSerializer(customer).data,
                'user_type': 'customer'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorRegisterView(APIView):
    """Register a new vendor account."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VendorRegisterSerializer(data=request.data)
        if serializer.is_valid():
            vendor = serializer.save()
            token = Token.objects.get(user=vendor.user)
            return Response({
                'message': 'Vendor registered successfully',
                'token': token.key,
                'user': VendorSerializer(vendor).data,
                'user_type': 'vendor'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Login with username and password."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            
            # Determine user type
            user_type = 'unknown'
            user_data = {}
            if hasattr(user, 'customer_profile'):
                user_type = 'customer'
                user_data = CustomerSerializer(user.customer_profile).data
            elif hasattr(user, 'vendor_profile'):
                user_type = 'vendor'
                user_data = VendorSerializer(user.vendor_profile).data
            
            return Response({
                'message': 'Login successful',
                'token': token.key,
                'user': user_data,
                'user_type': user_type
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout by deleting token."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """Get current logged-in user's profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_type = 'unknown'
        user_data = {}
        
        if hasattr(user, 'customer_profile'):
            user_type = 'customer'
            user_data = CustomerSerializer(user.customer_profile).data
        elif hasattr(user, 'vendor_profile'):
            user_type = 'vendor'
            user_data = VendorSerializer(user.vendor_profile).data
        
        user_data['user_type'] = user_type
        
        return Response(user_data)


# Product Views

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving products.
    Supports filtering by brand, category, store, and search by name.
    """
    queryset = Product.objects.filter(isHidden=False, availability=True).select_related(
        'brand', 'category', 'storeID'
    ).prefetch_related('media', 'promotions')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['productName', 'description', 'brand__brandName']
    ordering_fields = ['price', 'createdTime']
    ordering = ['-createdTime']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=False, methods=['GET'])
    def by_brand(self, request):
        """Get products filtered by brand."""
        brand_id = request.query_params.get('brand_id')
        if not brand_id:
            return Response({'error': 'brand_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        products = self.get_queryset().filter(brand_id=brand_id)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def by_category(self, request):
        """Get products filtered by category."""
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response({'error': 'category_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        products = self.get_queryset().filter(category_id=category_id)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def by_store(self, request):
        """Get products from a specific store."""
        store_id = request.query_params.get('store_id')
        if not store_id:
            return Response({'error': 'store_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        products = self.get_queryset().filter(storeID_id=store_id)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def on_sale(self, request):
        """Get products with active promotions."""
        products = self.get_queryset().filter(promotions__status='Active')
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving brands."""
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    ordering = ['brandName']


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    ordering = ['categoryName']


class StoreViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving stores."""
    queryset = Store.objects.all().prefetch_related('photos')
    serializer_class = StoreSerializer
    ordering = ['storeName']



# Cart Views

class CartViewSet(viewsets.ViewSet):
    """ViewSet for managing shopping cart."""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all items in a customer's cart."""
        customer = get_object_or_404(Customer, user=request.user)
        cart_items = CartItem.objects.filter(customerID=customer).select_related('productID')
        serializer = CartItemSerializer(cart_items, many=True)
        
        total = sum(float(item['subtotal']) for item in serializer.data)
        return Response({
            'items': serializer.data,
            'total': total,
            'item_count': len(serializer.data)
        })

    def create(self, request):
        """Add item to cart or update quantity."""
        customer = get_object_or_404(Customer, user=request.user)
        product_id = request.data.get('productID')
        quantity = request.data.get('quantity', 1)
        
        if not product_id:
            return Response({'error': 'productID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Product, productID=product_id)
        
        cart_item, created = CartItem.objects.update_or_create(
            customerID=customer,
            productID=product,
            defaults={'quantity': int(quantity)}
        )
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['DELETE'])
    def remove_item(self, request):
        """Remove item from cart."""
        customer = get_object_or_404(Customer, user=request.user)
        product_id = request.query_params.get('productID')
        
        if not product_id:
            return Response({'error': 'productID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        CartItem.objects.filter(customerID=customer, productID_id=product_id).delete()
        return Response({'message': 'Item removed from cart'})

    @action(detail=False, methods=['DELETE'])
    def clear_cart(self, request):
        """Clear all items from cart."""
        customer = get_object_or_404(Customer, user=request.user)
        CartItem.objects.filter(customerID=customer).delete()
        return Response({'message': 'Cart cleared'})



# Order Views

class OrderViewSet(viewsets.ViewSet):
    """ViewSet for managing orders."""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all orders for the authenticated customer."""
        customer = get_object_or_404(Customer, user=request.user)
        orders = Order.objects.filter(customerID=customer).prefetch_related('items')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get a specific order."""
        customer = get_object_or_404(Customer, user=request.user)
        order = get_object_or_404(Order, orderID=pk, customerID=customer)
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    def create(self, request):
        """Create a new order from cart items."""
        customer = get_object_or_404(Customer, user=request.user)
        cart_items = CartItem.objects.filter(customerID=customer)
        
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        shipping_address = request.data.get('shippingAddress') or customer.shippingAddress
        if not shipping_address:
            return Response({'error': 'Shipping address required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create order
        order = Order.objects.create(
            customerID=customer,
            shippingAddress=shipping_address
        )
        
        total_amount = 0
        
        # Create order items from cart
        for cart_item in cart_items:
            # Get effective price (discounted if promotion active)
            promo = cart_item.productID.promotions.filter(status='Active').first()
            if promo and promo.is_active():
                paid_price = float(cart_item.productID.price * (1 - promo.discountRate / 100))
            else:
                paid_price = float(cart_item.productID.price)
            
            order_item = OrderItem.objects.create(
                orderID=order,
                productID=cart_item.productID,
                productName=cart_item.productID.productName,
                quantity=cart_item.quantity,
                paidPrice=paid_price
            )
            
            # Create order status
            OrderStatus.objects.create(orderItemID=order_item, status='Pending')
            
            # Update product quantity
            cart_item.productID.quantity -= cart_item.quantity
            cart_item.productID.save()
            
            total_amount += paid_price * cart_item.quantity
        
        # Update order total
        order.totalAmount = total_amount
        order.save()
        
        # Clear cart
        cart_items.delete()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'])
    def cancel_order(self, request, pk=None):
        """Cancel an order."""
        customer = get_object_or_404(Customer, user=request.user)
        order = get_object_or_404(Order, orderID=pk, customerID=customer)
        
        reason = request.data.get('reason', 'No reason provided')
        
        # Cancel all items in order
        for order_item in order.items.all():
            order_status = order_item.status
            if order_status.status != 'Cancelled':
                order_status.status = 'Cancelled'
                order_status.save()
                
                from .models import CancelledItem
                CancelledItem.objects.create(
                    orderStatusID=order_status,
                    reason=reason
                )
        
        return Response({'message': 'Order cancelled'})



# Wishlist Views

class WishlistViewSet(viewsets.ViewSet):
    """ViewSet for managing wishlist."""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all items in customer's wishlist."""
        customer = get_object_or_404(Customer, user=request.user)
        wishlist_items = WishlistItem.objects.filter(customerID=customer).select_related('productID')
        serializer = WishlistItemSerializer(wishlist_items, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Add item to wishlist."""
        customer = get_object_or_404(Customer, user=request.user)
        product_id = request.data.get('productID')
        
        if not product_id:
            return Response({'error': 'productID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Product, productID=product_id)
        
        # Get current discount if any
        promo = product.promotions.filter(status='Active').first()
        discount_rate = promo.discountRate if (promo and promo.is_active()) else 0
        effective_price = product.price * Decimal(1 - discount_rate / 100)
        
        wishlist_item, created = WishlistItem.objects.update_or_create(
            customerID=customer,
            productID=product,
            defaults={
                'original_price_at_added': product.price,
                'discount_rate_at_added': discount_rate,
                'price_at_added': effective_price
            }
        )
        
        serializer = WishlistItemSerializer(wishlist_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['DELETE'])
    def remove_item(self, request):
        """Remove item from wishlist."""
        customer = get_object_or_404(Customer, user=request.user)
        product_id = request.query_params.get('productID')
        
        if not product_id:
            return Response({'error': 'productID required'}, status=status.HTTP_400_BAD_REQUEST)
        
        WishlistItem.objects.filter(customerID=customer, productID_id=product_id).delete()
        return Response({'message': 'Item removed from wishlist'})



# Review Views

class ReviewViewSet(viewsets.ViewSet):
    """ViewSet for managing reviews."""
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """Get all reviews for the authenticated customer's orders."""
        customer = get_object_or_404(Customer, user=request.user)
        reviews = Review.objects.filter(orderItemID__orderID__customerID=customer)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create a review for an ordered item."""
        customer = get_object_or_404(Customer, user=request.user)
        order_item_id = request.data.get('orderItemID')
        comment = request.data.get('comment', '')
        date = request.data.get('date')
        rating = request.data.get('rating', 5)
        
        if not order_item_id:
            return Response({'error': 'orderItemID required'}, status=status.HTTP_400_BAD_REQUEST)
        if not date:
            return Response({'error': 'date required'}, status=status.HTTP_400_BAD_REQUEST)
        
        order_item = get_object_or_404(
            OrderItem,
            orderItemID=order_item_id,
            orderID__customerID=customer
        )
        
        if hasattr(order_item, 'review'):
            return Response({'error': 'Review already exists for this item'}, status=status.HTTP_400_BAD_REQUEST)
        
        review_obj = Review.objects.create(
            orderItemID=order_item,
            comment=comment,
            date=date,
            rating=rating
        )
        
        serializer = ReviewSerializer(review_obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



# Vendor Views

class VendorStoreViewSet(viewsets.ViewSet):
    """ViewSet for vendor to manage their store and products."""
    permission_classes = [IsAuthenticated]

    def get_vendor(self, request):
        """Get vendor profile for authenticated user."""
        return get_object_or_404(Vendor, user=request.user)

    @action(detail=False, methods=['GET'])
    def my_store(self, request):
        """Get the store for the authenticated vendor (OneToOne relationship)."""
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        serializer = StoreSerializer(store)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def my_products(self, request):
        """Get all products for the authenticated vendor's store."""
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        products = store.products.select_related(
            'brand', 'category', 'storeID'
        ).prefetch_related('media', 'promotions')
        

        search_query = request.query_params.get('search', '').strip()
        if search_query:
            products = products.filter(
                Q(productName__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(brand__brandName__icontains=search_query) |
                Q(category__categoryName__icontains=search_query)
            )
        serializer = ProductDetailSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def create_product(self, request):
        """Create a new product in vendor's store."""
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            # Add the store to the product data
            product = serializer.save(storeID=store)
            return Response(
                ProductDetailSerializer(product).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['PUT'])
    def update_product(self, request):
        """
        Partial update of an existing product.
        Although this uses PUT, it behaves like PATCH. (See partial=True)
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        product_id = request.data.get('productID')
        if not product_id:
            return Response(
                {'error': 'productID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure product belongs to vendor's store
        product = get_object_or_404(Product, productID=product_id, storeID=store)
        
        serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductDetailSerializer(product).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['DELETE'])
    def delete_product(self, request):
        """Delete a product from vendor's store."""
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        product_id = request.query_params.get('productID')
        if not product_id:
            return Response(
                {'error': 'productID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure product belongs to vendor's store
        product = get_object_or_404(Product, productID=product_id, storeID=store)
        product_name = product.productName
        product.delete()
        
        return Response(
            {'message': f'Product "{product_name}" deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['GET'])
    def sales_summary(self, request):
        """Get sales summary for vendor."""
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        # Query through the store directly (OneToOne relationship)
        orders = Order.objects.filter(
            items__productID__storeID=store
        ).distinct()
        
        total_sales = sum(order.totalAmount for order in orders)
        total_orders = orders.count()
        
        return Response({
            'total_orders': total_orders,
            'total_sales': float(total_sales),
            'total_products': store.products.count()
        })
