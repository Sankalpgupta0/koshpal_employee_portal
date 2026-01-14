import type { EventPayload } from './types';

class GoogleAnalyticsService {
  private initialized = false;

  /**
   * Initialize Google Analytics (GA4)
   */
  init(measurementId: string): void {
    if (this.initialized) {
      console.warn('[GA4] Already initialized');
      return;
    }

    if (!measurementId) {
      console.warn('[GA4] Missing measurement ID, skipping initialization');
      return;
    }

    // Disable in development
    if (import.meta.env.DEV) {
      console.log('[GA4] Disabled in development mode');
      return;
    }

    try {

      // Load GA4 script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      // Initialize dataLayer and gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false, // We'll manually track page views
      });

      this.initialized = true;
      console.log('[GA4] Initialized successfully');
    } catch (error) {
      console.error('[GA4] Initialization error:', error);
    }
  }

  /**
   * Track page view on route change
   */
  trackPageView(pageName: string, pagePath?: string, customDimensions?: EventPayload): void {
    if (!this.initialized || !window.gtag) return;

    try {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        page_path: pagePath || window.location.pathname,
        ...customDimensions,
      });
    } catch (error) {
      console.error('[GA4] Page view error:', error);
    }
  }

  /**
   * Track custom event (use sparingly to avoid duplication with PostHog)
   */
  trackEvent(eventName: string, parameters?: EventPayload): void {
    if (!this.initialized || !window.gtag) return;

    try {
      window.gtag('event', eventName, parameters);
    } catch (error) {
      console.error('[GA4] Event tracking error:', error);
    }
  }

  /**
   * Set user properties (portal, role, etc.)
   */
  setUserProperties(properties: EventPayload): void {
    if (!this.initialized || !window.gtag) return;

    try {
      window.gtag('set', 'user_properties', properties);
    } catch (error) {
      console.error('[GA4] Set user properties error:', error);
    }
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Export singleton instance
export const gaService = new GoogleAnalyticsService();
