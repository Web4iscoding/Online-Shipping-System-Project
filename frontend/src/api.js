/**
 * API Configuration and utility functions
 * Handles all communication with the Django backend
 */

const API_BASE = "http://192.168.1.41:8000";
// const API_BASE = "http://192.168.0.233:8000";
// const API_BASE = "http://172.20.10.2:8000";
// const API_BASE = "http://localhost:8000";
const API_URL = `${API_BASE}/api`;

/**
 * Generic API call function
 * @param {string} endpoint - API endpoint path (e.g., '/products/')
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @returns {Promise} - API response data
 */
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;

  if (response.status === 204) {
    data = "204 No Content";
  } else {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data.detail || data.error || JSON.stringify(data));
  }

  return data;
};

// Authentication Endpoints

export { API_BASE };

export const auth = {
  registerCustomer: (
    username,
    email,
    password,
    firstName,
    lastName,
    phoneNo,
    shippingAddress1,
    shippingAddress2,
    shippingAddress3,
  ) =>
    apiCall("/auth/register/customer/", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
        firstName,
        lastName,
        phoneNo,
        shippingAddress1,
        shippingAddress2,
        shippingAddress3,
      }),
    }),

  registerVendor: (
    username,
    email,
    password,
    firstName,
    lastName,
    storeName,
    phoneNo,
  ) =>
    apiCall("/auth/register/vendor/", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
        firstName,
        lastName,
        storeName,
        phoneNo,
      }),
    }),

  login: (email, password) =>
    apiCall("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiCall("/auth/logout/", {
      method: "POST",
    }),

  getMe: () =>
    apiCall("/auth/me/", {
      method: "GET",
    }),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    apiCall("/auth/change-password/", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }),
    }),

  updateProfile: (data) => {
    const isFormData = data instanceof FormData;
    return apiCall("/auth/update-profile/", {
      method: "PATCH",
      body: isFormData ? data : JSON.stringify(data),
    });
  },
};

// Product Endpoints

export const products = {
  list: (page = 1, search = "", ordering = "-createdTime") =>
    apiCall(`/products/?page=${page}&search=${search}&ordering=${ordering}`, {
      method: "GET",
    }),

  detail: (productID) =>
    apiCall(`/products/${productID}/`, {
      method: "GET",
    }),

  byBrand: (brandID, page = 1) =>
    apiCall(`/products/by_brand/?brand_id=${brandID}&page=${page}`, {
      method: "GET",
    }),

  byCategory: (categoryID, page = 1) =>
    apiCall(`/products/by_category/?category_id=${categoryID}&page=${page}`, {
      method: "GET",
    }),

  bySearch: (search, page = 1, ordering = "-createdTime") =>
    apiCall(
      `/products/?page=${page}&search=${encodeURIComponent(
        search,
      )}&ordering=${ordering}`,
      {
        method: "GET",
      },
    ),

  byStore: (storeID, page = 1, search = "") =>
    apiCall(
      `/products/by_store/?store_id=${storeID}&page=${page}${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`,
      { method: "GET" },
    ),

  onSale: () =>
    apiCall("/products/on_sale/", {
      method: "GET",
    }),

  inStock: (page = 1) =>
    apiCall(`/products/in_stock/?page=${page}`, {
      method: "GET",
    }),

  newest: () =>
    apiCall("/products/newest/", {
      method: "GET",
    }),
};

// Brands & Categories

export const brands = {
  list: () =>
    apiCall("/brands/", {
      method: "GET",
    }),
};

export const categories = {
  list: () =>
    apiCall("/categories/", {
      method: "GET",
    }),
};

export const stores = {
  list: () =>
    apiCall("/stores/", {
      method: "GET",
    }),

  detail: (storeID) =>
    apiCall(`/stores/${storeID}/`, {
      method: "GET",
    }),
};

// Cart Endpoints

