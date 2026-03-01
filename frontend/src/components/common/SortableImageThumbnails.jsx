import { useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { CloseIcon, ImagePlusIcon } from "../../assets/icons";
import "../../styles/SortableImageThumbnails.css";

/**
 * A single sortable thumbnail item.
 * Uses @dnd-kit/react's useSortable hook for drag-and-drop reordering.
 */
const SortableItem = ({
  id,
  index,
  imageSrc,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const { ref, isDragSource } = useSortable({
    id,
    index,
  });

  return (
    <div
      ref={ref}
      className={`sortable-thumbnail-container${isSelected ? " sortable-thumbnail-selected" : ""}${isDragSource ? " sortable-thumbnail-dragging" : ""}`}
      onClick={() => onSelect()}
      data-sortable-id={id}
    >
      <button
        className="sortable-thumbnail-delete-button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <CloseIcon size={0.6} />
      </button>
      <img src={imageSrc} draggable={false} />
    </div>
  );
};

/**
 * Reusable sortable image thumbnails component.
 *
 * Props:
 *  - items: Array of image objects (must have a unique ID field and an image URL field)
 *  - idKey: The key for the unique ID in each item (e.g., 'productMediaID' or 'storePhotoID')
 *  - urlKey: The key for the image URL in each item (e.g., 'mediaURL' or 'photoURL')
 *  - apiBase: The API base URL to prepend to image URLs
 *  - currentSelectedId: The ID of the currently selected/displayed image
 *  - onSelect: Callback when a thumbnail is clicked: (imageUrl, imageId) => void
 *  - onDelete: Callback when delete button is clicked: (imageId) => Promise<void>
 *  - onReorder: Callback when items are reordered: (reorderedItems) => Promise<void>
 *  - onAddImage: Callback when a new image file is selected: (file) => Promise<void>
 *  - addButtonId: CSS id for the add image button
 *  - addInputId: CSS id for the add image file input
 *  - thumbnailsClassName: Additional CSS class for the thumbnails container
 */
const SortableImageThumbnails = ({
  items = [],
  idKey,
  urlKey,
  apiBase,
  currentSelectedId,
  onSelect,
  onDelete,
  onReorder,
  onAddImage,
  addButtonId,
  addInputId,
  thumbnailsClassName = "",
}) => {
  const [orderedItems, setOrderedItems] = useState(null);

  // Use orderedItems during drag, otherwise use items from props
  const displayItems = orderedItems || items;

  const handleDragOver = (event) => {
    const { source, target } = event.operation;
    if (!source || !target) return;

    const sourceId = source.id;
    const targetId = target.id;

    if (sourceId === targetId) return;

    setOrderedItems((prev) => {
      const currentItems = prev || [...items];
      const sourceIndex = currentItems.findIndex(
        (item) => String(item[idKey]) === String(sourceId),
      );
      const targetIndex = currentItems.findIndex(
        (item) => String(item[idKey]) === String(targetId),
      );

      if (sourceIndex === -1 || targetIndex === -1) return currentItems;

      const newItems = [...currentItems];
      const [moved] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, moved);
      return newItems;
    });
  };

  const handleDragEnd = async () => {
    if (orderedItems) {
      await onReorder(orderedItems);
      setOrderedItems(null);
    }
  };

  return (
    <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className={`sortable-image-thumbnails ${thumbnailsClassName}`}>
        {displayItems.map((item, index) => (
          <SortableItem
            key={item[idKey]}
            id={String(item[idKey])}
            index={index}
            imageSrc={`${apiBase}${item[urlKey]}`}
            isSelected={item[idKey] === currentSelectedId}
            onSelect={() => onSelect(`${apiBase}${item[urlKey]}`, item[idKey])}
            onDelete={() => onDelete(item[idKey])}
          />
        ))}
        <div className="sortable-thumbnail-add-container">
          <label htmlFor={addInputId} id={addButtonId}>
            <ImagePlusIcon />
          </label>
          <input
            type="file"
            id={addInputId}
            accept="image/*"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              await onAddImage(file);
              e.target.value = null;
            }}
          />
        </div>
      </div>
    </DragDropProvider>
  );
};

export default SortableImageThumbnails;
