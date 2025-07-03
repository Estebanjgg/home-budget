import { useEffect, useRef, useState } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Distancia mínima para considerar un swipe
  preventDefaultTouchmoveEvent?: boolean;
  element?: HTMLDivElement | null; // Elemento opcional para aplicar los gestos
}

interface TouchPosition {
  x: number;
  y: number;
}

export const useSwipeGestures = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    element
  } = options;

  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return;
    
    setTouchEnd({
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    });
  };

  useEffect(() => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // Determinar si el swipe es más horizontal o vertical
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, minSwipeDistance]);

  useEffect(() => {
    const targetElement = element || elementRef.current;
    if (!targetElement) return;

    targetElement.addEventListener('touchstart', onTouchStart, { passive: true });
    targetElement.addEventListener('touchmove', onTouchMove, { passive: !preventDefaultTouchmoveEvent });
    targetElement.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      targetElement.removeEventListener('touchstart', onTouchStart);
      targetElement.removeEventListener('touchmove', onTouchMove);
      targetElement.removeEventListener('touchend', onTouchEnd);
    };
  }, [preventDefaultTouchmoveEvent, element]);

  return elementRef;
};

// Hook adicional para gestos de pellizco (pinch) para zoom
export const usePinchGesture = (onPinch?: (scale: number) => void) => {
  const elementRef = useRef<HTMLElement>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && initialDistance && onPinch) {
      e.preventDefault();
      const distance = getDistance(e.touches[0], e.touches[1]);
      const scale = distance / initialDistance;
      onPinch(scale);
    }
  };

  const onTouchEnd = () => {
    setInitialDistance(null);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [initialDistance, onPinch]);

  return elementRef;
};

// Hook para detectar tap largo (long press)
export const useLongPress = (
  onLongPress: () => void,
  delay: number = 500
) => {
  const elementRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const start = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
    }, delay);
  };

  const clear = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', clear, { passive: true });
    element.addEventListener('touchcancel', clear, { passive: true });
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', clear);
    element.addEventListener('mouseleave', clear);

    return () => {
      element.removeEventListener('touchstart', start);
      element.removeEventListener('touchend', clear);
      element.removeEventListener('touchcancel', clear);
      element.removeEventListener('mousedown', start);
      element.removeEventListener('mouseup', clear);
      element.removeEventListener('mouseleave', clear);
      clear();
    };
  }, [delay, onLongPress]);

  return { elementRef, isPressed };
};