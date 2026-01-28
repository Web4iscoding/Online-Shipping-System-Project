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

### API Base URL
```
http://localhost:8000/api/
```

### Main Endpoints

#### Authentication
```
POST   /api/token/           - Get authentication token
POST   /api/token/refresh/   - Refresh token
```

#### Products
```
GET    /api/products/        - List all products
GET    /api/products/{id}/   - Get product details
```

#### Vendor Store Management
```
GET    /api/vendor-stores/my-store/           - Get vendor's store
GET    /api/vendor-stores/my-products/        - Get vendor's products
POST   /api/vendor-stores/create_product/     - Create new product
PUT    /api/vendor-stores/update_product/     - Update product
DELETE /api/vendor-stores/delete_product/     - Delete product
GET    /api/vendor-stores/sales-summary/      - Get sales statistics
```

#### Shopping Cart
```
GET    /api/cart/            - Get cart items
POST   /api/cart/            - Add to cart
PUT    /api/cart/{id}/       - Update cart item
DELETE /api/cart/{id}/       - Remove from cart
```

#### Orders
```
GET    /api/orders/          - Get user's orders
POST   /api/orders/          - Create new order
GET    /api/orders/{id}/     - Get order details
```