import {
  TrashCanIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  CartArrowDownIcon,
  CheckboxMarkedIcon,
  CheckboxBlankIcon,
} from "../../assets/icons";
import noImage from "../../assets/no_image_available.jpg";
import "../../styles/Cart.css";
import { cart as cartAPI, orders as OrdersAPI, API_BASE } from "../../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const CartItem = ({
  productID,
  productName,
  productPrice,
  discountedPrice,
  discountRate,
  ProductCartQuantity,
  productStock,
  productImage,
  handleUpdateQuantity,
  handleDelete,
  isSelected,
  onToggleSelect,
}) => {
  const navigate = useNavigate();
  const isDecreaseDisabled = ProductCartQuantity <= 1;
  const isIncreaseDisabled = ProductCartQuantity >= productStock;
  const hasDiscount = discountRate > 0;

  return (
    <div
      className={`cart-item ${isSelected ? "cart-item-selected" : ""}`}
      onClick={() => navigate(`/product/${productID}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="cart-item-action-buttons">
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(productID); }}
          id="cart-item-delete-button"
        >
          <TrashCanIcon />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(productID); }}
          id="cart-item-select-button"
        >
          {isSelected ? <CheckboxMarkedIcon /> : <CheckboxBlankIcon />}
        </button>
      </div>

      

      <h2 className="cart-item-title">{productName}</h2>
      <div className="cart-item-info">
        <img src={productImage} alt={productName} />
        {hasDiscount ? (
          <div className="cart-item-price-group">
            <h3>${Number(discountedPrice).toFixed(2)}</h3>
            <span className="cart-item-price-original">${Number(productPrice).toFixed(2)}</span>
          </div>
        ) : (
          <h3>${productPrice}</h3>
        )}
      </div>
      <div className="cart-item-quantity-button-group" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => {
            if (!isDecreaseDisabled) {
              handleUpdateQuantity(productID, ProductCartQuantity - 1);
            }
          }}
          className={isDecreaseDisabled ? "disabled" : ""}
          id="cart-item-quantity-decrease-button"
          disabled={isDecreaseDisabled}
        >
          <MinusIcon />
        </button>
        <p>{ProductCartQuantity}</p>
        <button
          onClick={() => {
            if (!isIncreaseDisabled) {
              handleUpdateQuantity(productID, ProductCartQuantity + 1);
            }
          }}
          className={isIncreaseDisabled ? "disabled" : ""}
          id="cart-item-quantity-increase-button"
          disabled={isIncreaseDisabled}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfItems, setNumberOfItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function performFetch() {
      const cartData = await cartAPI.list();
      console.log(cartData.items);
      console.log(cartData);
      setCartItems(cartData.items);
      setTotalPrice(cartData.total);
      setNumberOfItems(cartData.item_count);
      // Select all items by default
      setSelectedItems(new Set(cartData.items.map((item) => item.product.productID)));
    }
    performFetch();
  }, []);

  const handleToggleSelect = (productID) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(productID)) {
        next.delete(productID);
      } else {
        next.add(productID);
      }
      return next;
    });
  };

  // Compute total for selected items only
  const selectedTotal = cartItems
    .filter((item) => selectedItems.has(item.product.productID))
    .reduce((sum, item) => {
      const price = item.product.discount_rate > 0
        ? Number(item.product.discounted_price)
        : Number(item.product.price);
      return sum + price * item.quantity;
    }, 0);

  const selectedCount = selectedItems.size;

  // const handleCheckout = async () => {
  //   const response = await OrdersAPI.create(
  //     user.firstName,
  //     user.lastName,
  //     user.phoneNo,
  //     user.shippingAddress1,
  //     user.shippingAddress2,
  //     user.shippingAddress3,
  //   );
  //   console.log(response);

  //   // If multiple orders were created (items from different vendors)
  //   if (response.orders && response.orders.length > 0) {
  //     // Navigate to the first order's page
  //     // Alternatively, you could navigate to a summary page showing all orders
  //     navigate("/my-orders/");
  //   }
  // };

  const handleDelete = async (productID) => {
    await cartAPI.removeItem(productID);
    const cartData = await cartAPI.list();
    setCartItems(cartData.items);
    setTotalPrice(cartData.total);
    setNumberOfItems(cartData.item_count);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleUpdateQuantity = async (productID, quantity) => {
    if (
      quantity <=
      cartItems.find((item) => item.product.productID === productID).product
        .quantity
    ) {
      await cartAPI.updateQuantity(productID, quantity);
      const cartData = await cartAPI.list();
      setCartItems(cartData.items);
      setTotalPrice(cartData.total);
      setNumberOfItems(cartData.item_count);
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-title">Shopping Cart</h2>
        <p className="cart-items-count">
          {numberOfItems} {numberOfItems === 1 ? "item" : "items"}
        </p>
      </div>
      {numberOfItems === 0 && (
        <div className="no-cart-item-container">
          <CartArrowDownIcon size={1.3} />
          <p>Add items to your shopping cart</p>
        </div>
      )}
      {numberOfItems > 0 && (
        <div className="cart-item-container">
          {cartItems.map((item, index) => (
            <CartItem
              key={index}
              productID={item.product.productID}
              productName={item.product.productName}
              productPrice={item.product.price}
              discountedPrice={item.product.discounted_price}
              discountRate={item.product.discount_rate}
              ProductCartQuantity={item.quantity}
              productStock={item.product.quantity}
              productImage={
                item.product?.["primary_image"]
                  ? `${API_BASE}/${item.product?.["primary_image"]}`
                  : noImage
              }
              handleUpdateQuantity={handleUpdateQuantity}
              handleDelete={handleDelete}
              isSelected={selectedItems.has(item.product.productID)}
              onToggleSelect={handleToggleSelect}
            />
          ))}
        </div>
      )}
      {numberOfItems > 0 && (
        <div className="cart-total-container">
          <p className="cart-total-title">Total ({selectedCount} selected)</p>
          <p className="cart-total">${Number(selectedTotal).toFixed(2)}</p>
        </div>
      )}
      {numberOfItems === 0 && (
        <button
          id="cart-shop-now-button"
          onClick={() => navigate("/product-list/all-items")}
        >
          SHOP NOW
        </button>
      )}
      {(numberOfItems > 0 && selectedCount > 0) && (
        <button
          id="checkout-button"
          onClick={() => navigate("/checkout", { state: { selectedProductIds: [...selectedItems] } })}
          disabled={selectedCount === 0}
        >
          <CreditCardIcon />
          <p>Proceed to Checkout</p>
        </button>
      )}
      {numberOfItems > 0 && (
        <button id="continue-shopping-button" onClick={() => navigate("/product-list/all-items")}>
          Continue Shopping
        </button>
      )}
    </div>
  );
};

export default Cart;
