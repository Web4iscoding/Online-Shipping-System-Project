import "../../styles/AllReviews.css";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LeftArrowIcon,
  StarIcon,
  StarOutlineIcon,
  StarHalfFullIcon,
} from "../../assets/icons";
import { products as productAPI, reviews as reviewsAPI, API_BASE } from "../../api";
import blank_pfp from "../../assets/blank_pfp.png";
import ModalBackdrop from "../common/ModalBackdrop";

const AllReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentReviewMedia, setCurrentReviewMedia] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const product = await productAPI.detail(id);
        if (!product || !product.productID) {
          navigate("/");
          return;
        }
        setProductName(product.productName);

        const reviewsData = await reviewsAPI.byProduct(id);
        setReviews(reviewsData);
      } catch {
        navigate("/");
      }
    }
    fetchData();
  }, [id]);

  const avg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
        reviews.length
      : 0;
  const rounded = Math.round(avg * 2) / 2;

  return (
    <div className="all-reviews-container">
      <ModalBackdrop onClose={() => setShowModal(false)} visible={showModal} />
      <div
        className={`review-media-modal${showModal ? " visible" : ""}`}
        style={{ zIndex: 1001 }}
      >
        <img
          src={currentReviewMedia}
          alt="Review Media"
          className="review-media-modal-image"
        />
      </div>

      <button className="all-reviews-back" onClick={() => navigate(`/product/${id}`, { state: { scrollToReviews: true } })}>
        <LeftArrowIcon />
        <p>Back</p>
      </button>

      <h1 className="all-reviews-title">All Reviews for {productName}</h1>

      {reviews.length > 0 && (
        <div className="all-reviews-summary">
          <span className="all-reviews-stars">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="all-reviews-star">
                {rounded >= s ? (
                  <StarIcon size={0.9} />
                ) : rounded >= s - 0.5 ? (
                  <StarHalfFullIcon size={0.9} />
                ) : (
                  <StarOutlineIcon size={0.9} />
                )}
              </span>
            ))}
          </span>
          <span className="all-reviews-avg-text">{avg.toFixed(1)} out of 5.0</span>
          <span className="all-reviews-count">
            ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </span>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="all-reviews-no-reviews">No reviews yet for this product.</p>
      ) : (
        <div className="all-reviews-list">
          {reviews.map((review) => (
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
                    <span className="review-customer-name">
                      {review.customer_username}
                    </span>
                    <span className="review-stars">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const r = parseFloat(review.rating);
                        return (
                          <span key={s} className="review-star">
                            {r >= s ? (
                              <StarIcon size={0.75} />
                            ) : r >= s - 0.5 ? (
                              <StarHalfFullIcon size={0.75} />
                            ) : (
                              <StarOutlineIcon size={0.75} />
                            )}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </div>
                <span className="review-date">
                  {new Date(review.createdDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
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
                        setShowModal(true);
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
    </div>
  );
};

export default AllReviews;