export const cart = {
  list: () =>
    apiCall("/cart/", {
      method: "GET",
    }),

  addItem: (productID, quantity) =>
    apiCall("/cart/", {
      method: "POST",
      body: JSON.stringify({ productID, quantity }),
    }),

  updateQuantity: (productID, quantity) =>
    apiCall("/cart/update_quantity/", {
      method: "PUT",
      body: JSON.stringify({ productID, quantity }),
    }),

  removeItem: (productID) =>
    apiCall(`/cart/remove_item/?productID=${productID}`, {
      method: "DELETE",
    }),

  clear: () =>
    apiCall("/cart/clear_cart/", {
      method: "DELETE",
    }),
};

// Order Endpoints

export const orders = {
  list: () =>
    apiCall("/orders/", {
      method: "GET",
    }),

  detail: (orderID) =>
    apiCall(`/orders/${orderID}/`, {
      method: "GET",
    }),

  create: (
    firstName,
    lastName,
    phoneNo,
    shippingAddress1,
    shippingAddress2,
    shippingAddress3,
    productIds = null,
  ) =>
    apiCall("/orders/", {
      method: "POST",
      body: JSON.stringify({
        firstName,
        lastName,
        phoneNo,
        shippingAddress1,
        shippingAddress2,
        shippingAddress3,
        ...(productIds ? { product_ids: productIds } : {}),
      }),
    }),

  cancel: (orderID, reason) =>
    apiCall(`/orders/${orderID}/cancel_order/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  requestRefund: (orderID, reason) =>
    apiCall(`/orders/${orderID}/request_refund/`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

// Wishlist Endpoints

export const wishlist = {
  list: () =>
    apiCall("/wishlist/", {
      method: "GET",
    }),

  add: (productID) =>
    apiCall("/wishlist/", {
      method: "POST",
      body: JSON.stringify({ productID }),
    }),

  removeItem: (productID) =>
    apiCall(`/wishlist/remove_item/?productID=${productID}`, {
      method: "DELETE",
    }),
};

// Review Endpoints

export const reviews = {
  list: () =>
    apiCall("/reviews/", {
      method: "GET",
    }),

  byProduct: (productId) =>
    apiCall(`/reviews/by_product/?product_id=${productId}`, {
      method: "GET",
    }),

  create: (orderItemID, comment, rating, images = []) => {
    const formData = new FormData();
    formData.append("orderItemID", orderItemID);
    formData.append("comment", comment);
    formData.append("rating", rating);
    images.forEach((image) => formData.append("images", image));
    return apiCall("/reviews/", {
      method: "POST",
      body: formData,
    });
  },
};

// Vendor Endpoints

export const vendor = {
  myStore: () =>
    apiCall("/vendor/my_store/", {
      method: "GET",
    }),

  updateStore: (data) =>
    apiCall("/vendor/update_store/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  uploadStorePhoto: (imageFile, isPrimary = false, sortedOrder = 0) => {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("isPrimary", isPrimary);
    formData.append("sortedOrder", sortedOrder);
    return apiCall("/vendor/upload_store_photo/", {
      method: "POST",
      headers: {},
      body: formData,
    });
  },

  deleteStorePhoto: (photoID) =>
    apiCall(`/vendor/delete_store_photo/?photo_id=${photoID}`, {
      method: "DELETE",
    }),

  updateStorePhoto: (photoID, { isPrimary, sortedOrder, imageFile } = {}) => {
    const formData = new FormData();
    formData.append("photo_id", photoID);
    if (isPrimary !== undefined) formData.append("isPrimary", isPrimary);
    if (sortedOrder !== undefined) formData.append("sortedOrder", sortedOrder);
    if (imageFile) formData.append("image", imageFile);
    return apiCall("/vendor/update_store_photo/", {
      method: "PUT",
      headers: {},
      body: formData,
    });
  },

  myProducts: (search = "") =>
    apiCall(`/vendor/my_products/?search=${search}`, {
      method: "GET",
    }),

  getProduct: (productID) =>
    apiCall(`/vendor/get_product/?product_id=${productID}`, {
      method: "GET",
    }),

  CreateProduct: (
    productName,
    description,
    price,
    quantity,
    brand,
    category,
    images = [], // Optional array of image files
    availability = true,
    isHidden = false,
  ) => {
    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("brand", brand);
    formData.append("category", category);
    formData.append("availability", availability);
    formData.append("isHidden", isHidden);

    // Append each image file
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    return apiCall("/vendor/create_product/", {
      method: "POST",
      headers: {},
      body: formData,
    });
  },

  UpdateProduct: (productID, fieldsToBeUpdated) =>
    apiCall("/vendor/update_product/", {
      method: "PUT",
      body: JSON.stringify({
        productID,
        ...fieldsToBeUpdated,
      }),
    }),

  DeleteProduct: (productID) =>
    apiCall(`/vendor/delete_product/?productID=${productID}`, {
      method: "DELETE",
    }),

  uploadProductImage: (
    productID,
    imageFile,
    isPrimary = false,
    sortedOrder = 0,
  ) => {
    const formData = new FormData();
    formData.append("product_id", productID);
    formData.append("image", imageFile);
    formData.append("isPrimary", isPrimary);
    formData.append("sortedOrder", sortedOrder);

    return apiCall("/vendor/upload_product_image/", {
      method: "POST",
      headers: {},
      body: formData,
    });
  },

  deleteProductImage: (mediaID) =>
    apiCall(`/vendor/delete_product_image/?media_id=${mediaID}`, {
      method: "DELETE",
    }),

  updateProductImage: (mediaID, { isPrimary, sortedOrder, imageFile } = {}) => {
    const formData = new FormData();
    formData.append("media_id", mediaID);

    if (isPrimary !== undefined) {
      formData.append("isPrimary", isPrimary);
    }

    if (sortedOrder !== undefined) {
      formData.append("sortedOrder", sortedOrder);
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    return apiCall("/vendor/update_product_image/", {
      method: "PUT",
      headers: {},
      body: formData,
    });
  },

  salesSummary: () =>
    apiCall("/vendor/sales_summary/", {
      method: "GET",
    }),

  // Customer Orders Management
  customerOrders: (status = "", refundRequest = null) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (refundRequest !== null) params.append("refund_request", refundRequest);
    const query = params.toString();
    return apiCall(`/vendor/customer_orders/${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },

  customerOrderDetail: (orderID) =>
    apiCall(`/vendor/customer_order_detail/?order_id=${orderID}`, {
      method: "GET",
    }),

  updateOrderStatus: (orderID, status, reason = "") =>
    apiCall("/vendor/update_order_status/", {
      method: "PUT",
      body: JSON.stringify({
        order_id: orderID,
        status,
        reason,
      }),
    }),

  dismissRefundRequest: (orderID, action = "approve") =>
    apiCall("/vendor/dismiss_refund_request/", {
      method: "PUT",
      body: JSON.stringify({ order_id: orderID, action }),
    }),

  // Promotion / Discount Management
  myPromotions: () =>
    apiCall("/vendor/my_promotions/", {
      method: "GET",
    }),

  createPromotion: (productID, discountRate, startDate, endDate) =>
    apiCall("/vendor/create_promotion/", {
      method: "POST",
      body: JSON.stringify({
        productID,
        discountRate,
        startDate,
        endDate,
      }),
    }),

  deletePromotion: (promotionID) =>
    apiCall(`/vendor/delete_promotion/?promotion_id=${promotionID}`, {
      method: "DELETE",
    }),
};

// Notification Endpoints

export const notifications = {
  list: () =>
    apiCall("/notifications/", {
      method: "GET",
    }),

  unreadCount: () =>
    apiCall("/notifications/unread_count/", {
      method: "GET",
    }),

  markRead: (notificationID) =>
    apiCall("/notifications/mark_read/", {
      method: "PUT",
      body: JSON.stringify({ notification_id: notificationID }),
    }),

  markAllRead: () =>
    apiCall("/notifications/mark_all_read/", {
      method: "PUT",
    }),
};
