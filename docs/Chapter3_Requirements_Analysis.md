# Chapter 3: Requirements Analysis

This chapter explains how the development team determined the needs and conditions that the Online Fashion Marketplace system must meet. The analysis covers system feature requirements, user requirements, and the system specification, followed by discussions on advanced functions, business requirements, and societal considerations.

---

## 3.1 Analysis Scheme and Methods

### 3.1.1 Product Domain

The system is an **online fashion marketplace** that enables multiple independent vendors to sell fashion products — including apparel, accessories, and branded goods from labels such as Vivienne Westwood, Gucci, Chrome Hearts, and Balenciaga — to customers through dedicated vendor storefronts. Unlike single-seller e-commerce platforms, the system operates as a multi-vendor marketplace where each vendor manages their own store, inventory, promotions, and order fulfilment.

### 3.1.2 Reference Systems

The following established e-commerce platforms were studied during the requirements analysis phase to identify both common and domain-specific features:

| Reference System | Features Referenced |
|------------------|---------------------|
| **Shopee / Lazada** | Multi-vendor marketplace model, per-vendor order grouping, vendor storefront pages, seller dashboards with sales summaries, and the separation of orders by vendor during checkout. |
| **ASOS / Farfetch** | Fashion-specific product browsing with brand and category filtering, product image galleries with swipe-enabled carousels, size/stock indicators, and the visual emphasis on brand identity in navigation menus. |
| **Amazon** | Customer review system with star ratings and media attachments, wishlist functionality with price tracking, order status tracking (Pending → Holding → Shipped), and refund request workflows. |
| **Taobao** | Real-time notification system for order updates, promotion-triggered notifications for wishlisted items, and the general multi-vendor communication pattern between buyers and sellers. |

### 3.1.3 Adaptations for Fashion E-Commerce

Several features were adapted from the reference systems to better suit the fashion product domain:

- **Brand and Category Navigation**: Unlike general marketplaces, the navigation system features a mega dropdown menu displaying the top 7 brands and categories with images, reflecting how fashion consumers often browse by brand rather than by keyword search alone.
- **Visual-First Product Presentation**: Product detail pages support multi-image galleries with touch-swipe navigation and dot selectors, recognising that fashion purchases are heavily driven by visual inspection. Vendors can upload multiple images per product and designate a primary display image.
- **Vendor Storefront Identity**: Each vendor has a dedicated store page with customisable store photos (with primary photo selection and drag-and-drop reordering), a store description, and an aggregated average rating — modelled after how fashion boutiques present their brand identity online.
- **Review Media Uploads**: Customers can attach images to their reviews, which is particularly important in fashion where other buyers want to see how products look in real use rather than in studio-shot vendor photos.
- **Discount and Promotion Visibility**: Active promotions display discounted prices with strikethrough original pricing and percentage badges directly on product cards and detail pages, a pattern common in fashion retail where seasonal sales drive significant purchasing behaviour.

### 3.1.4 Analysis Methods

The team employed the following methods for gathering and validating requirements:

1. **Competitive Analysis**: Systematic comparison of features across the reference platforms listed above, identifying common patterns (cart, checkout, reviews) and fashion-specific patterns (brand browsing, visual galleries).
2. **User Persona Development**: Definition of two primary user personas — a fashion-conscious consumer who browses by brand and values visual product presentation, and an independent fashion vendor who needs straightforward inventory and order management tools.
3. **Iterative Prototyping**: Requirements were refined through iterative development cycles, where early implementations were tested against user expectations and adjusted. For example, the notification system was added after recognising that order status updates and wishlist price drops required proactive communication rather than requiring users to manually check for changes.

### 3.1.5 Scope of Fulfilled Requirements

The following major requirement areas have been fully implemented in the delivered system:

| Requirement Area | Status | Report Reference |
|------------------|--------|------------------|
| Multi-vendor marketplace with storefronts | Fulfilled | Section 3.3 |
| Customer registration, login, and profile management | Fulfilled | Section 3.3 |
| Product browsing with search, filtering, and pagination | Fulfilled | Section 3.3 |
| Shopping cart and multi-vendor checkout | Fulfilled | Section 3.3 |
| Order lifecycle management (Pending → Holding → Shipped / Cancelled) | Fulfilled | Section 3.3 |
| Refund request and approval workflow | Fulfilled | Section 3.3 |
| Customer reviews with ratings and media | Fulfilled | Section 3.3 |
| Wishlist with price tracking | Fulfilled | Section 3.3 |
| Vendor promotion and discount management | Fulfilled | Section 3.3 |
| Real-time notification system | Fulfilled | Section 3.3 |
| Dark mode and responsive design | Fulfilled | Section 3.4 |
| Contact form with reCAPTCHA protection | Fulfilled | Section 3.5 |

