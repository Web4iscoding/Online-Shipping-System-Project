### 1. Clone the Repository

```bash
git clone https://github.com/Web4iscoding/Online-Shipping-System-Project.git
cd Online-Shipping-System-Project
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at: **http://localhost:8000**
Admin will be available at : **http://localhost:8000/admin**

### 3. Frontend Setup

```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## Project Structure

```
Online-Shipping-System-Project/
├── backend/                          # Django backend
│   ├── api/
│   │   ├── models.py                # Database models
│   │   ├── serializers.py           # API serializers
│   │   ├── admin.py                 # Admin functions
│   │   ├── views.py                 # API endpoints
│   │   ├── urls.py                  # URL routing
│   │   └── migrations/              # Database migrations
│   ├── backend/
│   │   ├── settings.py              # Django settings
│   │   ├── urls.py                  # Main URLs
│   │   └── wsgi.py                  # WSGI config
│   ├── manage.py
│   ├── db.sqlite3                   # Development database
│   └── requirements.txt             # Python dependencies
│
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Navigation.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── auth/               # Auth components
│   │   │   ├── products/           # Product components
│   │   │   ├── cart/               # Cart components
│   │   │   ├── vendor/             # Vendor components
│   │   │   └── wishlist/           # Wishlist components
│   │   ├── api.js                   # API client
│   │   ├── AuthContext.jsx          # Auth context
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── public/                       # Static files
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js              # Vite config
│   └── index.html                   # HTML entry point
│
│
└── README.md                         # This file
```

---

User Authentication
/auth/register/customer/
/auth/register/vendor/
/auth/login
/auth/logout/
/auth/me/

Product APIs
/products/?page=${}&search=${}&ordering=${}
/products/${}
/products/by_brand/?brand_id=${brandID}
/products/by_category/?category_id=${categoryID}
/products/by_store/?store_id=${storeID}
/products/on_sale/

Brands & Categories
/brands/
/categories/
/stores/

Cart
/cart/
/cart/remove_item/?productID=${}
/cart/clear_cart/

Order
/orders/
/orders/${}
/orders/${}/cancel_order/


Wishlist
/wishlist/
/wishlist/remove_item/?productID=${}

Reviews
/reviews/

Vendor
/vendor/my_store/
/vendor/my_products/
/vendor/sales_summary/
/vendor/create_product/
/vendor/update_product/
/vendor/delete_product/
