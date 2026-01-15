export type UserRole = 'employee' | 'coach' | 'hr' | 'admin';
export type PortalType = 'employee' | 'coach' | 'hr' | 'admin';

export interface AnalyticsUser {
  user_id: string;
  email: string;
  role: UserRole;
  portal: PortalType;
  company_id?: string;
  name?: string;
}

export interface EventPayload {
  [key: string]: string | number | boolean | undefined | null;
}

export interface AnalyticsConfig {
  enabled: boolean;
  posthog: {
    key?: string;
    host?: string;
  };
  ga: {
    measurementId?: string;
  };
  hotjar: {
    siteId?: string;
  };
}