Requirements identified but **not implemented** in this iteration include: real-time chat between customers and vendors, payment gateway integration (orders are currently placed without payment processing), product size/variant selection, and delivery tracking with third-party courier APIs.

---

## 3.2 User Requirements

### 3.2.1 User Groups

The system serves three distinct user groups, each with different needs and concerns:

#### Customer (Fashion Consumer)

The primary end-user who browses, purchases, and reviews fashion products.

**Key Concerns:**
- **Product Discovery**: Customers need efficient ways to find products among a growing catalog. They expect to browse by brand, category, and store, search by keyword, and filter by availability and sale status. The system addresses this through a search bar with 300ms debounce, mega dropdown menus for brand/category navigation, and filtered product listing pages with pagination (8 items per page).
- **Visual Confidence**: Fashion purchases depend heavily on seeing detailed product images. Customers require multi-angle product photos and real customer review photos. The system provides swipe-enabled image carousels on product pages and supports media uploads on reviews.
- **Price Awareness**: Customers want to know when items go on sale. The wishlist tracks the price at the time of adding, and the system automatically sends notifications when wishlisted items receive a new promotion.
- **Order Transparency**: After placing an order, customers need visibility into its status. The notification system proactively informs customers when orders move to Holding, Shipped, or Cancelled, and when refund requests are approved or rejected.
- **Trust and Feedback**: Customers rely on reviews from other buyers. The review system enforces one review per purchased item (preventing spam) and displays reviewer identities, star ratings (0.5–5.0), comments, and attached media.

#### Vendor (Fashion Seller)

Independent sellers who list products, manage inventory, and fulfil orders.

**Key Concerns:**
- **Store Branding**: Vendors need to establish their store identity. The system provides a customisable storefront with store name, description, multiple store photos with primary photo selection and reordering, and an aggregated customer rating displayed on the store page.
- **Inventory Control**: Vendors require tools to manage product listings efficiently. They can create products with batch image uploads, set availability flags, hide products without deleting them, and update stock quantities. The sales summary dashboard provides an overview of total sales, order counts, and product counts.
- **Order Management**: Vendors need a clear workflow for processing customer orders. The system provides filtered order views (by status and refund request), status update controls (Pending → Holding → Shipped), cancellation with reason capture, and refund request approval/rejection — all with automatic customer notifications.
- **Promotion Management**: Vendors want to run sales and attract customers. They can create time-bound promotions with percentage discounts, and the system automatically notifies customers who have the promoted product in their wishlist.

#### Administrator

System administrators who oversee platform operations via the Django admin panel.

**Key Concerns:**
- **Data Oversight**: Full access to all database records including users, orders, products, and stores through the Django admin interface.
- **User Management**: Ability to manage customer and vendor accounts, including deactivation if needed.

### 3.2.2 User Experience Requirements

The following UX requirements were identified and addressed during development:

**Responsive Design**: The system must function well on both desktop and mobile devices. The navigation adapts between a full dropdown menu (desktop) and a hamburger drawer menu with accordions (mobile). Product carousels support touch-swipe on mobile. The homepage brand section uses a grid layout on desktop and an auto-rotating touch carousel on mobile.

**Dark Mode**: Users increasingly expect the option to reduce eye strain. The system implements a dark mode toggle that persists the preference in localStorage and applies via a CSS class on the root element, ensuring the preference survives page reloads and is applied instantly on load.

**Accessibility**: Interactive elements include `aria-label` attributes (e.g., the dark mode toggle announces "Switch to light mode" / "Switch to dark mode"). Loading placeholder cards use `aria-hidden` to avoid confusing screen readers. Form inputs use semantic HTML with proper labels. Buttons display clear disabled states when actions are unavailable.

**Feedback and Error Handling**: The system provides immediate visual feedback through success windows, warning modals, and loading indicators. Form validation occurs both client-side (email pattern validation, password minimum length, password confirmation matching) and server-side (email/username uniqueness). Errors are displayed in user-friendly modal windows rather than raw API responses.

**Performance Perception**: Skeleton loading cards (8 placeholders) appear during product list fetches, providing perceived responsiveness. Smooth scroll-to-top behaviour triggers on page navigation. The homepage marquee animation runs at 60fps using `requestAnimationFrame`. Notification counts and cart counts are polled every 30 seconds to stay current without requiring page reloads.

