import {
  ImagePlusIcon,
  CloseIcon,
  ImageEditIcon,
  MenuDownIcon,
} from "../../assets/icons";
import "../../styles/CatalogCreateModal.css";
import { useState, useEffect } from "react";
import {
  brands as brandsAPI,
  categories as categoriesAPI,
  vendor as vendorAPI,
} from "../../api";
import { useNavigate } from "react-router-dom";

const CatalogCreateModal = ({ onClose, submitRerender = null }) => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    productPrice: "",
    productQuantity: "",
    productBrand: "",
    productCategory: "",
    productImage: null,
  });

  useEffect(() => {
    const performFetch = async () => {
      const brandsData = await brandsAPI.list();
      const categoriesData = await categoriesAPI.list();

      // Sort brands: "Others" at the end, rest alphabetically
      const sortedBrands = brandsData.results.sort((a, b) => {
        if (a.brandName.toLowerCase() === "others") return 1;
        if (b.brandName.toLowerCase() === "others") return -1;
        return a.brandName.localeCompare(b.brandName);
      });

      // Sort categories: "Others" at the end, rest alphabetically
      const sortedCategories = categoriesData.results.sort((a, b) => {
        if (a.categoryName.toLowerCase() === "others") return 1;
        if (b.categoryName.toLowerCase() === "others") return -1;
        return a.categoryName.localeCompare(b.categoryName);
      });

      setBrands(sortedBrands);
      setCategories(sortedCategories);
      setFormData((prev) => ({
        ...prev,
        productBrand: sortedBrands.length > 0 ? sortedBrands[0].brandID : "",
        productCategory:
          sortedCategories.length > 0 ? sortedCategories[0].categoryID : "",
      }));
    };
    performFetch();
  }, []);

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (
      id === "catalog-create-image-preview-add-image-input" ||
      id === "catalog-create-image-preview-edit-image-input"
    ) {
      setFormData((prev) => ({
        ...prev,
        productImage: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //     if (!formData.productImage) {
    //     alert("Please upload a product image.");
    //     return;
    // }

    const images = formData.productImage ? [formData.productImage] : [];

    const result = await vendorAPI.CreateProduct(
      formData.productName,
      formData.productDescription,
      formData.productPrice,
      formData.productQuantity,
      formData.productBrand,
      formData.productCategory,
      images,
    );

    if (submitRerender) {
      submitRerender();
    }

    onClose();
  };

  return (
    <div className="catalog-create-container">
      <h2>Create New Product</h2>
      <button className="catalog-create-close-button" onClick={onClose}>
        <CloseIcon size={1} />
      </button>
      <form className="catalog-create-form" onSubmit={handleSubmit}>
        <div className="catalog-create-input-field">
          <div className="catalog-create-left-input-field">
            <div className="catalog-create-form-group">
              <label htmlFor="productName">Product Name</label>
              <input
                type="text"
                id="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="catalog-create-form-group">
              <label htmlFor="productDescription">Product Details</label>
              <textarea
                id="productDescription"
                rows="4"
                value={formData.productDescription}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <div className="catalog-create-form-separate-group">
              <div className="catalog-create-form-group">
                <label htmlFor="productPrice">Price</label>
                <input
                  type="number"
                  id="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step={0.01}
                />{" "}
              </div>
              <div className="catalog-create-form-group">
                <label htmlFor="productQuantity">Quantity</label>
                <input
                  type="number"
                  id="productQuantity"
                  value={formData.productQuantity}
                  onChange={handleChange}
                  required
                  min="0"
                />{" "}
              </div>
            </div>
            <div className="catalog-create-form-separate-group">
              <div className="catalog-create-form-group">
                <label htmlFor="productBrand">Brand</label>
                <select
                  id="productBrand"
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                  defaultValue={brands.length > 0 ? brands[0].brandID : ""}
                >
                  {brands.map((brand, index) => (
                    <option key={index} value={brand.brandID}>
                      {brand.brandName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="catalog-create-form-group">
                <label htmlFor="productCategory">Category</label>
                <select
                  id="productCategory"
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                  defaultValue={
                    categories.length > 0 ? categories[0].categoryID : ""
                  }
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category.categoryID}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {!formData.productImage && (
            <div className="catalog-create-image-upload">
              <label
                htmlFor="catalog-create-image-preview-add-image-input"
                className="image-upload-label"
              >
                <ImagePlusIcon size={3} />
              </label>
              <input
                type="file"
                id="catalog-create-image-preview-add-image-input"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChange}
                name="file"
              />
            </div>
          )}
          {formData.productImage && (
            <div className="catalog-create-image-preview">
              <img
                src={URL.createObjectURL(formData.productImage)}
                alt="Preview"
              ></img>
              <label
                htmlFor="catalog-create-image-preview-edit-image-input"
                id="catalog-create-image-preview-edit-image-button"
              >
                <ImageEditIcon />
              </label>
              <input
                type="file"
                id="catalog-create-image-preview-edit-image-input"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleChange}
                multiple={true}
              />
            </div>
          )}
        </div>
        <div className="catalog-create-form-button-group">
          <button
            type="button"
            id="catalog-create-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" id="catalog-create-submit-button">
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default CatalogCreateModal;
