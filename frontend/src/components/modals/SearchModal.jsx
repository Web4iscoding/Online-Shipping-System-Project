import "../../styles/SearchModal.css";
import { SearchIcon } from "../../assets/icons";
import { useNavigate } from "react-router-dom";
import noImage from "../../assets/no_image_available.jpg";
import { products as productsAPI, API_BASE } from "../../api";
import { useState, useEffect, use } from "react";

const SearchModal = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function performFetch() {
      if (query === null || query.trim() === "") {
        setResults([]);
        return;
      }
      const products = await productsAPI.list(1, query);
      console.log(products);
      setResults(products.results);
    }

    performFetch();
  }, [query]);

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <SearchIcon
          style={{
            position: "absolute",
            top: "50%",
            left: "16px",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
          className="search-icon"
        />
        <input
          autoFocus
          type="text"
          placeholder="Search products..."
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query?.trim()) {
              navigate(
                `/product-list/search?query=${encodeURIComponent(query.trim())}`,
              );
              onClose();
            }
          }}
        ></input>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          <div className="search-results-list-grid">
            {results.slice(0, 3).map((result, idx) => {
              return (
                <div className="product-list-card" key={idx}>
                  <button
                    className="product-list-card-image-container"
                    onClick={() => {
                      navigate(`/product/${result?.productID}`, { state: { source: "search", searchQuery: query } });
                      onClose();
                    }}
                  >
                    <img
                      className="product-list-card-image"
                      src={
                        result["primary_image"]
                          ? `${API_BASE}/${result["primary_image"]}`
                          : noImage
                      }
                    ></img>
                  </button>
                  <p className="product-list-card-title">
                    {result?.productName}
                  </p>
                  {result?.price !== undefined && (
                    <p className="product-list-card-price">
                      ${Number(result?.discounted_price ?? result?.price).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <button
            id="view-all-results-button"
            onClick={() => {
              navigate(
                `/product-list/search?query=${encodeURIComponent(query)}`,
              );
              onClose();
            }}
          >
            View All Results
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchModal;