### 3.2.3 Information Security Requirements

Users expect their data and accounts to be protected. The following security requirements were identified and implemented:

- **Token-Based Authentication**: Each login generates a unique authentication token per device, supporting multi-device sessions. Logging out from one device does not affect sessions on other devices.
- **Password Security**: Password changes require the current password for verification. Registration enforces a minimum password length of 6 characters with confirmation matching.
- **Access Control**: API endpoints enforce role-based permissions — customers cannot access vendor management endpoints and vice versa. All data queries are scoped to the authenticated user (customers see only their orders; vendors see only orders for their products).
- **CORS Configuration**: Cross-Origin Resource Sharing is restricted to specific allowed origins, preventing unauthorised domains from making API requests.
- **reCAPTCHA Protection**: The contact form integrates Google reCAPTCHA v2 to prevent automated spam submissions.
- **Data Isolation**: Customer orders, wishlists, carts, and reviews are strictly scoped to the authenticated user through foreign key filtering in all API queries.

### 3.2.4 Fulfilled and Outstanding User Requirements

| User Requirement | Status | Notes |
|------------------|--------|-------|
| Intuitive browsing by brand, category, and store | Fulfilled | Mega dropdown menu, filtered product lists |
| Visual product presentation with image galleries | Fulfilled | Multi-image carousel with swipe support |
| Wishlist with price-drop notifications | Fulfilled | Automatic promotion notifications |
| Order status transparency via notifications | Fulfilled | 7 notification types covering full order lifecycle |
| Review system with media for purchase confidence | Fulfilled | Star ratings, comments, image uploads |
| Multi-device login support | Fulfilled | Per-device token authentication |
| Dark mode for visual comfort | Fulfilled | Persistent dark mode toggle |
| Responsive mobile experience | Fulfilled | Adaptive navigation, touch carousels, mobile layouts |
| Accessible interface elements | Fulfilled | aria-labels, semantic HTML, disabled states |
| Real-time chat between customer and vendor | Not Fulfilled | Identified as a future enhancement |
| Payment integration | Not Fulfilled | Orders placed without payment processing |
| Delivery tracking with courier APIs | Not Fulfilled | Planned for future iterations |

---

## 3.3 System Specification

This section documents the functional requirement blocks that were chosen and successfully implemented in the system.

### 3.3.1 User Management

- **Customer Registration**: Multi-step form collecting email, password (with visibility toggle and confirmation), first/last name, username, phone number (international format input), and three-line shipping address. Default country set to Macao (MO).
- **Vendor Registration**: Similar form collecting email, password, first/last name, username, phone number, and store name. A store entity is automatically created upon vendor registration.
- **Login**: Email-based authentication (not username-based). Returns a per-device token for session management.
- **Logout**: Removes only the current device's token, preserving sessions on other devices.
- **Profile Management**: Users can update personal information and profile images through dedicated account detail pages.
- **Password Change**: Requires current password verification before allowing update.

### 3.3.2 Product Catalog

- **Product Listing**: Paginated display (8 items per page) with first/last/previous/next page controls.
- **Search**: Keyword search across product name, description, and brand with debounced input.
- **Filtering**: By brand, category, store, in-stock status, on-sale status, and newest (last 30 days).
- **Product Detail**: Full product information with multi-image carousel (swipe-enabled), price display with discount badges, stock status indicator ("In Stock" / "Only X left" / "Out of Stock"), quantity selector bounded by available stock, add-to-cart and wishlist toggle buttons, vendor information card, and review section (top 5 reviews with option to view all).
- **Brand and Category Browsing**: Dedicated pages listing all brands and all categories.

### 3.3.3 Shopping Cart and Checkout

- **Cart Management**: Add items with quantity, update quantities, remove individual items, clear entire cart. Automatic removal of hidden/unavailable products. Subtotals calculated with active discounts applied.
- **Checkout**: Shipping address form pre-filled from customer profile with option to enter a new address. Orders are automatically grouped by vendor — a separate order is created for each vendor's items. Product prices (including active discounts) are captured at purchase time. Product inventory is decremented upon order creation. Cart is cleared after successful order placement.
- **Order Confirmation**: Dedicated purchase-complete page displays after successful checkout.

### 3.3.4 Order Management

