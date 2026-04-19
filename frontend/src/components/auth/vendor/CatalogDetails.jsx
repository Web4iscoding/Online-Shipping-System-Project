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
import SortableImageThumbnails from "../../common/SortableImageThumbnails";
import noImage from "../../../assets/no_image_available.jpg";
import { formatDate } from "../../../utils/formatDate";

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
  const [formData, setFormData] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const performFetch = async () => {
      const productData = await VendorAPI.getProduct(id);
      const brandsData = await BrandsAPI.list();
      const categoriesData = await CategoriesAPI.list();

      // Sort brands: "Others" at the end, rest alphabetically
      const sortedBrands = (brandsData.results || brandsData).sort((a, b) => {
        if (a.brandName.toLowerCase() === "others") return 1;
        if (b.brandName.toLowerCase() === "others") return -1;
        return a.brandName.localeCompare(b.brandName);
      });

      // Sort categories: "Others" at the end, rest alphabetically
      const sortedCategories = (categoriesData.results || categoriesData).sort((a, b) => {
        if (a.categoryName.toLowerCase() === "others") return 1;
        if (b.categoryName.toLowerCase() === "others") return -1;
        return a.categoryName.localeCompare(b.categoryName);
      });

      setBrands(sortedBrands);
      setCategories(sortedCategories);
      setProduct(productData);
      setFormData({
        productName: productData.productName,
        price: productData.price,
        quantity: productData.quantity,
        description: productData.description,
        brand: productData.brand_id,
        category: productData.category_id,
      });
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

  const resetIsEditing = () => ({
    isProductNameEditing: false,
    isPriceEditing: false,
    isQuantityEditing: false,
    isDescriptionEditing: false,
    isBrandEditing: false,
    isCategoryEditing: false,
  });

  const productToFormData = (p) => ({
    productName: p.productName,
    price: p.price,
    quantity: p.quantity,
    description: p.description,
    brand: p.brand_id,
    category: p.category_id,
  });

  const handleEdit = (field) => {
    setIsEditing({ ...resetIsEditing(), [field]: true });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCancel = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: false }));
    setFormData(productToFormData(product));
  };

  const handleSave = async (e, fields) => {
    e.preventDefault();
    try {
      const payload = Object.fromEntries(fields.map((f) => [f, formData[f]]));
      await VendorAPI.UpdateProduct(product.productID, payload);
      const productData = await VendorAPI.getProduct(id);
      setProduct(productData);
      setFormData(productToFormData(productData));
      setIsEditing(resetIsEditing());
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleHeaderEdit = async (fieldsToBeUpdated) => {
    try {
      await VendorAPI.UpdateProduct(product.productID, fieldsToBeUpdated);
      const productData = await VendorAPI.getProduct(id);
      setProduct(productData);
      setFormData(productToFormData(productData));
      setIsEditing(resetIsEditing());
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
              <p>Created: {formatDate(product?.createdTime)}</p>
              <p>Last Updated: {formatDate(product?.updatedTime)}</p>
            </div>
          </div>
          <div className="catalog-details-header-button-group">
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
            {currentImage && product?.media?.length > 0 ? (
              <SortableImageThumbnails
                items={product.media}
                idKey="productMediaID"
                urlKey="mediaURL"
                apiBase={API_BASE}
                currentSelectedId={currentImageID}
                onSelect={(imageUrl, imageId) =>
                  handleImageChange(imageUrl, imageId)
                }
                onDelete={async (mediaId) => {
                  try {
                    await VendorAPI.deleteProductImage(mediaId);
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
                      setCurrentImage(`${API_BASE}${updatedMedia.mediaURL}`);
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
                onReorder={async (reorderedItems) => {
                  try {
                    await Promise.all(
                      reorderedItems.map((media, index) =>
                        VendorAPI.updateProductImage(media.productMediaID, {
                          sortedOrder: index,
                          isPrimary: index === 0,
                        }),
                      ),
                    );
                    const productData = await VendorAPI.getProduct(id);
                    setProduct(productData);
                  } catch (err) {
                    console.error("Reorder failed", err);
                  }
                }}
                onAddImage={async (file) => {
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
                  } catch (err) {
                    console.error("Upload failed", err);
                  }
                }}
                addButtonId="catalog-details-add-image-button"
                addInputId="catalog-details-add-image-input"
                thumbnailsClassName="catalog-details-image-thumbnails"
              />
            ) : (
              <div className="catalog-details-image-thumbnails">
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
                        await VendorAPI.uploadProductImage(
                          product.productID,
                          file,
                          true,
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
            )}
          </div>
          <div className="catalog-details-edit-field-right">
            <div className="catalog-details-edits-input-group">
              <h4>
                Product Name
                {!isEditing.isProductNameEditing && (
                  <button
                    type="button"
                    id="catalog-details-edit-button"
                    onClick={() => handleEdit("isProductNameEditing")}
                  >
                    Edit
                  </button>
                )}
              </h4>
              {!isEditing.isProductNameEditing && <p>{product?.productName}</p>}
              {isEditing.isProductNameEditing && (
                <form onSubmit={(e) => handleSave(e, ["productName"])}>
                  <input
                    type="text"
                    id="productName"
                    value={formData.productName ?? ""}
                    onChange={handleChange}
                    className="catalog-details-edit-input"
                    required
                  />
                  <button type="submit" id="vendor-account-details-save">
                    Save
                  </button>
                  <button
                    type="button"
                    id="vendor-account-details-edit"
                    onClick={() => handleCancel("isProductNameEditing")}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Price
                {!isEditing.isPriceEditing && (
                  <button
                    type="button"
                    id="catalog-details-edit-button"
                    onClick={() => handleEdit("isPriceEditing")}
                  >
                    Edit
                  </button>
                )}
              </h4>
              {!isEditing.isPriceEditing && <p>${product?.price}</p>}
              {isEditing.isPriceEditing && (
                <form onSubmit={(e) => handleSave(e, ["price"])}>
                  <input
                    type="number"
                    id="price"
                    value={formData.price ?? ""}
                    onChange={handleChange}
                    className="catalog-details-edit-input"
                    min={0}
                    step="0.01"
                    required
                  />
                  <button type="submit" id="vendor-account-details-save">
                    Save
                  </button>
                  <button
                    type="button"
                    id="vendor-account-details-edit"
                    onClick={() => handleCancel("isPriceEditing")}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Quantity
                {!isEditing.isQuantityEditing && (
                  <button
                    type="button"
                    id="catalog-details-edit-button"
                    onClick={() => handleEdit("isQuantityEditing")}
                  >
                    Edit
                  </button>
                )}
              </h4>
              {!isEditing.isQuantityEditing && <p>{product?.quantity}</p>}
              {isEditing.isQuantityEditing && (
                <form onSubmit={(e) => handleSave(e, ["quantity"])}>
                  <input
                    type="number"
                    id="quantity"
                    value={formData.quantity ?? ""}
                    onChange={handleChange}
                    className="catalog-details-edit-input"
                    min={0}
                    required
                  />
                  <button type="submit" id="vendor-account-details-save">
                    Save
                  </button>
                  <button
                    type="button"
                    id="vendor-account-details-edit"
                    onClick={() => handleCancel("isQuantityEditing")}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Product Details
                {!isEditing.isDescriptionEditing && (
                  <button
                    type="button"
                    id="catalog-details-edit-button"
                    onClick={() => handleEdit("isDescriptionEditing")}
                  >
                    Edit
                  </button>
                )}
              </h4>
              {!isEditing.isDescriptionEditing && <p>{product?.description}</p>}
              {isEditing.isDescriptionEditing && (
                <form onSubmit={(e) => handleSave(e, ["description"])}>
                  <textarea
                    id="description"
                    value={formData.description ?? ""}
                    onChange={handleChange}
                    rows={5}
                    className="catalog-details-edit-input"
                  />
                  <button type="submit" id="vendor-account-details-save">
                    Save
                  </button>
                  <button
                    type="button"
                    id="vendor-account-details-edit"
                    onClick={() => handleCancel("isDescriptionEditing")}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Brand
                {!isEditing.isBrandEditing && (
                  <button
                    type="button"
                    id="catalog-details-edit-button"
                    onClick={() => handleEdit("isBrandEditing")}
                  >
                    Edit
                  </button>
                )}
              </h4>
              {!isEditing.isBrandEditing && <p>{product?.brand_name}</p>}
              {isEditing.isBrandEditing && (
                <form onSubmit={(e) => handleSave(e, ["brand"])}>
                  <select
                    id="brand"
                    value={formData.brand ?? ""}
                    onChange={handleChange}
                    className="catalog-details-edit-input"
                  >
                    {brands.map((brand, index) => (
                      <option key={index} value={brand.brandID}>
                        {brand.brandName}
                      </option>
                    ))}
                  </select>
                  <button type="submit" id="vendor-account-details-save">
                    Save
                  </button>
                  <button
                    type="button"
                    id="vendor-account-details-edit"
                    onClick={() => handleCancel("isBrandEditing")}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
            <div className="catalog-details-edits-input-group">
              <h4>
                Category
                {!isEditing.isCategoryEditing && (
                  <button
                    type="button"
                    id="catalog-details-edit-button"
                    onClick={() => handleEdit("isCategoryEditing")}
                  >
                    Edit
                  </button>
                )}
              </h4>
              {!isEditing.isCategoryEditing && <p>{product?.category_name}</p>}
              {isEditing.isCategoryEditing && (
                <form onSubmit={(e) => handleSave(e, ["category"])}>
                  <select
                    id="category"
                    value={formData.category ?? ""}
                    onChange={handleChange}
                    className="catalog-details-edit-input"
                  >
                    {categories.map((category, index) => (
                      <option key={index} value={category.categoryID}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <button type="submit" id="vendor-account-details-save">
                    Save
                  </button>
                  <button
                    type="button"
                    id="vendor-account-details-edit"
                    onClick={() => handleCancel("isCategoryEditing")}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogDetails;
