from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

from api.models import (
    Customer, Vendor, Store, StorePhoto, Product, ProductMedia,
    Brand, Category, Promotion
)


class Command(BaseCommand):
    help = 'Seed the database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data seeding...'))
        
        # ====== Create Brands ======
        brands_data = [
            {'name': 'Vivienne Westwood', 'desc': 'British luxury fashion brand'},
            {'name': 'Gucci', 'desc': 'Italian luxury brand'},
            {'name': 'Balenciaga', 'desc': 'Spanish luxury fashion house'},
            {'name': 'Prada', 'desc': 'Italian luxury fashion brand'},
            {'name': 'Coach', 'desc': 'American luxury brand'},
        ]
        
        brands = {}
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                brandName=brand_data['name'],
                defaults={'description': brand_data['desc']}
            )
            brands[brand_data['name']] = brand
            status = 'Created' if created else 'Exists'
            self.stdout.write(f"Brand {brand_data['name']}: {status}")
        
        # ====== Create Categories ======
        categories_data = [
            'Accessories',
            'Bags',
            'Shoes',
            'Clothing',
            'Watches',
            'Jewelry'
        ]
        
        categories = {}
        for cat_name in categories_data:
            category, created = Category.objects.get_or_create(
                categoryName=cat_name,
                defaults={'description': f'{cat_name} collection'}
            )
            categories[cat_name] = category
            status = 'Created' if created else 'Exists'
            self.stdout.write(f"Category {cat_name}: {status}")
        
        # ====== Create Vendors & Stores ======
        vendors = []
        stores = []
        
        for i in range(2):
            username = f'vendor{i+1}'
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'is_staff': False
                }
            )
            user.set_password('password123')
            user.save()
            
            vendor, created = Vendor.objects.get_or_create(
                user=user,
                defaults={
                    'vendorUsername': f'{username}_shop',
                    'phoneNo': f'555-000{i+1}',
                    'profileImage': f'https://via.placeholder.com/200?text={username}'
                }
            )
            vendors.append(vendor)
            self.stdout.write(f"Vendor {username}: Created" if created else "Exists")
            
            # Create store
            store, created = Store.objects.get_or_create(
                vendorID=vendor,
                storeName=f'{username.capitalize()} Fashion Store',
                defaults={
                    'description': f'Premium fashion collection by {username}',
                }
            )
            stores.append(store)
            self.stdout.write(f"Store '{store.storeName}': Created" if created else "Exists")
            
            # Add store photo
            StorePhoto.objects.get_or_create(
                storeID=store,
                defaults={
                    'photoURL': f'https://via.placeholder.com/500?text={store.storeName}',
                    'sortedOrder': 1,
                    'isPrimary': True
                }
            )
        
        # ====== Create Customers ======
        for i in range(3):
            username = f'customer{i+1}'
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                    'first_name': f'Customer{i+1}',
                }
            )
            user.set_password('password123')
            user.save()
            
            Customer.objects.get_or_create(
                user=user,
                defaults={
                    'firstName': f'John',
                    'lastName': f'Doe{i+1}',
                    'phoneNo': f'555-100{i}',
                    'shippingAddress': f'{100+i} Fashion Ave, NYC, NY 10001'
                }
            )
        
        self.stdout.write(self.style.SUCCESS(f'Created {3} customers'))
        
        # ====== Create Products ======
        product_data = [
            {
                'name': 'Classic Black Leather Belt',
                'desc': 'Elegant leather belt with signature buckle',
                'price': 129.99,
                'brand': 'Vivienne Westwood',
                'category': 'Accessories',
                'qty': 50
            },
            {
                'name': 'Designer Tote Bag',
                'desc': 'Spacious tote bag perfect for daily use',
                'price': 599.99,
                'brand': 'Gucci',
                'category': 'Bags',
                'qty': 25
            },
            {
                'name': 'Premium Leather Sneakers',
                'desc': 'Comfortable and stylish sneakers',
                'price': 449.99,
                'brand': 'Balenciaga',
                'category': 'Shoes',
                'qty': 40
            },
            {
                'name': 'Signature Sunglasses',
                'desc': 'UV protection with designer frame',
                'price': 199.99,
                'brand': 'Prada',
                'category': 'Accessories',
                'qty': 100
            },
            {
                'name': 'Wool Blend Jacket',
                'desc': 'Premium wool jacket for any season',
                'price': 799.99,
                'brand': 'Vivienne Westwood',
                'category': 'Clothing',
                'qty': 30
            },
            {
                'name': 'Crossbody Shoulder Bag',
                'desc': 'Compact bag for everyday essentials',
                'price': 299.99,
                'brand': 'Coach',
                'category': 'Bags',
                'qty': 45
            },
            {
                'name': 'Luxury Watch',
                'desc': 'Elegant timepiece with precision movement',
                'price': 1299.99,
                'brand': 'Gucci',
                'category': 'Watches',
                'qty': 10
            },
            {
                'name': 'Gold Necklace',
                'desc': 'Delicate chain with pendant',
                'price': 349.99,
                'brand': 'Prada',
                'category': 'Jewelry',
                'qty': 50
            },
        ]
        
        products_created = 0
        for idx, pdata in enumerate(product_data):
            store = stores[idx % len(stores)]
            brand = brands[pdata['brand']]
            category = categories[pdata['category']]
            
            product, created = Product.objects.get_or_create(
                storeID=store,
                productName=pdata['name'],
                defaults={
                    'description': pdata['desc'],
                    'price': pdata['price'],
                    'quantity': pdata['qty'],
                    'availability': True,
                    'brand': brand,
                    'category': category,
                    'isHidden': False
                }
            )
            
            if created:
                # Add product media
                ProductMedia.objects.create(
                    productID=product,
                    mediaURL=f'https://via.placeholder.com/400?text={product.productName}',
                    mediaType='image',
                    isPrimary=True,
                    sortedOrder=1
                )
                products_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {products_created} products'))
        
        # ====== Create Some Promotions ======
        products = Product.objects.all()[:4]
        promotion_count = 0
        
        for idx, product in enumerate(products):
            promo, created = Promotion.objects.get_or_create(
                productID=product,
                defaults={
                    'discountRate': 10 + (idx * 5),  # 10%, 15%, 20%, 25%
                    'startDate': timezone.now(),
                    'endDate': timezone.now() + timedelta(days=30),
                    'status': 'Active'
                }
            )
            if created:
                promotion_count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {promotion_count} promotions'))
        
        self.stdout.write(self.style.SUCCESS('Data seeding completed successfully!'))
        self.stdout.write(self.style.WARNING('\nSample login credentials:'))
        self.stdout.write('  Vendor 1: vendor1 / password123')
        self.stdout.write('  Vendor 2: vendor2 / password123')
        self.stdout.write('  Customer 1: customer1 / password123')
        self.stdout.write('  Customer 2: customer2 / password123')
        self.stdout.write('  Customer 3: customer3 / password123')
