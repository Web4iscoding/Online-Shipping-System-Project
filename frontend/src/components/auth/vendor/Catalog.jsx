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

const CatalogCard = ({
  productName = "Lorem Ipsum Dolor Sit",
  productID = "CD123",
  createdTime = "12/25/2025",
  updatedTime = "01/01/2026",
  isHidden = false,
  src = gucci,
  handleDelete,
  handleEdit,
}) => {
  return (
    <div className={`catalog-card ${isHidden ? "hidden" : ""}`}>
      {isHidden ? (
        <button
          className="catalog-hidden-button"
          onClick={() => handleEdit(productID, { isHidden: false })}
        >
          <EyeOffIcon />
        </button>
      ) : (
        <button
          className="catalog-hidden-button"
          onClick={() => handleEdit(productID, { isHidden: true })}
        >
          <EyeIcon />
        </button>
      )}
      <button
        id="catalog-delete-button"
        onClick={() => handleDelete(productID)}
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
          <p>Created: {createdTime}</p>
          <p>Updated: {updatedTime}</p>
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

  useEffect(() => {
    if (!isAuthenticated || !isVendor) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    async function performFetch() {
      const products = await vendorAPI.myProducts(query);
      setProducts(products);
    }

    performFetch();
  }, [query]);

  const handleDelete = async (productID) => {
    await vendorAPI.DeleteProduct(productID);

    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.productID !== productID),
    );
  };

  const handleEdit = async (productID, fieldsToBeUpdated) => {
    const updatedProduct = await vendorAPI.UpdateProduct(
      productID,
      fieldsToBeUpdated,
    );

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.productID === updatedProduct.productID
          ? updatedProduct
          : product,
      ),
    );
  };

  return (
    <div className="catalog-container">
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
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></input>
        </div>
        <button className="catalog-add">
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
            src={`${API_BASE}${product.media[0]?.mediaURL}`}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
};

export default Catalog;
