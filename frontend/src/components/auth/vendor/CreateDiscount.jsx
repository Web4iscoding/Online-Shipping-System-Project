import "../../../styles/Discounts.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import { LeftArrowIcon } from "../../../assets/icons";
import noImage from "../../../assets/no_image_available.jpg";

const CreateDiscount = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isVendor } = useAuth();
  const [product, setProduct] = useState(null);
  const [discountRate, setDiscountRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !isVendor) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isVendor, navigate]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await vendorAPI.getProduct(productId);
        setProduct(data);
      } catch (e) {
        console.error(e);
        navigate("/discounts");
      }
    }
    fetchProduct();
  }, [productId, navigate]);

  const getImageUrl = () => {
    if (!product) return noImage;
    const primaryMedia = product.media?.find((m) => m.isPrimary);
    const firstMedia = product.media?.[0];
    const media = primaryMedia || firstMedia;
    return media?.mediaURL ? `${API_BASE}${media.mediaURL}` : noImage;
  };

  const handleSubmit = async () => {
    setError("");
    if (!discountRate || !startDate || !endDate) {
      setError("All fields are required");
      return;
    }
    const rate = parseFloat(discountRate);
    if (isNaN(rate) || rate <= 0 || rate > 100) {
      setError("Discount rate must be between 1 and 100");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      return;
    }
    try {
      await vendorAPI.createPromotion(
        product.productID,
        rate,
        startDate,
        endDate,
      );
      navigate("/discounts");
    } catch (e) {
      setError(e.message || "Failed to create discount");
    }
  };

  if (!product) return null;

  return (
    <div className="discounts-container">
      <button
        className="discounts-back-button"
        onClick={() => navigate("/discounts")}
      >
        <LeftArrowIcon />
        <p>Discounts</p>
      </button>

      <h2 className="create-discount-title">
        Create Discount for {product.productName}
      </h2>

      <div className="create-discount-product-card">
        <img src={getImageUrl()} alt={product.productName} />
        <div className="create-discount-product-info">
          <h3>{product.productName}</h3>
          <p>${Number(product.price).toFixed(2)}</p>
        </div>
      </div>

      {error && <p className="create-discount-error">{error}</p>}

      <div className="create-discount-form">
        <div className="create-discount-field">
          <label>Discount Rate</label>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="10%"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
          />
        </div>
        <div className="create-discount-field">
          <label>From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="create-discount-field">
          <label>To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="create-discount-actions">
        <button
          id="create-discount-cancel"
          onClick={() => navigate("/discounts")}
        >
          Cancel
        </button>
        <button id="create-discount-submit" onClick={handleSubmit}>
          Create Discount
        </button>
      </div>
    </div>
  );
};

export default CreateDiscount;
