import "../../../styles/CatalogDetails.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../AuthContext";
import {
  vendor as VendorAPI,
  API_BASE,
  brands as BrandsAPI,
  categories as CategoriesAPI,
} from "../../../api";
import gucci from "../../../assets/gucci.png";
import { useNavigate } from "react-router-dom";
import {
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  ImageEditIcon,
  ImagePlusIcon,
  TrashCanIcon,
  ContentSaveEditIcon,
  LeftArrowIcon,
  FileEditIcon,
} from "../../../assets/icons";
import SuccessWindow from "../../windows/SuccessWindow";
import noImage from "../../../assets/no_image_available.jpg";

const CatalogDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState({
    isProductNameEditing: false,
    isPriceEditing: false,
    isQuantityEditing: false,
    isDescriptionEditing: false,
    isBrandEditing: false,
    isCategoryEditing: false,
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageID, setCurrentImageID] = useState(null);
  const [imageTransitioning, setImageTransitioning] = useState(false);
  const [editData, setEditData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const performFetch = async () => {
      const productData = await VendorAPI.getProduct(id);
      const brandsData = await BrandsAPI.list();
      const categoriesData = await CategoriesAPI.list();

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
      setProduct(productData);
      setCurrentImage(
        productData.media[0]?.mediaURL
          ? `${API_BASE}${productData.media[0]?.mediaURL}`
          : null,
      );
      setCurrentImageID(productData.media[0]?.productMediaID || null);
      console.log(productData);
    };
    performFetch();
  }, []);

  const handleImageChange = (newImageUrl, newImageID) => {
    setImageTransitioning(true);
    setTimeout(() => {
      setCurrentImage(newImageUrl);
      setCurrentImageID(newImageID);
      setImageTransitioning(false);
    }, 250);
  };

  const handleEdit = (field) => {
    setIsEditing({
      isProductNameEditing: false,
      isPriceEditing: false,
      isQuantityEditing: false,
      isDescriptionEditing: false,
      isBrandEditing: false,
      isCategoryEditing: false,
      [field]: !isEditing[field],
    });
    setEditData({});
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const isAnyFieldEditing = () => {
    return Object.values(isEditing).some((value) => value === true);
  };

  const handleSave = async () => {
    try {
      await VendorAPI.UpdateProduct(product.productID, editData);
      const productData = await VendorAPI.getProduct(id);
      setProduct(productData);
      setEditData({});
      setIsEditing({
        isProductNameEditing: false,
        isPriceEditing: false,
        isQuantityEditing: false,
        isDescriptionEditing: false,
        isBrandEditing: false,
        isCategoryEditing: false,
      });
      setShowSuccess(true);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleHeaderEdit = async (fieldsToBeUpdated) => {
    try {
      await VendorAPI.UpdateProduct(product.productID, fieldsToBeUpdated);
      const productData = await VendorAPI.getProduct(id);
      setProduct(productData);
      setEditData({});
      setIsEditing({
        isProductNameEditing: false,
        isPriceEditing: false,
        isQuantityEditing: false,
        isDescriptionEditing: false,
        isBrandEditing: false,
        isCategoryEditing: false,
      });
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="catalog-details-container">
      <button
        id="catalog-details-revert-button"
        onClick={() => navigate("/catalog")}
      >
        <LeftArrowIcon />
        <p>Your Catalog</p>
      </button>
      <div className="catalog-details-content">
        <div className="catalog-details-header">
          <div className="catalog-details-title">
            <h2 className="catalog-details-product-id">
              Product ID: #{product?.productID}
            </h2>
            <div className="catalog-details-product-dates">
              <p>Created: {product?.createdTime}</p>
              <p>Last Updated: {product?.updatedTime}</p>
            </div>
          </div>
          <div className="catalog-details-header-button-group">
            {isAnyFieldEditing() && (
              <button id="catalog-details-save-button" onClick={handleSave}>
                <ContentSaveEditIcon />
              </button>
            )}
            <button
              id="catalog-details-hide-button"
              onClick={() => handleHeaderEdit({ isHidden: !product.isHidden })}
            >
              {product?.isHidden ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            <button
              id="catalog-details-delete-button"
              onClick={() => {
                navigate("/catalog");
                handleHeaderEdit({ availability: false });
              }}
            >
              <TrashCanIcon />
            </button>
          </div>
        </div>
        {showSuccess && (
          <SuccessWindow
            style={{ margin: "0 50px" }}
            message="Changes saved successfully."
            onClose={() => setShowSuccess(false)}
          />
        )}
        <div className="catalog-details-edit-field">
          <div className="catalog-details-edit-field-left">
            <div className="catalog-details-image-container">
              <img
                src={currentImage ? currentImage : noImage}
                style={{ opacity: imageTransitioning ? 0 : 1 }}
              />
              {currentImage && (
                <label
                  htmlFor="catalog-details-edit-image-input"
                  id="catalog-details-edit-image-button"
                >
                  <ImageEditIcon />
                </label>
              )}
              {currentImage && (
                <input
                  type="file"
                  id="catalog-details-edit-image-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file || !currentImageID) return;

                    try {
                      await VendorAPI.updateProductImage(currentImageID, {
                        imageFile: file,
                      });

                      const productData = await VendorAPI.getProduct(id);
                      setProduct(productData);

                      const updatedMedia = productData.media.find(
                        (m) => m.productMediaID === currentImageID,
                      );
                      if (updatedMedia) {
                        setCurrentImage(`${API_BASE}${updatedMedia.mediaURL}`);
                      }

                      e.target.value = null;
                    } catch (err) {
                      console.error("Update failed", err);
                    }
                  }}
                />
              )}
            </div>
            <div className="catalog-details-image-thumbnails">
              {currentImage &&
                product?.media?.map((media, index) => (
                  <div
                    key={index}
                    className="catalog-details-image-thumbnail-container"
                    onClick={() => {
                      handleImageChange(
                        `${API_BASE}${media.mediaURL}`,
                        media.productMediaID,
                      );
                    }}
                  >
                    <button
                      id="catalog-details-delete-image-button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await VendorAPI.deleteProductImage(
                            media.productMediaID,
                          );

                          let productData = await VendorAPI.getProduct(id);
                          if (productData.media.length !== 0) {
                            await VendorAPI.updateProductImage(
                              productData.media[0]?.productMediaID,
                              { isPrimary: true },
                            );
                          }
                          productData.media[0] = {
                            ...productData.media[0],
                            isPrimary: true,
                          };
                          setProduct(productData);
                          const updatedMedia = productData.media.find(
                            (m) => m.productMediaID === currentImageID,
                          );
                          if (updatedMedia) {
                            setCurrentImage(
                              `${API_BASE}${updatedMedia.mediaURL}`,
                            );
                            setCurrentImageID(updatedMedia.productMediaID);
                          } else {
                            setCurrentImage(
                              productData.media[0]?.mediaURL
                                ? `${API_BASE}${productData.media[0]?.mediaURL}`
                                : null,
                            );
                            setCurrentImageID(
                              productData.media[0]?.productMediaID || null,
                            );
                          }
                        } catch (err) {
                          console.error("Delete failed", err);
                        }
                      }}
                    >
                      <CloseIcon size={0.6} />
                    </button>
                    <img src={`${API_BASE}${media.mediaURL}`} />
                  </div>
                ))}
              <div className="catalog-details-image-thumbnail-container">
                <label
                  htmlFor="catalog-details-add-image-input"
                  id="catalog-details-add-image-button"
                >
                  <ImagePlusIcon />
                </label>
                <input
                  type="file"
                  id="catalog-details-add-image-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    try {
                      const hasImage = currentImage ? false : true;
                      await VendorAPI.uploadProductImage(
                        product.productID,
                        file,
                        hasImage,
                      );

                      const productData = await VendorAPI.getProduct(id);
                      setProduct(productData);
                      const newMedia =
                        productData.media[productData.media.length - 1];
                      setCurrentImage(`${API_BASE}${newMedia?.mediaURL}`);
                      setCurrentImageID(newMedia?.productMediaID || null);
                      e.target.value = null;
                    } catch (err) {
                      console.error("Upload failed", err);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="catalog-details-edit-field-right">
            <div className="catalog-details-edits-input-group">
              <h4>
                Product Name
                <button
                  id="catalog-details-edit-button"
                  onClick={() => handleEdit("isProductNameEditing")}
                >
                  <FileEditIcon />
                </button>
              </h4>
              {!isEditing.isProductNameEditing && <p>{product?.productName}</p>}
              {isEditing.isProductNameEditing && (
                <input
                  type="text"
                  id="productName"
                  defaultValue={product?.productName}
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                />
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Price
                <button
                  id="catalog-details-edit-button"
                  onClick={() => handleEdit("isPriceEditing")}
                >
                  <FileEditIcon />
                </button>
              </h4>
              {!isEditing.isPriceEditing && <p>${product?.price}</p>}
              {isEditing.isPriceEditing && (
                <input
                  type="number"
                  id="price"
                  defaultValue={product?.price}
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                  min={0}
                />
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Quantity
                <button
                  id="catalog-details-edit-button"
                  onClick={() => handleEdit("isQuantityEditing")}
                >
                  <FileEditIcon />
                </button>
              </h4>
              {!isEditing.isQuantityEditing && <p>{product?.quantity}</p>}
              {isEditing.isQuantityEditing && (
                <input
                  type="number"
                  id="quantity"
                  defaultValue={product?.quantity}
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                  min={0}
                />
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Product Details
                <button
                  id="catalog-details-edit-button"
                  onClick={() => handleEdit("isDescriptionEditing")}
                >
                  <FileEditIcon />
                </button>
              </h4>
              {!isEditing.isDescriptionEditing && <p>{product?.description}</p>}
              {isEditing.isDescriptionEditing && (
                <textarea
                  type="textarea"
                  id="description"
                  defaultValue={product?.description}
                  onChange={handleChange}
                  rows={5}
                  className="catalog-details-edit-input"
                />
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Brand
                <button
                  id="catalog-details-edit-button"
                  onClick={() => handleEdit("isBrandEditing")}
                >
                  <FileEditIcon />
                </button>
              </h4>
              {!isEditing.isBrandEditing && <p>{product?.brand_name}</p>}
              {isEditing.isBrandEditing && (
                <select
                  id="brand"
                  defaultValue={product?.brand_id}
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                >
                  {brands.map((brand, index) => (
                    <option key={index} value={brand.brandID}>
                      {brand.brandName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Category
                <button
                  id="catalog-details-edit-button"
                  onClick={() => handleEdit("isCategoryEditing")}
                >
                  <FileEditIcon />
                </button>
              </h4>
              {!isEditing.isCategoryEditing && <p>{product?.category_name}</p>}
              {isEditing.isCategoryEditing && (
                <select
                  id="category"
                  defaultValue={product?.category_id}
                  onChange={handleChange}
                  className="catalog-details-edit-input"
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category.categoryID}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogDetails;
