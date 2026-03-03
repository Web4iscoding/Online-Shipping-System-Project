import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import "../../styles/ImageCropModal.css";

/**
 * Crop an image and return a Blob.
 */
function getCroppedBlob(imageSrc, crop) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height,
      );
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    };
    image.src = imageSrc;
  });
}

const ImageCropModal = ({ imageSrc, onCancel, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
    onSave(blob);
  };

  return (
    <>
      <div className="image-crop-backdrop" onClick={onCancel} />
      <div className="image-crop-modal">
        <div className="image-crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="image-crop-actions">
          <button id="image-crop-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button id="image-crop-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default ImageCropModal;
