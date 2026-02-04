import "../../styles/ProductDetail.css";
import { useState, useEffect, use } from "react";
import { useParams } from "react-router-dom";
import {
  PlusIcon,
  MinusIcon,
  HeartIcon,
  LeftArrowIcon,
  RightArrowIcon,
} from "../../assets/icons";
import gucci from "../../assets/gucci.png";
import { products as productAPI, API_BASE } from "../../api";
import blank_pfp from "../../assets/blank_pfp.png";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [productPictures, setProductPictures] = useState([]);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function performFetch() {
      const product = await productAPI.detail(id);
      setProduct(product);
      setProductPictures(product.media);
    }
    performFetch();
  }, [id]);

  return (
    <div className="product-detail-container">
      <div className="product-detail-image-section">
        <div className="product-detail-image-container">
          <button
            className={`previous-image-button ${productPictures.length === 0 || currentPictureIndex === 0 ? "disabled" : ""}`}
            onClick={() => {
              if (productPictures.length === 0) return;
              setCurrentPictureIndex((prev) => Math.max(prev - 1, 0));
            }}
          >
            <LeftArrowIcon />
          </button>
          <button
            className={`next-image-button ${productPictures.length === 0 || currentPictureIndex === productPictures.length - 1 ? "disabled" : ""}`}
            onClick={() => {
              if (
                productPictures.length === 0 ||
                currentPictureIndex === productPictures.length - 1
              )
                return;
              setCurrentPictureIndex((prev) =>
                Math.min(prev + 1, productPictures.length - 1),
              );
            }}
          >
            <RightArrowIcon />
          </button>
          <div className="product-detail-image-viewport">
            <div
              className="product-detail-image-track"
              style={{
                transform: `translateX(-${currentPictureIndex * 100}%)`,
              }}
            >
              {(product?.media?.length
                ? product.media
                : [{ mediaURL: gucci }]
              ).map((media, index) => (
                <img
                  key={media.mediaID || index}
                  className="product-detail-image"
                  src={media.mediaURL ? `${media.mediaURL}` : gucci}
                  alt={`Product ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="product-detail-image-selection">
          {Array.from({ length: productPictures.length }).map((_, index) => (
            <button
              key={index}
              className={`image-select-button ${index === currentPictureIndex ? "selected" : ""}`}
              onClick={() => setCurrentPictureIndex(index)}
            />
          ))}
          {product?.media?.length === 0 && (
            <button className="image-select-button selected" />
          )}
        </div>
      </div>
      <div className="product-detail-info-section">
        <h1 className="product-detail-title">{product?.productName}</h1>
        <p className="product-detail-price">${product?.price}</p>
        <div className="product-detail-quantity-section">
          <p className="product-detail-quantity-indicator">
            {product.quantity > 10
              ? "In Stock"
              : product.quantity <= 10 && product.quantity > 0
                ? `Only ${product.quantity} left`
                : "Out of Stock"}
          </p>
          <div className="product-detail-quantity-button-group">
            <button
              className={`quantity-decrease-button ${quantity === 1 ? "disabled" : ""}`}
              onClick={() => {
                if (quantity === 1) return;
                setQuantity((prev) => Math.max(prev - 1, 1));
              }}
            >
              <MinusIcon />
            </button>
            <span
              className="product-detail-quantity-value"
              style={product.quantity === 0 ? { opacity: "20%" } : {}}
            >
              {quantity}
            </span>
            <button
              className={`quantity-increase-button ${product.quantity === 0 || quantity === product.quantity ? "disabled" : ""}`}
              onClick={() => {
                if (quantity === product.quantity || product.quantity === 0)
                  return;
                setQuantity((prev) => Math.min(prev + 1, product.quantity));
              }}
            >
              <PlusIcon />
            </button>
          </div>
        </div>
        <div className="product-detail-action-buttons">
          <button
            id="add-to-cart-button"
            className={isVendor ? "disabled" : ""}
            disabled={isVendor}
            onClick={() => {
              if (!isAuthenticated)
                navigate("/login");
            }}
          >
            <p>Add to Cart</p>
          </button>
          <button
            id="add-to-wishlist-button"
            className={isVendor ? "disabled" : ""}
            disabled={isVendor}
            onClick={() => {
              if (!isAuthenticated)
                navigate("/login");
            }}
          >
            <HeartIcon />
            <p>Add to Wishlist</p>
          </button>
        </div>
        <div className="product-detail-description">
          <h2>Product Details</h2>
          <p>{product?.description}</p>
        </div>
        <div className="vendor-information">
          <h2>Vendor Information</h2>
          <div className="vendor-information-container">
            <img
              className="vendor-logo"
              src={
                product?.store?.vendor_profileImage !== ""
                  ? `${API_BASE}/media/${product?.store?.vendor_profileImage}`
                  : blank_pfp
              }
            ></img>
            <div className="vendor-details">
              <h3 className="store-name">{product?.store?.storeName}</h3>
              <p className="store-number-of-products">10 Products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
