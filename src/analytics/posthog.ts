import posthog from 'posthog-js';
import type { AnalyticsUser, EventPayload } from './types';

class PostHogService {
  private initialized = false;

  /**
   * Initialize PostHog once
   */
  init(apiKey: string, apiHost: string): void {
    if (this.initialized) {
      console.warn('[PostHog] Already initialized');
      return;
    }

    if (!apiKey || !apiHost) {
      console.warn('[PostHog] Missing API key or host, skipping initialization');
      return;
    }

    try {
      posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        session_recording: {
          recordCrossOriginIframes: false,
        },
        // Privacy settings
        mask_all_text: false,
        mask_all_element_attributes: false,
        // Enable in development for testing
      });

      this.initialized = true;
      console.log('[PostHog] Initialized successfully');
    } catch (error) {
      console.error('[PostHog] Initialization error:', error);
    }
  }

  /**
   * Identify user after login
   */
  identify(user: AnalyticsUser): void {
    if (!this.initialized) return;

    try {
      posthog.identify(user.user_id, {
        email: user.email,
        role: user.role,
        portal: user.portal,
        company_id: user.company_id,
        name: user.name,
      });
      console.log('[PostHog] User identified:', user.user_id);
    } catch (error) {
      console.error('[PostHog] Identify error:', error);
    }
  }

  /**
   * Track custom event
   */
  track(eventName: string, properties?: EventPayload): void {
    if (!this.initialized) return;

    try {
      posthog.capture(eventName, properties);
    } catch (error) {
      console.error('[PostHog] Track error:', error);
    }
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string, properties?: EventPayload): void {
    if (!this.initialized) return;

    try {
      posthog.capture('$pageview', {
        page_name: pageName,
        ...properties,
      });
    } catch (error) {
      console.error('[PostHog] Page view error:', error);
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    if (!this.initialized) return;

    try {
      posthog.reset();
      console.log('[PostHog] User session reset');
    } catch (error) {
      console.error('[PostHog] Reset error:', error);
    }
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const posthogService = new PostHogService();