- **Customer Order View**: List of all orders with detail view showing items, quantities, paid prices, order status, shipping address, and timestamps.
- **Order Cancellation**: Customers can cancel their own orders with a reason.
- **Refund Requests**: Customers can request refunds on Pending or Holding orders with a reason.
- **Vendor Order Dashboard**: Filtered view of customer orders (by status, refund request status) showing customer details, shipping address, order totals, and line items.
- **Order Status Updates**: Vendors progress orders through Pending → Holding → Shipped, or cancel with a reason.
- **Refund Handling**: Vendors can approve or reject refund requests. Customers receive automatic notifications of the decision.
- **Automatic Notifications**: Notifications are sent to the relevant party on every status transition and refund decision.

### 3.3.5 Reviews and Ratings

- **Review Submission**: Customers can write one review per purchased item (enforced via one-to-one relationship with OrderItem). Available only after order is shipped. Supports star rating (0.5–5.0), text comment, and batch image/video upload.
- **Review Display**: Product detail pages show aggregated average rating with visual star representation (full, half, empty), total review count, and individual reviews with reviewer avatar, username, date, rating, comment, and attached media. A lightbox modal displays review images at full size.
- **Store Rating**: Average rating across all reviews for a vendor's products is calculated and displayed on the store page.

### 3.3.6 Wishlist

- **Wishlist Management**: Add and remove products. One wishlist entry per customer per product.
- **Price Tracking**: Records the original price, discount rate, and effective price at the time of adding. Enables comparison when a new promotion is created.
- **Sale Notifications**: When a vendor creates a promotion for a product, all customers who have that product in their wishlist receive an automatic notification.

### 3.3.7 Vendor Store Management

- **Store Profile**: Editable store name and description.
- **Store Photos**: Upload multiple store photos, set a primary photo, reorder photos (with drag-and-drop support on the frontend), and delete photos.
- **Product Management**: Create products with batch image uploads (first image auto-set as primary), edit all product fields, toggle availability and hidden status, upload/update/delete product images with primary flag and sort order.
- **Sales Summary**: Dashboard displaying total sales amount, total order count, and total product count.

### 3.3.8 Promotions and Discounts

- **Promotion Creation**: Vendors create promotions for specific products with discount percentage (0–100%), start date, and end date.
- **Automatic Status**: Promotion status (Active/Inactive) is determined by whether the current date falls within the promotion's date range.
- **Discount Application**: Active discounts are reflected in product listings (showing discounted price), shopping cart subtotals, and captured in paid price at order creation.
- **Wishlist Notifications**: When a promotion is created, customers with the related product in their wishlist are automatically notified. A `notificationSent` flag prevents duplicate notifications.

### 3.3.9 Notification System

- **Notification Types**: The system supports 7 notification types:
  - `wishlist_sale` — A wishlisted product has a new promotion
  - `order_shipped` — Customer's order has been shipped
  - `order_holding` — Customer's order is being held
  - `refund_approved` — Customer's refund request was approved
  - `order_cancelled` — Order has been cancelled
  - `new_order` — Vendor has received a new order
  - `refund_request` — Vendor has received a refund request
- **Notification Management**: View all notifications (ordered by date), mark individual notifications as read, mark all as read, and view unread count.
- **UI Indicator**: Notification bell icon in the navigation bar displays a badge with the unread count (capped at "99+"), polled every 30 seconds.

---

## 3.4 Advanced Function Requirements

### 3.4.1 Dark Mode

**Rationale**: Fashion e-commerce users often browse for extended periods, especially on mobile devices during evening hours. Dark mode reduces eye strain and improves battery life on OLED screens. The feature benefits all user groups but is particularly valued by younger demographics who are accustomed to dark mode options across their applications.

**Implementation**: The dark mode preference is persisted in `localStorage` and applied as a CSS class on the root HTML element. The toggle is accessible from the navigation bar on all pages, and the system defaults to the user's operating system preference on first visit.

### 3.4.2 Multi-Image Product Galleries with Touch Support

**Rationale**: Fashion consumers cannot physically inspect products before purchase. Providing multiple product images with an intuitive viewing experience (swipe gestures, dot navigation, arrow controls) reduces purchase hesitation and return rates. This is particularly important for fashion where fabric texture, fit, and colour accuracy are key decision factors.

**Target Users**: All customers, especially mobile users who interact primarily through touch gestures.

### 3.4.3 Per-Vendor Order Grouping

**Rationale**: In a multi-vendor marketplace, customers may purchase items from multiple vendors in a single cart session. Grouping orders by vendor during checkout ensures that each vendor receives and manages only the orders relevant to their store, preventing fulfilment confusion. This design mirrors the approach used by established multi-vendor platforms such as Shopee and Lazada.

