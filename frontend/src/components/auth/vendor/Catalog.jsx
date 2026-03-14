import { useEffect, useState } from "react";
import { useAuth } from "../../../AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LeftArrowIcon,
  EyeIcon,
  EyeOffIcon,
  SearchIcon,
  PlusIcon,
} from "../../../assets/icons";
import "../../../styles/Catalog.css";
import gucci from "../../../assets/gucci.png";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import { formatDate } from "../../../utils/formatDate";
import CatalogCreateModal from "../../modals/CatalogCreateModal";
import ModalBackdrop from "../../common/ModalBackdrop";
import noImage from "../../../assets/no_image_available.jpg";

const CatalogCard = ({
  productName = "Lorem Ipsum Dolor Sit",
  productID = "CD123",
  createdTime = "12/25/2025",
  updatedTime = "01/01/2026",
  isHidden = false,
  src = gucci,
  handleClickCatalogCard,
  handleEdit,
}) => {
  return (
    <div
      className={`catalog-card ${isHidden ? "hidden" : ""}`}
      onClick={() => {
        handleClickCatalogCard(productID);
      }}
    >
      {isHidden ? (
        <button
          className="catalog-hidden-button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(productID, { isHidden: false });
          }}
        >
          <EyeOffIcon />
        </button>
      ) : (
        <button
          className="catalog-hidden-button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(productID, { isHidden: true });
          }}
        >
          <EyeIcon />
        </button>
      )}
      <button
        id="catalog-delete-button"
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(productID, { availability: false });
        }}
      >
        Delete product
      </button>
      <div className="catalog-card-title">
        <h2>
          {productName} <span>#{productID}</span>
        </h2>
      </div>
      <div className="catalog-card-content">
        <img src={src}></img>
        <div>
          <p>Created: {formatDate(createdTime)}</p>
          <p>Last Updated: {formatDate(updatedTime)}</p>
        </div>
      </div>
    </div>
  );
};

const Catalog = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isVendor } = useAuth();
  const [products, setProducts] = useState();
  const [query, setQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isVendor) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    async function performFetch() {
      const products = await vendorAPI.myProducts(query);

      // Client-side filter for byID:{id} syntax
      const byIdMatch = query.trim().match(/^byID:(\d+)$/i);
      if (byIdMatch) {
        const targetId = Number(byIdMatch[1]);
        const allProducts = await vendorAPI.myProducts("");
        setProducts(allProducts.filter((p) => p.productID === targetId));
      } else {
        setProducts(products);
      }
    }

    performFetch();
  }, [query]);

  const handleEdit = async (productID, fieldsToBeUpdated) => {
    await vendorAPI.UpdateProduct(productID, fieldsToBeUpdated);

    const products = await vendorAPI.myProducts(query);
    setProducts(products);
  };

  const handleClickCatalogCard = (productID) => {
    navigate(`/catalog-details/${productID}`);
  };

  const submitRerender = () => {
    async function performFetch() {
      const products = await vendorAPI.myProducts(query);
      setProducts(products);
    }

    performFetch();
  };

  return (
    <div className="catalog-container">
      {showCreateModal && (
        <CatalogCreateModal
          onClose={() => setShowCreateModal(false)}
          submitRerender={submitRerender}
        />
      )}
      {showCreateModal && (
        <ModalBackdrop onClose={() => setShowCreateModal(false)} />
      )}
      <button id="catalog-revert-button" onClick={() => navigate("/profile")}>
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      <div className="catalog-utility-bar">
        <div className="catalog-search-wrapper">
          <SearchIcon
            style={{
              position: "absolute",
              top: "50%",
              left: "16px",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
            className="catalog-search-icon"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></input>
        </div>
        <button
          className="catalog-add"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusIcon />
        </button>
      </div>
      <div className="catalog-card-container">
        {products?.map((product, index) => (
          <CatalogCard
            key={index}
            productName={product.productName}
            productID={product.productID}
            createdTime={product.createdTime}
            updatedTime={product.updatedTime}
            isHidden={product.isHidden}
            src={
              product.media[0]?.mediaURL
                ? `${API_BASE}${product.media[0]?.mediaURL}`
                : noImage
            }
            handleEdit={handleEdit}
            handleClickCatalogCard={handleClickCatalogCard}
          />
        ))}
      </div>
    </div>
  );
};

export default Catalog;
