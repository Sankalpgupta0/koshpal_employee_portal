import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../analytics';

/**
 * Hook to track page views on route changes
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Extract page name from pathname
    const pageName = location.pathname.split('/').filter(Boolean).join('/') || 'home';
    
    // Track page view
    analytics.trackPageView(pageName, {
      path: location.pathname,
      search: location.search,
    });
  }, [location]);
}