### 3.4.4 Wishlist Price-Drop Notifications

**Rationale**: Fashion products frequently go on sale, and customers who previously considered a product at full price are the most likely to convert when a discount becomes available. By tracking the price at the time of adding to the wishlist and automatically notifying customers when a promotion is created, the system provides a personalised and timely nudge that drives conversions without requiring customers to continually check for sales.

### 3.4.5 Review Media Attachments

**Rationale**: User-generated review content with images significantly influences purchase decisions in fashion e-commerce. Studio product photos from vendors show idealised representations, while customer-submitted review images show how products look in real-world conditions. This builds trust among potential buyers and serves as social proof, which is particularly important for new customers who are unfamiliar with a vendor.

### 3.4.6 Animated and Engaging UI Elements

**Rationale**: The homepage features a continuous marquee animation showcasing products, a brand carousel with auto-rotation, and a custom glass-morphism animated button — all designed to create a visually engaging first impression that aligns with the aesthetic expectations of fashion-conscious users. The Contact Us page includes an animated dino character with a state machine driving its behaviour (rising, peeking, walking with boundary detection), adding personality to an otherwise utilitarian form page.

---

## 3.5 Business Requirements

### 3.5.1 Search and Discovery

Effective product discovery directly impacts revenue. The system implements multiple discovery pathways — keyword search, brand/category navigation via mega dropdowns, filtered listing pages, and a dedicated newest products section on the homepage — to ensure that potential customers can find relevant products regardless of their browsing style. The homepage displays new arrivals (products added in the last 30 days) prominently, encouraging repeat visits and increasing the likelihood of purchase.

### 3.5.2 Vendor Self-Service

Reducing operational overhead is critical for marketplace viability. The system enables vendors to independently manage their storefronts, product listings, inventory, promotions, and order fulfilment without requiring administrator intervention. The vendor dashboard provides a sales summary (total revenue, order count, product count) for business performance monitoring. This self-service model allows the platform to scale to many vendors without proportionally increasing administrative workload.

### 3.5.3 Information Security

Protecting business data and user accounts is essential for trust and regulatory compliance. The system implements:

- **Token-based authentication** with per-device session management, ensuring that a compromised session on one device does not affect others.
- **Role-based access control** at the API level, preventing customers from accessing vendor management functions and vice versa.
- **Data scoping** through foreign key filtering in all queries, ensuring users can only access their own data.
- **CORS restrictions** limiting API access to approved frontend origins.
- **reCAPTCHA integration** on the contact form to prevent automated abuse.
- **Password verification** required for password changes, preventing unauthorised account takeover even if a session is active.

These measures protect both customer personal data and vendor business data, minimising the risk of data breaches and maintaining platform integrity.

### 3.5.4 Order Integrity

The system captures product prices (including active discounts) at the time of order creation, ensuring that subsequent price changes do not affect existing orders. Product inventory is decremented atomically during order creation to prevent overselling. These measures maintain financial accuracy and prevent disputes between customers and vendors.

---

## 3.6 Societal and Environmental Considerations

### 3.6.1 Reducing Return Rates Through Informed Purchases

Fashion e-commerce historically suffers from high return rates, which generate packaging waste, transportation emissions, and product damage. The system mitigates this by providing:

- **Multi-image product galleries** that give customers a thorough visual understanding of products before purchase.
- **Customer review photos** that show products in real-world conditions, reducing the gap between expectation and reality.
- **Star ratings and review text** that help customers assess product quality before buying.
- **Stock status indicators** ("Only X left") that provide accurate availability information, preventing order cancellations due to stock discrepancies.

By enabling more informed purchase decisions, the system contributes to reducing unnecessary returns and their associated environmental impact.

### 3.6.2 Digital-First Communication

The notification system replaces the need for email or SMS-based order updates with in-app notifications, reducing reliance on external communication infrastructure. All order status changes, refund decisions, and promotion alerts are delivered within the platform, encouraging users to engage with the system directly rather than through additional communication channels.

### 3.6.3 Inclusive Design

The system implements dark mode for users with light sensitivity or visual comfort preferences, provides `aria-label` attributes on interactive elements for screen reader compatibility, uses semantic HTML structure, and displays clear disabled states on buttons to prevent confusion. These measures contribute to making the platform accessible to a broader range of users, including those with visual impairments or preferences for reduced light exposure.
