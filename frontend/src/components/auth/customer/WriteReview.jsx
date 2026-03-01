import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  products as productsAPI,
  reviews as reviewsAPI,
  API_BASE,
} from "../../../api";
import {
  LeftArrowIcon,
  StarHalfFullIcon,
  StarIcon,
  StarOutlineIcon,
  ImagePlusIcon,
  CloseIcon,
} from "../../../assets/icons";
import noImage from "../../../assets/no_image_available.jpg";
import { useNavigate } from "react-router-dom";
import "../../../styles/WriteReview.css";
import SuccessWindow from "../../windows/SuccessWindow";

const StarRating = ({ rating, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseMove = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    setHoverRating(isLeftHalf ? starIndex - 0.5 : starIndex);
  };

  const displayRating = hoverRating || rating;

  return (
    <div
      className="star-rating"
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const filled = displayRating >= starIndex;
        const halfFilled = !filled && displayRating >= starIndex - 0.5;

        return (
          <span
            key={starIndex}
            className="star-rating-star"
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            onClick={() => onRate(hoverRating || starIndex)}
          >
            {filled ? (
              <StarIcon />
            ) : halfFilled ? (
              <StarHalfFullIcon />
            ) : (
              <StarOutlineIcon />
            )}
          </span>
        );
      })}
    </div>
  );
};

const WriteReview = () => {
  const { productId, orderItemId } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const MAX_IMAGES = 5;

  const handleAddImages = (files) => {
    const fileArray = Array.from(files);
    setImages((prev) => {
      const combined = [...prev, ...fileArray].slice(0, MAX_IMAGES);
      return combined;
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    async function performFetch() {
      const productData = await productsAPI.detail(productId);
      setProduct(productData);
      console.log(productData);
    }
    performFetch();
  }, [productId]);

  return (
    <div className="write-review-container">
      <button id="catalog-revert-button" onClick={() => navigate("/product/" + productId)}>
        <LeftArrowIcon />
        <p>Back</p>
      </button>
      {successMessage && (
        <SuccessWindow
          message={successMessage}
          onClose={() => {
            setSuccessMessage(null);
            navigate("/product/" + productId);
          }}
        />
      )}
      <div className="write-review-header">
        <h2>Write a Review for {product?.productName}</h2>
        <p>Share your thoughts about the product with other customers.</p>
      </div>
      <div className="write-review-product-card">
        <img
          className="write-review-product-image"
          src={
            product?.media[0]?.mediaURL
              ? `${product.media[0].mediaURL}`
              : noImage
          }
        ></img>
        <h3 className="write-review-product-name">{product?.productName}</h3>
      </div>
      <form className="write-review-form" onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        if (rating === 0) {
          setError("Please select a rating.");
          return;
        }
        if (!comment.trim()) {
          setError("Please write a review.");
          return;
        }
        setSubmitting(true);
        try {
          await reviewsAPI.create(orderItemId, comment.trim(), rating, images);
          navigate("/product/" + productId, { state: { scrollToReviews: true } });
        } catch (err) {
          setError(err.message || "Failed to submit review. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}>
        <div className="write-review-field">
          <label>Rating</label>
          <StarRating rating={rating} onRate={setRating} />
        </div>
        <div className="write-review-field">
          <label htmlFor="review-text">Review</label>
          <textarea
            id="review-text"
            placeholder="Tell us what you think about this product."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>
        <div className="write-review-field">
          <label>Attach Photos (Optional)</label>
          {images.length === 0 ? (
            <>
              <label htmlFor="review-images" className="write-review-image-upload">
                <ImagePlusIcon size={3} />
                <p className="write-review-image-upload-title">Click to upload photos</p>
                <p className="write-review-image-upload-subtitle">
                  PNG, JNG, SVG, Webp (Up to 5 photos)
                </p>
              </label>
              <input
                id="review-images"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                style={{ display: "none" }}
                multiple
                onChange={(e) => {
                  handleAddImages(e.target.files);
                  e.target.value = null;
                }}
              />
            </>
          ) : (
            <div className="write-review-image-thumbnails">
              {images.map((file, index) => (
                <div key={index} className="write-review-thumbnail-container">
                  <button
                    type="button"
                    className="write-review-thumbnail-delete"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <CloseIcon size={0.6} />
                  </button>
                  <img src={URL.createObjectURL(file)} alt={`Upload ${index + 1}`} />
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <div className="write-review-thumbnail-add">
                  <label htmlFor="review-images-add">
                    <ImagePlusIcon />
                  </label>
                  <input
                    type="file"
                    id="review-images-add"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    style={{ display: "none" }}
                    multiple
                    onChange={(e) => {
                      handleAddImages(e.target.files);
                      e.target.value = null;
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="write-review-submit-button-container">
          {error && <p className="write-review-error">{error}</p>}
          <button
            id="write-review-cancel-button"
            type="button"
            onClick={() => navigate("/product/" + productId)}
          >
            Cancel
          </button>
          <button
            id="write-review-submit-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteReview;
