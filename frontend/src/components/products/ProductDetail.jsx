import "../../styles/ProductDetail.css";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  PlusIcon,
  MinusIcon,
  HeartIcon,
  LeftArrowIcon,
  RightArrowIcon,
  PackageIcon,
  StarIcon,
  StarOutlineIcon,
  StarHalfFullIcon,
  FileEditIcon,
  PencilBoxOutlineIcon,
  HeartFilledIcon
} from "../../assets/icons";
import noImage from "../../assets/no_image_available.jpg";
import { products as productAPI, cart as cartAPI, reviews as reviewsAPI, wishlist as wishlistAPI, API_BASE } from "../../api";
import blank_pfp from "../../assets/blank_pfp.png";
import { useAuth } from "../../AuthContext";
import ModalBackdrop from "../../components/common/ModalBackdrop";

const ProductDetail = () => {
  const [product, setProduct] = useState({});
  const [productPictures, setProductPictures] = useState([]);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [storeProductCount, setStoreProductCount] = useState(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [unreviewedOrderItems, setUnreviewedOrderItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const { id } = useParams();
  const { isAuthenticated, isVendor, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewsSectionRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [currentReviewMedia, setCurrentReviewMedia] = useState(null);
  const [itemInWishlist, setItemInWishlist] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    async function performFetch() {
      try {
        const product = await productAPI.detail(id);
        if (isCustomer) {
        const wishlist = isAuthenticated ? await wishlistAPI.list() : [];
        setWishlist(wishlist);
        setItemInWishlist(wishlist.some((item) => item.product.productID === product.productID));}
        console.log(wishlist);
        if (!product || !product.productID) {
          navigate("/");
          return;
        }
        setProduct(product);
        setHasPurchased(product.has_purchased ?? false);
        setUnreviewedOrderItems(product.unreviewed_order_items ?? []);
        console.log(product);
        setProductPictures(product.media);
        if (product?.store?.storeID) {
          const storeProducts = await productAPI.byStore(product.store.storeID);
          setStoreProductCount(storeProducts.count ?? null);
        }

        // Fetch reviews for this product
        try {
          const reviewsData = await reviewsAPI.byProduct(id);
          setReviews(reviewsData);
          console.log(reviewsData);
        } catch {
          setReviews([]);
        }

        // Scroll to reviews if coming from WriteReview or AllReviews
        if (location.state?.scrollToReviews) {
          setTimeout(() => {
            const el = reviewsSectionRef.current;
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }, 100);
          window.history.replaceState({}, "");
        }
      } catch {
        navigate("/");
      }
    }
    performFetch();
  }, [id]);

  const handleAddToCart = async () => {
    await cartAPI.addItem(product.productID, quantity);
    navigate("/cart");
  };

  const handleAddToWishlist = async () => {
    await wishlistAPI.add(product.productID);
    const wishlist = await wishlistAPI.list();
    setItemInWishlist(wishlist.some((item) => item.product.productID === product.productID));
  }

    const handleRemoveFromWishlist = async () => {
    await wishlistAPI.removeItem(product.productID);
    const wishlist = await wishlistAPI.list();
    setItemInWishlist(wishlist.some((item) => item.product.productID === product.productID));
  }

  return (
    <div className="product-detail-container">
      <ModalBackdrop onClose={() => setShowModal(false)} visible={showModal} />
      <div className={`review-media-modal${showModal ? " visible" : ""}`}>
        <img
          src={currentReviewMedia}
          alt="Review Media"
          className="review-media-modal-image"
        />
      </div>
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
                : [{ mediaURL: noImage }]
              ).map((media, index) => (
                <img
                  key={media.mediaID || index}
                  className="product-detail-image"
                  src={media.mediaURL ? `${media.mediaURL}` : noImage}
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
        {product?.discount_rate > 0 ? (
          <div className="product-detail-price-group">
            <p className="product-detail-price">${Number(product.discounted_price).toFixed(2)}</p>
            <p className="product-detail-price-original">${Number(product.price).toFixed(2)}</p>
            <span className="product-detail-discount-badge">{Math.round(product.discount_rate)}% OFF</span>
          </div>
        ) : (
          <p className="product-detail-price">${product?.price}</p>
        )}
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
            className={isVendor || product.quantity === 0 ? "disabled" : ""}
            disabled={isVendor || product.quantity === 0}
            onClick={() => {
              if (!isAuthenticated) navigate("/login");
              else if (isCustomer) {
                handleAddToCart();
              }
            }}
          >
            <p>Add to Cart</p>
          </button>
          {!itemInWishlist && <button
            id="add-to-wishlist-button"
            className={isVendor ? "disabled" : ""}
            disabled={isVendor}
            onClick={() => {
              if (!isAuthenticated) navigate("/login");
              else if (isCustomer) {
                handleAddToWishlist();
              }
            }}
          >
            <HeartIcon />
            <p>Add to Wishlist</p>
          </button>}

          {itemInWishlist && <button
            id="in-wishlist-button"
            className={isVendor ? "disabled" : ""}
            disabled={isVendor}
            onClick={() => {
              if (!isAuthenticated) navigate("/login");
              else if (isCustomer) {
                handleRemoveFromWishlist();
              }
            }}
          >
            <HeartFilledIcon />
            <p>Item in Wishlist</p>
          </button>}

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
              onClick={() => {
                navigate(`/store/${product?.store?.storeID}`);
              }}
            ></img>
            <div className="vendor-details">
              <h3
                className="store-name"
                onClick={() => {
                  navigate(`/store/${product?.store?.storeID}`);
                }}
              >
                {product?.store?.storeName}
              </h3>
              <p className="store-number-of-products">
                <PackageIcon />
                {storeProductCount !== null
                  ? `${storeProductCount} ${storeProductCount === 1 ? "Product" : "Products"}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="product-reviews-section" ref={reviewsSectionRef}>
        <div className="reviews-section-header">
          <div className="reviews-section-header-left">
            <h2>Customer Reviews</h2>
            {reviews.length > 0 && (() => {
              const avg = reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / reviews.length;
              const rounded = Math.round(avg * 2) / 2;
              return (
                <div className="reviews-average">
                  <span className="reviews-average-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="reviews-avg-star">
                        {rounded >= s ? <StarIcon size={0.9} /> : rounded >= s - 0.5 ? <StarHalfFullIcon size={0.9} /> : <StarOutlineIcon size={0.9} />}
                      </span>
                    ))}
                  </span>
                  <span className="reviews-average-text">{avg.toFixed(1)} out of 5.0</span>
                  <span className="reviews-average-count">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                </div>
              );
            })()}
          </div>
          {hasPurchased && unreviewedOrderItems.length > 0 && (
            <button
              className="write-review-button"
              onClick={() => navigate(`/review/${id}/${unreviewedOrderItems[0]}`)}
            >
              <PencilBoxOutlineIcon size={0.8} />
              Write a Review
            </button>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet for this product.</p>
        ) : (
          <div className="reviews-list">
            {(reviews.slice(0, 5)).map((review) => (
              <div key={review.reviewID} className="review-card">
                <div className="review-card-top">
                  <div className="review-card-top-left">
                    <img
                      className="review-avatar"
                      src={
                        review.customer_avatar
                          ? `${API_BASE}${review.customer_avatar}`
                          : blank_pfp
                      }
                      alt="Customer Avatar"
                    />
                    <div className="review-meta">
                      <span className="review-customer-name">{review.customer_username}</span>
                      <span className="review-stars">
                        {[1, 2, 3, 4, 5].map((s) => {
                          const r = parseFloat(review.rating);
                          return (
                            <span key={s} className="review-star">
                              {r >= s ? <StarIcon size={0.75} /> : r >= s - 0.5 ? <StarHalfFullIcon size={0.75} /> : <StarOutlineIcon size={0.75} />}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.createdDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
                {review.media && review.media.length > 0 && (
                  <div className="review-media">
                    {review.media.map((m) => (
                      <img
                        key={m.reviewMediaID}
                        src={`${API_BASE}/${m.mediaURL}`}
                        alt="Review"
                        className="review-media-image"
                        onClick={() => {
                          setShowModal(true)
                          setCurrentReviewMedia(`${API_BASE}/${m.mediaURL}`);
                          }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {reviews.length > 5 && (
          <button className="view-all-reviews-button" onClick={() => navigate(`/product/${id}/reviews`)}>
            View All Reviews
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
