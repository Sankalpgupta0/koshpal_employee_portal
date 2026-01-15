import { posthogService } from './posthog';
import { gaService } from './ga';
import { hotjarService } from './hotjar';
import type { AnalyticsUser, EventPayload, PortalType, AnalyticsConfig } from './types';

class AnalyticsService {
  private config: AnalyticsConfig = {
    enabled: false,
    posthog: {},
    ga: {},
    hotjar: {},
  };
  private currentPortal: PortalType | null = null;

  /**
   * Initialize all analytics services
   */
  init(): void {
    // Load configuration from environment variables
    this.config = {
      enabled: true, // Enable for testing (was: !import.meta.env.DEV)
      posthog: {
        key: import.meta.env.VITE_POSTHOG_KEY,
        host: import.meta.env.VITE_POSTHOG_HOST || '/api/_analytics',
      },
      ga: {
        measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
      },
      hotjar: {
        siteId: import.meta.env.VITE_HOTJAR_SITE_ID,
      },
    };

    // Detect portal
    this.currentPortal = this.detectPortal();

    console.log('[Analytics] Initializing with config:', {
      enabled: this.config.enabled,
      portal: this.currentPortal,
      hasPostHog: !!this.config.posthog.key,
      hasGA: !!this.config.ga.measurementId,
      hasHotjar: !!this.config.hotjar.siteId,
    });

    // Initialize services if enabled
    if (this.config.enabled) {
      // PostHog (Primary)
      if (this.config.posthog.key && this.config.posthog.host) {
        posthogService.init(this.config.posthog.key, this.config.posthog.host);
      }

      // Google Analytics
      if (this.config.ga.measurementId) {
        gaService.init(this.config.ga.measurementId);
      }

      // Hotjar
      if (this.config.hotjar.siteId) {
        hotjarService.init(this.config.hotjar.siteId);
      }

      // Track initial portal opened event
      if (this.currentPortal) {
        this.trackFeature('portal_opened', { portal: this.currentPortal });
      }
    } else {
      console.log('[Analytics] Disabled (development mode)');
    }
  }

  /**
   * Detect portal from subdomain or environment
   */
  private detectPortal(): PortalType {
    // Try to detect from subdomain
    const hostname = window.location.hostname;
    
    if (hostname.includes('employee')) return 'employee';
    if (hostname.includes('coach')) return 'coach';
    if (hostname.includes('hr')) return 'hr';
    if (hostname.includes('admin')) return 'admin';

    // Try to detect from environment variable
    const envPortal = import.meta.env.VITE_PORTAL_TYPE;
    if (envPortal) return envPortal as PortalType;

    // Try to detect from path
    const path = window.location.pathname;
    if (path.includes('/employee')) return 'employee';
    if (path.includes('/coach')) return 'coach';
    if (path.includes('/hr')) return 'hr';
    if (path.includes('/admin')) return 'admin';

    // Default fallback based on build
    // This should be set during build time for each portal
    return 'employee'; // Default
  }

  /**
   * Get current portal
   */
  getPortal(): PortalType | null {
    return this.currentPortal;
  }

  /**
   * Identify user after login
   */
  identifyUser(user: Omit<AnalyticsUser, 'portal'>): void {
    if (!this.config.enabled) return;

    const fullUser: AnalyticsUser = {
      ...user,
      portal: this.currentPortal || 'employee',
    };

    // Identify in all services
    posthogService.identify(fullUser);
    
    // Set user properties in GA4
    gaService.setUserProperties({
      user_role: fullUser.role,
      portal: fullUser.portal,
      company_id: fullUser.company_id,
    });

    // Identify in Hotjar (skips admin users)
    hotjarService.identify(fullUser);

    console.log('[Analytics] User identified:', fullUser.user_id);
  }

  /**
   * Track page view on route change
   */
  trackPageView(pageName: string, additionalProps?: EventPayload): void {
    if (!this.config.enabled) return;

    const properties = {
      portal: this.currentPortal,
      ...additionalProps,
    };

    // Track in PostHog
    posthogService.trackPageView(pageName, properties);

    // Track in GA4
    gaService.trackPageView(pageName, window.location.pathname, properties);

    console.log('[Analytics] Page view tracked:', pageName);
  }

  /**
   * Track feature usage
   */
  trackFeature(eventName: string, payload?: EventPayload): void {
    if (!this.config.enabled) return;

    const properties = {
      portal: this.currentPortal,
      ...payload,
    };

    // Track primarily in PostHog
    posthogService.track(eventName, properties);

    // Optionally track in Hotjar for specific events
    if (eventName === 'feature_used' || eventName === 'portal_opened') {
      hotjarService.trackEvent(eventName);
    }

    console.log('[Analytics] Feature tracked:', eventName);
  }

  /**
   * Reset analytics on logout
   */
  resetAnalytics(): void {
    if (!this.config.enabled) return;

    posthogService.reset();
    console.log('[Analytics] Session reset');
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Export individual services for advanced use cases
export { posthogService, gaService, hotjarService };

// Export types
export type { AnalyticsUser, EventPayload, PortalType };
