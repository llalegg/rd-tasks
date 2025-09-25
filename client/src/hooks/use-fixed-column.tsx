import { useEffect, useRef, useState } from 'react';

interface UseFixedColumnOptions {
  columnWidth: number;
  enabled?: boolean;
}

export function useFixedColumn({ columnWidth, enabled = true }: UseFixedColumnOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enabled || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    
    const handleScroll = () => {
      const newScrollLeft = container.scrollLeft;
      setScrollLeft(newScrollLeft);
      const scrolled = newScrollLeft > 0;
      setIsScrolled(scrolled);
      
      // Debug logging
      console.log('Scroll detected:', {
        scrollLeft: newScrollLeft,
        isScrolled: scrolled,
        containerWidth: container.clientWidth,
        scrollWidth: container.scrollWidth
      });
    };

    const handleResize = () => {
      // Recalculate on resize
      handleScroll();
    };

    // Add event listeners
    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled]);

  const getFixedColumnStyle = (backgroundColor: string) => ({
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: `${columnWidth}px`,
    height: '100%',
    backgroundColor,
    zIndex: 30,
    boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
    borderRight: '1px solid #292928',
    display: 'block', // Always show for now to test positioning
  });

  const getScrollableContentStyle = () => ({
    marginLeft: `${columnWidth}px`, // Always apply margin for testing
    transition: 'margin-left 0.1s ease-out',
  });

  const getOriginalColumnStyle = () => ({
    display: 'none', // Always hide original for testing
  });

  return {
    scrollContainerRef,
    scrollLeft,
    isScrolled,
    getFixedColumnStyle,
    getScrollableContentStyle,
    getOriginalColumnStyle,
  };
}
