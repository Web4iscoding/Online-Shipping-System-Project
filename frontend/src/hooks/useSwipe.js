import { useRef, useState } from "react";

/**
 * Custom hook for touch-swipe navigation on image carousels.
 * Returns touch handlers and a pixel drag offset for visual feedback.
 *
 * @param {number} currentIndex  – current slide index
 * @param {function} setIndex    – called with the new index on swipe
 * @param {number} totalSlides   – total number of slides
 * @returns {{ onTouchStart, onTouchMove, onTouchEnd, dragOffset }}
 */
export default function useSwipe(currentIndex, setIndex, totalSlides) {
  const touchStart = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const offset = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);

  /* keep refs in sync so the end handler always reads the latest values */
  const idxRef = useRef(currentIndex);
  const totalRef = useRef(totalSlides);
  idxRef.current = currentIndex;
  totalRef.current = totalSlides;

  const onTouchStart = (e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    dragging.current = true;
    offset.current = 0;
    setDragOffset(0);
  };

  const onTouchMove = (e) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;

    /* first significant movement: if vertical, bail out and let the page scroll */
    if (Math.abs(dy) > Math.abs(dx) && offset.current === 0) {
      dragging.current = false;
      return;
    }

    offset.current = dx;
    setDragOffset(dx);
  };

  const onTouchEnd = () => {
    if (!dragging.current) {
      setDragOffset(0);
      return;
    }
    dragging.current = false;

    const threshold = 50; /* min px to count as a swipe */
    const idx = idxRef.current;
    const total = totalRef.current;

    if (offset.current < -threshold && idx < total - 1) {
      setIndex(idx + 1);
    } else if (offset.current > threshold && idx > 0) {
      setIndex(idx - 1);
    }

    offset.current = 0;
    setDragOffset(0);
  };

  return { onTouchStart, onTouchMove, onTouchEnd, dragOffset };
}
