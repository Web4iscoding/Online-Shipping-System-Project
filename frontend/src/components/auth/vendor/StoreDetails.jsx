import { useEffect, useState } from "react";
import { vendor as vendorAPI, API_BASE } from "../../../api";
import {
  LeftArrowIcon,
  ImageEditIcon,
  ImagePlusIcon,
  CloseIcon,
} from "../../../assets/icons";
import "../../../styles/StoreDetails.css";
import { useNavigate } from "react-router-dom";
import SuccessWindow from "../../windows/SuccessWindow";
import SortableImageThumbnails from "../../common/SortableImageThumbnails";
import noImage from "../../../assets/no_image_available.jpg";

const StoreDetails = () => {
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [showEdit, setShowEdit] = useState([false, false]);
  const [storeError, setStoreError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImageID, setCurrentImageID] = useState(null);
  const [imageTransitioning, setImageTransitioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const performFetch = async () => {
      const storeData = await vendorAPI.myStore();
      console.log(storeData);
      setFormData(storeData);
      setOriginalData(storeData);
      setCurrentImage(
        storeData.photos?.[0]?.photoURL
          ? `${API_BASE}${storeData.photos[0].photoURL}`
          : null,
      );
      setCurrentImageID(storeData.photos?.[0]?.storePhotoID || null);
    };
    performFetch();
  }, []);

  const refetchStore = async () => {
    const storeData = await vendorAPI.myStore();
    setFormData(storeData);
    setOriginalData(storeData);
    return storeData;
  };

  const handleImageChange = (newImageUrl, newImageID) => {
    setImageTransitioning(true);
    setTimeout(() => {
      setCurrentImage(newImageUrl);
      setCurrentImageID(newImageID);
      setImageTransitioning(false);
    }, 250);
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async (index, field) => {
    setStoreError(null);
    try {
      const updated = await vendorAPI.updateStore({ [field]: formData[field] });
      setFormData(updated);
      setOriginalData(updated);
      setShowEdit([false, false]);
      showSuccess(
        index === 0
          ? "Store name updated successfully."
          : "Store description updated successfully.",
      );
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        setStoreError(Object.values(parsed).flat()[0]);
      } catch {
        setStoreError("Failed to save. Please try again.");
      }
    }
  };

  return (
    <div className="store-details-container">
      <button id="orders-revert-button" onClick={() => navigate("/profile")}>
        <LeftArrowIcon />
        <p>Your Account</p>
      </button>
      {successMessage && (
        <SuccessWindow
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <div className="store-details-content">
        <div className="store-details-header">
          <h2>Store Details</h2>
          <p>Manage your store details and preferences.</p>
        </div>

        <div className="store-details-photos-section">
          <h3>Store Photos</h3>
          <div className="store-details-photos">
            <div className="store-details-image-container">
              <img
                src={currentImage ? currentImage : noImage}
                style={{ opacity: imageTransitioning ? 0 : 1 }}
              />
              {currentImage && (
                <label
                  htmlFor="store-details-edit-image-input"
                  id="store-details-edit-image-button"
                >
                  <ImageEditIcon />
                </label>
              )}
              {currentImage && (
                <input
                  type="file"
                  id="store-details-edit-image-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file || !currentImageID) return;
                    try {
                      await vendorAPI.updateStorePhoto(currentImageID, {
                        imageFile: file,
                      });
                      const storeData = await refetchStore();
                      const updated = storeData.photos.find(
                        (p) => p.storePhotoID === currentImageID,
                      );
                      if (updated) {
                        setCurrentImage(`${API_BASE}${updated.photoURL}`);
                      }
                      e.target.value = null;
                    } catch (err) {
                      console.error("Update failed", err);
                    }
                  }}
                />
              )}
            </div>
            <div className="store-details-image-thumbnails">
              {currentImage && formData?.photos?.length > 0 ? (
                <SortableImageThumbnails
                  items={formData.photos}
                  idKey="storePhotoID"
                  urlKey="photoURL"
                  apiBase={API_BASE}
                  currentSelectedId={currentImageID}
                  onSelect={(imageUrl, imageId) =>
                    handleImageChange(imageUrl, imageId)
                  }
                  onDelete={async (photoId) => {
                    try {
                      await vendorAPI.deleteStorePhoto(photoId);
                      const storeData = await refetchStore();
                      if (storeData.photos.length > 0) {
                        await vendorAPI.updateStorePhoto(
                          storeData.photos[0].storePhotoID,
                          { isPrimary: true },
                        );
                        await refetchStore();
                      }
                      const still = storeData.photos.find(
                        (p) => p.storePhotoID === currentImageID,
                      );
                      if (still) {
                        setCurrentImage(`${API_BASE}${still.photoURL}`);
                        setCurrentImageID(still.storePhotoID);
                      } else {
                        setCurrentImage(
                          storeData.photos[0]?.photoURL
                            ? `${API_BASE}${storeData.photos[0].photoURL}`
                            : null,
                        );
                        setCurrentImageID(
                          storeData.photos[0]?.storePhotoID || null,
                        );
                      }
                    } catch (err) {
                      console.error("Delete failed", err);
                    }
                  }}
                  onReorder={async (reorderedItems) => {
                    try {
                      await Promise.all(
                        reorderedItems.map((photo, index) =>
                          vendorAPI.updateStorePhoto(photo.storePhotoID, {
                            sortedOrder: index,
                            isPrimary: index === 0,
                          }),
                        ),
                      );
                      await refetchStore();
                    } catch (err) {
                      console.error("Reorder failed", err);
                    }
                  }}
                  onAddImage={async (file) => {
                    try {
                      const hasImage = currentImage ? false : true;
                      await vendorAPI.uploadStorePhoto(file, hasImage);
                      const storeData = await refetchStore();
                      const newPhoto =
                        storeData.photos[storeData.photos.length - 1];
                      setCurrentImage(`${API_BASE}${newPhoto?.photoURL}`);
                      setCurrentImageID(newPhoto?.storePhotoID || null);
                    } catch (err) {
                      console.error("Upload failed", err);
                    }
                  }}
                  addButtonId="store-details-add-image-button"
                  addInputId="store-details-add-image-input"
                  thumbnailsClassName="store-details-image-thumbnails"
                />
              ) : (
                <div className="store-details-image-thumbnail-container">
                  <label
                    htmlFor="store-details-add-image-input"
                    id="store-details-add-image-button"
                  >
                    <ImagePlusIcon />
                  </label>
                  <input
                    type="file"
                    id="store-details-add-image-input"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        await vendorAPI.uploadStorePhoto(file, true);
                        const storeData = await refetchStore();
                        const newPhoto =
                          storeData.photos[storeData.photos.length - 1];
                        setCurrentImage(`${API_BASE}${newPhoto?.photoURL}`);
                        setCurrentImageID(newPhoto?.storePhotoID || null);
                        e.target.value = null;
                      } catch (err) {
                        console.error("Upload failed", err);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {!showEdit[0] && (
          <div>
            <h3>Store Name</h3>
            <p>{formData?.storeName}</p>
            <button
              id="store-details-edit"
              onClick={() => {
                setStoreError(null);
                setShowEdit([true, false]);
              }}
            >
              Edit
            </button>
          </div>
        )}

        {showEdit[0] && (
          <div>
            <h3>Store Name</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(0, "storeName");
              }}
            >
              <div className="input-field">
                <label htmlFor="storeName">Store Name</label>
                <input
                  id="storeName"
                  type="text"
                  onChange={handleChange}
                  required
                  value={formData?.storeName ?? ""}
                />
              </div>
              {storeError && <p className="error-message">{storeError}</p>}
              <button type="submit" id="store-details-save">
                Save
              </button>
              <button
                type="button"
                id="store-details-edit"
                onClick={() => {
                  setStoreError(null);
                  setFormData(originalData);
                  setShowEdit([false, false]);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {!showEdit[1] && (
          <div>
            <h3>Store Description</h3>
            <p>{formData?.description || "No description provided."}</p>
            <button
              id="store-details-edit"
              onClick={() => {
                setStoreError(null);
                setShowEdit([false, true]);
              }}
            >
              Edit
            </button>
          </div>
        )}

        {showEdit[1] && (
          <div>
            <h3>Store Description</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(1, "description");
              }}
            >
              <div className="input-field">
                <label htmlFor="description">Store Description</label>
                <textarea
                  id="description"
                  onChange={handleChange}
                  value={formData?.description ?? ""}
                />
              </div>
              {storeError && <p className="error-message">{storeError}</p>}
              <button type="submit" id="store-details-save">
                Save
              </button>
              <button
                type="button"
                id="store-details-edit"
                onClick={() => {
                  setStoreError(null);
                  setFormData(originalData);
                  setShowEdit([false, false]);
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;
