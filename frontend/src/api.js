/**
 * API Configuration and utility functions
 * Handles all communication with the Django backend
 */

const API_BASE = "http://192.168.1.108:8000";
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
    "Content-Type": "application/json",
    ...options.headers,
  };

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

  byStore: (storeID, page = 1) =>
    apiCall(`/products/by_store/?store_id=${storeID}&page=${page}`, {
      method: "GET",
    }),

  onSale: () =>
    apiCall("/products/on_sale/", {
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

  add: (productID, quantity) =>
    apiCall("/cart/", {
      method: "POST",
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

  create: (shippingAddress) =>
    apiCall("/orders/", {
      method: "POST",
      body: JSON.stringify({ shippingAddress }),
    }),

  cancel: (orderID, reason) =>
    apiCall(`/orders/${orderID}/cancel_order/`, {
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

  create: (orderItemID, comment, date, rating) =>
    apiCall("/reviews/", {
      method: "POST",
      body: JSON.stringify({
        orderItemID,
        comment,
        date,
        rating,
      }),
    }),
};

// Vendor Endpoints

export const vendor = {
  myStore: () =>
    apiCall("/vendor/my_store/", {
      method: "GET",
    }),

  myProducts: (search = "") =>
    apiCall(`/vendor/my_products/?search=${search}`, {
      method: "GET",
    }),

  CreateProduct: (
    productID,
    productName,
    description,
    price,
    quantity,
    availability,
    isHidden,
    brand,
    category,
  ) =>
    apiCall("/vendor/create_product/", {
      method: "POST",
      body: JSON.stringify({
        productID,
        productName,
        description,
        price,
        quantity,
        availability,
        isHidden,
        brand,
        category,
      }),
    }),

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

  salesSummary: () =>
    apiCall("/vendor/sales_summary/", {
      method: "GET",
    }),
};
