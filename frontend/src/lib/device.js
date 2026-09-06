import { useState, useEffect } from 'react';

/**
 * Returns true if current viewport or user-agent corresponds to a mobile device (smartphone).
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;

  // 1. User Agent test for mobile phones
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // 2. Viewport test (Smartphones in portrait are < 768px)
  const isSmallWidth = window.innerWidth < 768;

  // 3. Mobile UA with landscape view check (height < 600 or width < 1024)
  const isMobileLandscape = isMobileUA && (window.innerWidth < 1024 || window.innerHeight < 600);

  return isSmallWidth || isMobileLandscape;
}

/**
 * React hook that dynamically detects whether current device / screen is mobile.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}
