import "../../../styles/Discounts.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import { LeftArrowIcon, SearchIcon, CloseIcon } from "../../../assets/icons";
import noImage from "../../../assets/no_image_available.jpg";
import ModalBackdrop from "../../common/ModalBackdrop";

const DiscountCard = ({ promotion }) => {
  const startDate = new Date(promotion.startDate).toISOString().split("T")[0];
  const endDate = new Date(promotion.endDate).toISOString().split("T")[0];
  const isActive = promotion.is_currently_active;
  const imageUrl = promotion.product_image
    ? `${API_BASE}${promotion.product_image}`
    : noImage;

  return (
    <div className="discount-card">
      <div className="discount-card-left">
        <img
          src={imageUrl}
          alt={promotion.product_name}
          className="discount-card-image"
        />
        <div className="discount-card-info">
          <h3 className="discount-card-name">{promotion.product_name}</h3>
          <p className="discount-card-dates">From: {startDate}</p>
          <p className="discount-card-dates">Valid Until: {endDate}</p>
        </div>
        <span
          className={`discount-status-badge ${isActive ? "active" : "inactive"}`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="discount-card-right">
        <span className="discount-card-rate">
          {Math.round(promotion.discountRate)}% OFF
        </span>
        <div className="discount-card-prices">
          <span className="discount-card-discounted">
            {promotion.discounted_price.toFixed(2)}
          </span>
          <span className="discount-card-original">
            {Number(promotion.product_price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProductSelectModal = ({ onClose, onSelect, products, search, setSearch }) => {
  return (
    <div className="discount-modal">
      <div className="discount-modal-header">
        <h2>Create Discount for...</h2>
        <button className="discount-modal-close" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <div className="discount-modal-search">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>
      <div className="discount-modal-list">
        {products?.map((product) => {
          const imageUrl =
            product.media && product.media.length > 0
              ? `${API_BASE}${product.media.find((m) => m.isPrimary)?.mediaURL || product.media[0]?.mediaURL}`
              : noImage;
          return (
            <div
              key={product.productID}
              className="discount-modal-product"
              onClick={() => onSelect(product)}
            >
              <div className="discount-modal-product-name">
                {product.productName}{" "}
                <span className="discount-modal-product-id">
                  #{product.productID}
                </span>
              </div>
              <div className="discount-modal-product-info">
                <img src={imageUrl} alt={product.productName} />
                <span>${Number(product.price).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
        {products?.length === 0 && (
          <p className="discount-modal-empty">No products found</p>
        )}
      </div>
    </div>
  );
};

const Discounts = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isVendor } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isVendor) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isVendor, navigate]);

  useEffect(() => {
    async function fetchPromotions() {
      try {
        const data = await vendorAPI.myPromotions();
        setPromotions(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchPromotions();
  }, []);

  useEffect(() => {
    if (showModal) {
      async function fetchProducts() {
        try {
          const data = await vendorAPI.myProducts(search);
          setProducts(data);
        } catch (e) {
          console.error(e);
        }
      }
      fetchProducts();
    }
  }, [showModal, search]);

  const handleSelectProduct = (product) => {
    setShowModal(false);
    setSearch("");
    navigate(`/create-discount/${product.productID}`);
  };

  return (
    <div className="discounts-container">
      {showModal && (
        <ModalBackdrop
          onClose={() => {
            setShowModal(false);
            setSearch("");
          }}
        />
      )}
      {showModal && (
        <ProductSelectModal
          onClose={() => {
            setShowModal(false);
            setSearch("");
          }}
          onSelect={handleSelectProduct}
          products={products}
          search={search}
          setSearch={setSearch}
        />
      )}
      <button
        className="discounts-back-button"
        onClick={() => navigate("/profile")}
      >
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      <div className="discounts-header">
        <div />
        <button
          id="discounts-create-button"
          onClick={() => setShowModal(true)}
        >
          Create Discount
        </button>
      </div>
      <div className="discounts-list">
        {promotions.length === 0 && (
          <p className="discounts-empty">No discounts yet</p>
        )}
        {promotions.map((promo) => (
          <DiscountCard key={promo.promotionID} promotion={promo} />
        ))}
      </div>
    </div>
  );
};

export default Discounts;
