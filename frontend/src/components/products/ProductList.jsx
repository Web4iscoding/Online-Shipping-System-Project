import { useParams } from "react-router-dom";
import gucci from "../../assets/gucci.png";
import { useState, useEffect } from "react";
import {
  products as productsAPI,
  brands as brandsAPI,
  categories as categoriesAPI,
  API_BASE,
} from "../../api";
import "../../styles/ProductList.css";
import {
  RightArrowIcon,
  LeftArrowIcon,
  FirstPageArrow,
  LastPageArrow,
  DinoIcon,
} from "../../assets/icons";
import LoadingIndicator from "../common/LoadingIndicator";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  productID = "",
  thumbnailURL,
  productName = "Lorem Ipsum Dolor Sit Amet",
}) => {
  const navigate = useNavigate();

  return (
    <div className="product-list-card">
      <button
        className="product-list-card-image-container"
        onClick={() => navigate(`/product/${productID}`)}
      >
        <img className="product-list-card-image" src={thumbnailURL}></img>
      </button>
      <p className="product-list-card-title">{productName}</p>
    </div>
  );
};

const PlaceholderCard = () => (
  <div className="product-list-card placeholder" aria-hidden="true">
    <div className="product-list-card-image-container">
      <div className="product-list-card-image placeholder-image" />
    </div>
    <p className="product-list-card-title">&nbsp;</p>
  </div>
);

const ProductList = () => {
  const { filter, type, name } = useParams();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterLabel, setFilterLabel] = useState("");
  const pageCount = 8;
  const placeholderCount = Math.max(pageCount - products.length, 0);
  const [isLoading, setIsLoading] = useState(false);

  const parseFilter = () => {
    if (type && name) {
      return {
        type,
        value: decodeURIComponent(name).trim(),
      };
    }

    if (!filter || filter === "all-items") {
      return { type: "all", value: null };
    }

    const [parsedType, ...rest] = filter.split("/");
    const value = decodeURIComponent(rest.join("/")).trim();

    if (!value) {
      return { type: "all", value: null };
    }

    if (parsedType === "brand" || parsedType === "category") {
      return { type: parsedType, value };
    }

    return { type: "all", value: null };
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, type, name]);

  useEffect(() => {
    let isMounted = true;

    async function performFetch() {
      if (isMounted) {
        setIsLoading(true);
      }

      const { type, value } = parseFilter();

      try {
        if (type === "all") {
          const response = await productsAPI.list(currentPage);
          if (!isMounted) return;
          setProducts(response.results);
          setTotalPages(Math.ceil(response.count / pageCount));
          setFilterLabel("All Items");
          return;
        }

        if (type === "brand") {
          const brands = await brandsAPI.list();
          if (!isMounted) return;
          const match = brands.results.find(
            (brand) => brand.brandName?.toLowerCase() === value.toLowerCase(),
          );

          if (!match) {
            setProducts([]);
            setTotalPages(1);
            setFilterLabel(`Brand / ${value}`);
            return;
          }

          const response = await productsAPI.byBrand(
            match.brandID,
            currentPage,
          );
          const results = response.results || response;
          const count = response.count ?? results.length;
          setProducts(results);
          setTotalPages(Math.max(1, Math.ceil(count / pageCount)));
          setFilterLabel(`Brand / ${match.brandName}`);
          return;
        }

        if (type === "category") {
          const categories = await categoriesAPI.list();
          if (!isMounted) return;
          const match = categories.results.find(
            (category) =>
              category.categoryName?.toLowerCase() === value.toLowerCase(),
          );

          if (!match) {
            setProducts([]);
            setTotalPages(1);
            setFilterLabel(`Category / ${value}`);
            return;
          }

          const response = await productsAPI.byCategory(
            match.categoryID,
            currentPage,
          );
          const results = response.results || response;
          const count = response.count ?? results.length;
          setProducts(results);
          setTotalPages(Math.max(1, Math.ceil(count / pageCount)));
          setFilterLabel(`Category / ${match.categoryName}`);
        }
      } catch (error) {
        if (!isMounted) return;
        setProducts([]);
        setTotalPages(1);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    performFetch();
    return () => {
      isMounted = false;
    };
  }, [currentPage, filter, type, name]);

  return (
    <div className="product-list-container">
      <h2>
        {filterLabel.split(" / ").map((part, index) => {
          if (filterLabel.split(" / ").length === 1) return part;
          if (index === 0)
            return (
              <span key={index}>
                <span className="product-list-label-first-part">{part}</span>
                <span> / </span>
              </span>
            );
          return (
            <span className="product-list-label-second-part" key={index}>
              {part}
            </span>
          );
        })}
      </h2>
      <div className="product-list">
        {isLoading ? (
          <>
            <LoadingIndicator />
            {Array.from({ length: pageCount }).map((_, index) => (
              <PlaceholderCard key={`loading-placeholder-${index}`} />
            ))}
          </>
        ) : (
          <>
            {products.length === 0 && (
              <div className="no-products-message">
                <DinoIcon size={5} />
                <p>No products found.</p>
              </div>
            )}
            {products.map((product, index) => (
              <ProductCard
                key={index}
                thumbnailURL={
                  product["primary_image"]
                    ? `${API_BASE}/${product["primary_image"]}`
                    : gucci
                }
                productName={product.productName}
                productID={product.productID}
              />
            ))}
            {Array.from({ length: placeholderCount }).map((_, index) => (
              <PlaceholderCard key={`placeholder-${index}`} />
            ))}
          </>
        )}
      </div>
      <div className="pagination">
        <div className="previous-page-buttons-group">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="first-page-button"
          >
            <FirstPageArrow />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="previous-page-button"
          >
            <LeftArrowIcon />
            <p>Previous</p>
          </button>
        </div>

        <div>
          Page {currentPage} of {totalPages}
        </div>

        <div className="next-page-buttons-group">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="next-page-button"
          >
            <p>Next</p>
            <RightArrowIcon />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="last-page-button"
          >
            <LastPageArrow />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
