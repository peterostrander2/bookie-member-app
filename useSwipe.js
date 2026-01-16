/**
 * USE SWIPE HOOK
 *
 * Provides swipe gesture detection for mobile interactions.
 * Use for:
 * - Swipe to expand/collapse cards
 * - Swipe to reveal actions
 * - Swipe between tabs
 */

import { useState, useCallback, useRef } from 'react';

/**
 * Detect swipe gestures on touch devices
 * @param {Object} options Configuration options
 * @param {Function} options.onSwipeLeft - Called when user swipes left
 * @param {Function} options.onSwipeRight - Called when user swipes right
 * @param {Function} options.onSwipeUp - Called when user swipes up
 * @param {Function} options.onSwipeDown - Called when user swipes down
 * @param {number} options.threshold - Minimum distance in px to trigger swipe (default: 50)
 * @param {number} options.velocityThreshold - Minimum velocity to trigger swipe (default: 0.3)
 * @returns {Object} Touch event handlers to spread on an element
 */
export const useSwipe = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3
} = {}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const startTime = useRef(null);

  const onTouchStart = useCallback((e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    startTime.current = Date.now();
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const absX = Math.abs(distanceX);
    const absY = Math.abs(distanceY);
    const duration = Date.now() - startTime.current;
    const velocityX = absX / duration;
    const velocityY = absY / duration;

    // Determine if swipe was primarily horizontal or vertical
    const isHorizontal = absX > absY;

    if (isHorizontal && (absX > threshold || velocityX > velocityThreshold)) {
      if (distanceX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (!isHorizontal && (absY > threshold || velocityY > velocityThreshold)) {
      if (distanceY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

/**
 * Hook for detecting screen size and returning mobile-specific values
 * @returns {Object} Screen information
 */
export const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [isSmallMobile, setIsSmallMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 480 : false
  );

  // Only run effect on client side
  if (typeof window !== 'undefined') {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallMobile(window.innerWidth < 480);
    };

    // Use passive listener for better scroll performance
    window.addEventListener('resize', handleResize, { passive: true });
  }

  return {
    isMobile,
    isSmallMobile,
    isTouchDevice: typeof window !== 'undefined' && (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
  };
};

/**
 * Returns responsive styles based on screen size
 * @param {Object} styles Object with desktop, tablet, and mobile variants
 * @returns {Object} Appropriate style object for current screen size
 */
export const useResponsiveStyle = (styles) => {
  const { isMobile, isSmallMobile } = useMobileDetect();

  if (isSmallMobile && styles.smallMobile) {
    return { ...styles.base, ...styles.smallMobile };
  }
  if (isMobile && styles.mobile) {
    return { ...styles.base, ...styles.mobile };
  }
  return styles.base || styles;
};

export default useSwipe;
