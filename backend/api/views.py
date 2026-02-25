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
    CartItem, Order, OrderItem, WishlistItem, Promotion, Review
)
from .serializers import (
    CustomerSerializer, VendorSerializer, CustomerRegisterSerializer,
    VendorRegisterSerializer, LoginSerializer,
    ProductListSerializer, ProductDetailSerializer, StoreSerializer,
    ProductCreateUpdateSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer,
    WishlistItemSerializer, ReviewSerializer, PromotionSerializer,
    BrandSerializer, CategorySerializer, VendorOrderSerializer, VendorOrderItemSerializer,
    ProductMediaSerializer
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
    
    @action(detail=False, methods=['PUT'])
    def update_quantity(self, request):
        """Update quantity of an item in the cart."""
        customer = get_object_or_404(Customer, user=request.user)
        product_id = request.data.get('productID')
        quantity = request.data.get('quantity')
        
        if not product_id or quantity is None:
            return Response({'error': 'productID and quantity required'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item = get_object_or_404(CartItem, customerID=customer, productID_id=product_id)
        cart_item.quantity = int(quantity)
        cart_item.save()
        
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)

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
        """Create new orders from cart items, grouped by vendor."""
        customer = get_object_or_404(Customer, user=request.user)
        cart_items = CartItem.objects.filter(customerID=customer).select_related('productID__storeID__vendorID')
        
        if not cart_items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        firstName = request.data.get('firstName') or customer.firstName
        lastName = request.data.get('lastName') or customer.lastName
        phoneNo = request.data.get('phoneNo') or customer.phoneNo
        shipping_address1 = request.data.get('shippingAddress1') or customer.shippingAddress1
        shipping_address2 = request.data.get('shippingAddress2') or customer.shippingAddress2
        shipping_address3 = request.data.get('shippingAddress3') or customer.shippingAddress3
        if not (shipping_address1 and shipping_address2 and shipping_address3):
            return Response({'error': 'Shipping address required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Group cart items by vendor
        from collections import defaultdict
        vendor_cart_items = defaultdict(list)
        for cart_item in cart_items:
            vendor_id = cart_item.productID.storeID.vendorID.vendorID
            vendor_cart_items[vendor_id].append(cart_item)
        
        # Create separate order for each vendor
        created_orders = []
        for vendor_id, vendor_items in vendor_cart_items.items():
            # Create order
            order = Order.objects.create(
                customerID=customer,
                firstName=firstName,
                lastName=lastName,
                phoneNo=phoneNo,
                shippingAddress1=shipping_address1,
                shippingAddress2=shipping_address2,
                shippingAddress3=shipping_address3,
            )
            
            total_amount = 0
            
            # Create order items from this vendor's cart items
            for cart_item in vendor_items:
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
                
                # Update product quantity
                cart_item.productID.quantity -= cart_item.quantity
                cart_item.productID.save()
                
                total_amount += paid_price * cart_item.quantity
            
            # Update order total
            order.totalAmount = total_amount
            order.save()
            
            created_orders.append(order)
        
        # Clear cart
        cart_items.delete()
        
        # Return all created orders
        serializer = OrderSerializer(created_orders, many=True)
        return Response({
            'message': f'{len(created_orders)} order(s) created successfully',
            'orders': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'])
    def cancel_order(self, request, pk=None):
        """Cancel an order."""
        customer = get_object_or_404(Customer, user=request.user)
        order = get_object_or_404(Order, orderID=pk, customerID=customer)
        
        reason = request.data.get('reason', 'No reason provided')
        
        # Update order status to cancelled
        order.status = 'Cancelled'
        order.cancellationReason = reason
        order.save()
        
        return Response({'message': 'Order cancelled'})

    @action(detail=True, methods=['POST'])
    def request_refund(self, request, pk=None):
        """Request a refund for a shipped order."""
        customer = get_object_or_404(Customer, user=request.user)
        order = get_object_or_404(Order, orderID=pk, customerID=customer)

        if order.status not in ('Pending', 'Holding'):
            return Response(
                {'error': 'Refund can only be requested for pending or held orders'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if order.refundRequest:
            return Response(
                {'error': 'Refund has already been requested for this order'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', '')
        if not reason:
            return Response(
                {'error': 'reason is required when requesting a refund'},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.refundRequest = True
        order.refundReason = reason
        order.save()

        return Response({'message': 'Refund requested successfully'})



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
        products = store.products.filter(availability=True).select_related(
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

    @action(detail=False, methods=['GET'])
    def get_product(self, request):
        """
        Get a specific product from vendor's store (including hidden products).
        Required query param: ?product_id=<productID>
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get product from vendor's store (no filter on isHidden, but must have availability=True)
        product = get_object_or_404(Product, productID=product_id, storeID=store, availability=True)
        serializer = ProductDetailSerializer(product)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def create_product(self, request):
        """Create a new product in vendor's store with optional images."""
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        serializer = ProductCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save(storeID=store)
            
            # Handle image uploads from request.FILES
            images = request.FILES.getlist('images')
            for idx, image in enumerate(images):
                ProductMedia.objects.create(
                    productID=product,
                    mediaURL=image,
                    mediaType='image',
                    isPrimary=(idx == 0),
                    sortedOrder=idx
                )
            
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

    @action(detail=False, methods=['POST'])
    def upload_product_image(self, request):
        """
        Upload an image for a product.
        Required body params:
            - product_id: ID of the product
            - image: Image file
        Optional params:
            - isPrimary: Boolean (default: False)
            - sortedOrder: Integer (default: 0)
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        product_id = request.data.get('product_id')
        image_file = request.FILES.get('image')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not image_file:
            return Response(
                {'error': 'image file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure product belongs to vendor's store
        product = get_object_or_404(Product, productID=product_id, storeID=store)
        
        # Get optional parameters
        is_primary = request.data.get('isPrimary', 'false').lower() == 'true'
        sorted_order = int(request.data.get('sortedOrder', 0))
        
        # If this is set as primary, unset other primary images
        if is_primary:
            ProductMedia.objects.filter(productID=product, isPrimary=True).update(isPrimary=False)
        
        # Create product media
        product_media = ProductMedia.objects.create(
            productID=product,
            mediaURL=image_file,
            mediaType='image',
            isPrimary=is_primary,
            sortedOrder=sorted_order
        )
        
        serializer = ProductMediaSerializer(product_media)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['DELETE'])
    def delete_product_image(self, request):
        """
        Delete a product image.
        Required query param: ?media_id=<productMediaID>
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        media_id = request.query_params.get('media_id')
        if not media_id:
            return Response(
                {'error': 'media_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get media and ensure it belongs to vendor's product
        product_media = get_object_or_404(
            ProductMedia,
            productMediaID=media_id,
            productID__storeID=store
        )
        
        product_media.delete()
        return Response(
            {'message': 'Product image deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['PUT'])
    def update_product_image(self, request):
        """
        Update product media attributes and/or replace the image.
        Required body params:
            - media_id: ID of the product media
        Optional params:
            - isPrimary: Boolean
            - sortedOrder: Integer
            - image: Image file (to replace existing image)
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        media_id = request.data.get('media_id')
        if not media_id:
            return Response(
                {'error': 'media_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get media and ensure it belongs to vendor's product
        product_media = get_object_or_404(
            ProductMedia,
            productMediaID=media_id,
            productID__storeID=store
        )
        
        # Update fields if provided
        is_primary = request.data.get('isPrimary')
        sorted_order = request.data.get('sortedOrder')
        image_file = request.FILES.get('image')
        
        if is_primary is not None:
            is_primary_bool = str(is_primary).lower() == 'true'
            # If setting as primary, unset other primary images for this product
            if is_primary_bool:
                ProductMedia.objects.filter(
                    productID=product_media.productID,
                    isPrimary=True
                ).update(isPrimary=False)
            product_media.isPrimary = is_primary_bool
        
        if sorted_order is not None:
            product_media.sortedOrder = int(sorted_order)
        
        if image_file:
            # Replace the existing image
            product_media.mediaURL = image_file
        
        product_media.save()
        
        serializer = ProductMediaSerializer(product_media)
        return Response(serializer.data)

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

    @action(detail=False, methods=['GET'])
    def customer_orders(self, request):
        """
        Get all orders that contain products from the vendor's store.
        Supports filtering by status query param: ?status=Pending
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        # Get orders containing items from this vendor's store
        orders = Order.objects.filter(
            items__productID__storeID=store
        ).distinct().prefetch_related('items', 'items__productID')
        
        # Optional status filter
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter)

        # Optional refund request filter
        refund_filter = request.query_params.get('refund_request')
        if refund_filter is not None:
            orders = orders.filter(refundRequest=refund_filter.lower() == 'true')

        serializer = VendorOrderSerializer(orders, many=True, context={'store': store})
        return Response(serializer.data)

    @action(detail=False, methods=['GET'])
    def customer_order_detail(self, request):
        """
        Get details of a specific order.
        Required query param: ?order_id=<orderID>
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response(
                {'error': 'order_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure the order contains items from vendor's store
        order = get_object_or_404(
            Order.objects.filter(items__productID__storeID=store).distinct(),
            orderID=order_id
        )
        
        serializer = VendorOrderSerializer(order, context={'store': store})
        return Response(serializer.data)

    @action(detail=False, methods=['PUT'])
    def update_order_status(self, request):
        """
        Update the status of an order.
        Required body params:
            - order_id: ID of the order
            - status: New status (Pending, Holding, Shipped, Cancelled)
            - reason: (Optional) Required if status is 'Cancelled'
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)
        
        order_id = request.data.get('order_id')
        new_status = request.data.get('status')
        reason = request.data.get('reason', '')
        
        if not order_id:
            return Response(
                {'error': 'order_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not new_status:
            return Response(
                {'error': 'status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        valid_statuses = ['Pending', 'Holding', 'Shipped', 'Cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get order and ensure it contains items from vendor's store
        order = get_object_or_404(
            Order.objects.filter(items__productID__storeID=store).distinct(),
            orderID=order_id
        )
        
        # Update order status
        order.status = new_status
        
        # If cancelled, save the reason
        if new_status == 'Cancelled':
            if not reason:
                return Response(
                    {'error': 'reason is required when cancelling an order'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            order.cancellationReason = reason
        
        order.save()
        
        return Response({
            'message': f'Order status updated to {new_status}',
            'order_id': order_id,
            'status': new_status
        })

    @action(detail=False, methods=['PUT'])
    def dismiss_refund_request(self, request):
        """
        Dismiss a customer's refund request by setting refundRequest to False.
        Required body param:
            - order_id: ID of the order
        """
        vendor = self.get_vendor(request)
        store = get_object_or_404(Store, vendorID=vendor)

        order_id = request.data.get('order_id')
        if not order_id:
            return Response(
                {'error': 'order_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure the order contains items from vendor's store
        order = get_object_or_404(
            Order.objects.filter(items__productID__storeID=store).distinct(),
            orderID=order_id
        )

        order.refundRequest = False
        order.refundReason = None
        order.save()

        return Response({
            'message': 'Refund request dismissed',
            'order_id': order_id,
        })
