import type { AnalyticsUser } from './types';

class HotjarService {
  private initialized = false;

  /**
   * Initialize Hotjar
   */
  init(siteId: string): void {
    if (this.initialized) {
      console.warn('[Hotjar] Already initialized');
      return;
    }

    if (!siteId) {
      console.warn('[Hotjar] Missing site ID, skipping initialization');
      return;
    }

    // Disable in development
    if (import.meta.env.DEV) {
      console.log('[Hotjar] Disabled in development mode');
      return;
    }

    try {

      // Hotjar Tracking Code
      (function (h: any, o: any, t: string, j: string, a?: any, r?: any) {
        h.hj =
          h.hj ||
          function () {
            (h.hj.q = h.hj.q || []).push(arguments);
          };
        h._hjSettings = { hjid: parseInt(siteId), hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

      this.initialized = true;
      console.log('[Hotjar] Initialized successfully');
    } catch (error) {
      console.error('[Hotjar] Initialization error:', error);
    }
  }

  /**
   * Identify user (role and portal only, no PII)
   * Disable for admin users
   */
  identify(user: AnalyticsUser): void {
    if (!this.initialized || !window.hj) return;

    // Don't track admin users
    if (user.role === 'admin') {
      console.log('[Hotjar] Skipping admin user tracking');
      return;
    }

    try {
      window.hj('identify', user.user_id, {
        role: user.role,
        portal: user.portal,
        // Do NOT send email or other PII to Hotjar
      });
      console.log('[Hotjar] User identified');
    } catch (error) {
      console.error('[Hotjar] Identify error:', error);
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string): void {
    if (!this.initialized || !window.hj) return;

    try {
      window.hj('event', eventName);
    } catch (error) {
      console.error('[Hotjar] Track event error:', error);
    }
  }

  /**
   * Add tags (attributes) to the session
   */
  tagRecording(tags: string[]): void {
    if (!this.initialized || !window.hj) return;

    try {
      tags.forEach((tag) => window.hj('tagRecording', [tag]));
    } catch (error) {
      console.error('[Hotjar] Tag recording error:', error);
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
    hj: (...args: any[]) => void;
    _hjSettings: { hjid: number; hjsv: number };
  }
}

// Export singleton instance
export const hotjarService = new HotjarService();
