import "../../../styles/Wishlist.css";
import "../../../styles/Cart.css";
import { useEffect, useState } from "react";
import { wishlist as wishlistAPI, API_BASE } from "../../../api";
import { useNavigate } from "react-router-dom";
import noImage from "../../../assets/no_image_available.jpg";
import { TrashCanIcon, HeartPlusOutlineIcon } from "../../../assets/icons";


const WishlistItem = ({
  productID,
  productName,
  productPrice,
  discountedPrice,
  discountRate,
  productImage,
  handleDelete,
}) => {
  const hasDiscount = discountRate > 0;

  return (
    <div className="cart-item">
      <button
        onClick={() => handleDelete(productID)}
        id="cart-item-delete-button"
      >
        <TrashCanIcon />
      </button>
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
    </div>
  );
};


const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [numberOfItems, setNumberOfItems] = useState(0);

    useEffect(() => {
        async function performFetch() {
            const wishlist = await wishlistAPI.list();
            setWishlistItems(wishlist);
            console.log(wishlist);
            setNumberOfItems(wishlist.length);
        }
        performFetch();
    }, []);

    const handleRemoveFromWishlist = async (productID) => {
        await wishlistAPI.removeItem(productID);
        const wishlist = await wishlistAPI.list();
        setWishlistItems(wishlist);
        setNumberOfItems(wishlist.length);
      }

    return (
        <div className="cart-container">
      <div className="cart-header">
        <h2 className="cart-title">Wishlist</h2>
        <p className="cart-items-count">
          {numberOfItems} {numberOfItems === 1 ? "item" : "items"}
        </p>
      </div>
      {numberOfItems === 0 && (
        <div className="no-cart-item-container">
          <HeartPlusOutlineIcon size={1.3} />
          <p>Add items to your wishlist</p>
        </div>
      )}
      {numberOfItems > 0 && (
        <div className="cart-item-container">
          {wishlistItems?.map((item, index) => (
            <WishlistItem
              key={index}
              productID={item.product.productID}
              productName={item.product.productName}
              productPrice={item.product.price}
              discountedPrice={item.product.discounted_price}
              discountRate={item.product.discount_rate}
              productImage={
                item.product?.["primary_image"]
                  ? `${API_BASE}/${item.product?.["primary_image"]}`
                  : noImage
              }
              handleDelete={() => handleRemoveFromWishlist(item.product.productID)}
            />
          ))}
        </div>
      )}
    </div>
    )


};

export default Wishlist;