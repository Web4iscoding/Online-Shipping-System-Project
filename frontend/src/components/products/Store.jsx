import {
  products as productsAPI,
  stores as storesAPI,
  API_BASE,
} from "../../api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  StarHalfFullIcon,
  StarIcon,
  StarOutlineIcon,
  PackageIcon,
  SearchIcon,
} from "../../assets/icons";
import { useParams } from "react-router-dom";
import noImage from "../../assets/no_image_available.jpg";
import blankPfp from "../../assets/blank_pfp.png";

import "../../styles/Store.css";
import useSwipe from "../../hooks/useSwipe";

//stores.detail, stores.list
//products.byStore(id, page)

const ProductCard = ({
  productID = "",
  thumbnailURL,
  productName = "Lorem Ipsum Dolor Sit Amet",
  productPrice,
  quantity,
}) => {
  const navigate = useNavigate();
  const soldOut = quantity !== undefined && quantity <= 0;

  return (
    <div className="product-list-card">
      <button
        className="product-list-card-image-container"
        onClick={() => navigate(`/product/${productID}`)}
      >
        {soldOut && <span className="sold-out-badge">Sold Out</span>}
        <img className="product-list-card-image" src={thumbnailURL}></img>
      </button>
      <p className="product-list-card-title">{productName}</p>
      {productPrice !== undefined && (
        <p className="product-list-card-price">${Number(productPrice).toFixed(2)}</p>
      )}
    </div>
  );
};

const Store = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState({});
  const [storeProducts, setStoreProducts] = useState([]);
  const [storeTotal, setStoreTotal] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [currentPictureIndex, setCurrentPictureIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [query, setQuery] = useState("");
  const swipe = useSwipe(
    currentPictureIndex,
    (idx) => { setCurrentPictureIndex(idx); setResetKey((k) => k + 1); },
    storeData.photos?.length || 1,
  );

  useEffect(() => {
    async function performFetch() {
      const storeData = await storesAPI.detail(id);
      const storeProductsData = await productsAPI.byStore(id, 1);
      const results = storeProductsData.results ?? storeProductsData;
      setStoreProducts(results);
      setStoreTotal(storeProductsData.count ?? results.length);
      setStoreData(storeData);
    }
    performFetch();
  }, [id]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchTotal(0);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await productsAPI.byStore(id, 1, trimmed);
        const results = data.results ?? data;
        setSearchResults(results);
        setSearchTotal(data.count ?? results.length);
      } catch {
        setSearchResults([]);
        setSearchTotal(0);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, id]);

  useEffect(() => {
    const total = storeData.photos?.length;
    if (!total || total <= 1) return;
    const interval = setInterval(() => {
      setCurrentPictureIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [storeData.photos, resetKey]);

  return (
    <div className="store-container">
      <div className="store-header">
        {storeData.photos?.length > 0 && (
          <div className="store-header-left">
            <div
              className="store-header-image-viewport"
              onTouchStart={swipe.onTouchStart}
              onTouchMove={swipe.onTouchMove}
              onTouchEnd={swipe.onTouchEnd}
            >
              <div
                className="store-header-image-track"
                style={{
                  transform: `translateX(calc(-${currentPictureIndex * 100}% + ${swipe.dragOffset}px))`,
                  transition: swipe.dragOffset ? 'none' : undefined,
                }}
              >
                {(storeData.photos?.length
                  ? storeData.photos
                  : [{ photoURL: noImage }]
                ).map((photo, index) => (
                  <img
                    key={photo.storePhotoID || index}
                    className="store-header-image"
                    src={photo.photoURL || noImage}
                    alt={`${storeData.storeName} ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="product-detail-image-selection">
              {Array.from({ length: storeData?.photos?.length }).map(
                (_, index) => (
                  <button
                    key={index}
                    className={`image-select-button ${index === currentPictureIndex ? "selected" : ""}`}
                    onClick={() => {
                      setCurrentPictureIndex(index);
                      setResetKey((k) => k + 1);
                    }}
                  />
                ),
              )}
              {storeData?.photos?.length === 0 && (
                <button className="image-select-button selected" />
              )}
            </div>
          </div>
        )}
        <div
          className={`store-header-right${storeData.photos?.length > 0 ? "" : " store-header-right--centered"}`}
        >
          <div className="store-profile">
            <img
              className="store-avatar"
              src={
                storeData?.vendor_profileImage
                  ? `${API_BASE}/media/${storeData.vendor_profileImage}`
                  : blankPfp
              }
              alt={storeData?.storeName}
            />
            <div className="store-details">
              <h3 className="store-page-store-name">{storeData?.storeName}</h3>
              <p className="store-page-store-number-of-products">
                <PackageIcon style={{ marginRight: "4px" }} />
                {storeData?.total_products !== null
                  ? `${storeData?.total_products} ${storeData?.total_products === 1 ? "Product" : "Products"}`
                  : "—"}
              </p>
              {storeData?.average_rating !== null && storeData?.average_rating !== undefined && (
                <div className="store-rating">
                  <span className="store-rating-stars">
                    {[1, 2, 3, 4, 5].map((s) => {
                      const r = storeData.average_rating;
                      return (
                        <span key={s} className="store-rating-star">
                          {r >= s ? <StarIcon size={0.85} /> : r >= s - 0.5 ? <StarHalfFullIcon size={0.85} /> : <StarOutlineIcon size={0.85} />}
                        </span>
                      );
                    })}
                  </span>
                  <span className="store-rating-count">
                    ({storeData.total_reviews} {storeData.total_reviews === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="store-description">{storeData?.description}</p>
        </div>
      </div>

      <div className="store-products-section">
        <div className="store-products-header">
            <h2>{query.trim() ? `Results for "${query.trim()}"` : "Newest Items"}</h2>
            <div className="store-search-product-container">
              <SearchIcon size={1} style={{ marginRight: "8px" }} />
              <input
                type="text"
                placeholder="Search in this store..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
        </div>
        <div className="store-product-list">
          {(query.trim() ? searchResults : storeProducts).map((product) => (
            <ProductCard
              key={product.productID}
              productID={product.productID}
              thumbnailURL={
                product.primary_image
                  ? `${API_BASE}/${product.primary_image}`
                  : noImage
              }
              productName={product.productName}
              productPrice={product.discounted_price ?? product.price}
              quantity={product.quantity}
            />
          ))}
        </div>
        {(query.trim() ? searchTotal : storeTotal) > 8 && (
          <button
            id="view-all-results-button"
            onClick={() =>
              query.trim()
                ? navigate(`/product-list/store/${id}?query=${encodeURIComponent(query.trim())}`)
                : navigate(`/product-list/store/${id}`)
            }
          >
            View All Items
          </button>
        )}
      </div>
    </div>
  );
};

export default Store;
