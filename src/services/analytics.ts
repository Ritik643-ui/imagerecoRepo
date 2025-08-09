/**
 * Analytics Service
 * Handles event tracking and user analytics
 */

import { AnalyticsEvent, AnalyticsEvents } from '../types';
import { FEATURE_FLAGS } from '../constants';

/**
 * Analytics provider interface
 */
interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => Promise<void>;
  identify: (userId: string, properties?: Record<string, any>) => Promise<void>;
  flush: () => Promise<void>;
}

/**
 * Console Analytics Provider (for development)
 */
class ConsoleAnalyticsProvider implements AnalyticsProvider {
  async track(event: AnalyticsEvent): Promise<void> {
    if (__DEV__) {
      console.log('📊 Analytics Event:', {
        event: event.event,
        properties: event.properties,
        timestamp: event.timestamp,
        userId: event.userId,
      });
    }
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    if (__DEV__) {
      console.log('👤 Analytics Identify:', { userId, properties });
    }
  }

  async flush(): Promise<void> {
    if (__DEV__) {
      console.log('🔄 Analytics Flush');
    }
  }
}

/**
 * Firebase Analytics Provider (placeholder)
 * TODO: Implement Firebase Analytics integration
 */
class FirebaseAnalyticsProvider implements AnalyticsProvider {
  async track(event: AnalyticsEvent): Promise<void> {
    // TODO: Implement Firebase Analytics logEvent
    console.log('Firebase Analytics:', event);
  }

  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    // TODO: Implement Firebase Analytics setUserId and setUserProperties
    console.log('Firebase Analytics Identify:', { userId, properties });
  }

  async flush(): Promise<void> {
    // Firebase Analytics doesn't require manual flushing
  }
}

/**
 * Analytics Manager
 */
class AnalyticsManager {
  private providers: AnalyticsProvider[] = [];
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled: boolean = FEATURE_FLAGS.ENABLE_ANALYTICS;

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize analytics providers
   */
  private initializeProviders(): void {
    // Always add console provider in development
    if (__DEV__) {
      this.providers.push(new ConsoleAnalyticsProvider());
    }

    // Add Firebase Analytics in production
    if (!__DEV__ && this.isEnabled) {
      this.providers.push(new FirebaseAnalyticsProvider());
    }
  }

  /**
   * Track an analytics event
   */
  async track(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Add to queue for offline support
      this.eventQueue.push(event);

      // Send to all providers
      await Promise.allSettled(
        this.providers.map(provider => provider.track(event))
      );

      // Remove from queue after successful send
      this.eventQueue = this.eventQueue.filter(e => e !== event);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Identify user
   */
  async identify(userId: string, properties?: Record<string, any>): Promise<void> {
    if (!this.isEnabled) return;

    try {
      await Promise.allSettled(
        this.providers.map(provider => provider.identify(userId, properties))
      );
    } catch (error) {
      console.error('Analytics identify error:', error);
    }
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Retry queued events
      for (const event of this.eventQueue) {
        await this.track(event);
      }

      // Flush all providers
      await Promise.allSettled(
        this.providers.map(provider => provider.flush())
      );
    } catch (error) {
      console.error('Analytics flush error:', error);
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get analytics status
   */
  getStatus(): {
    enabled: boolean;
    providers: number;
    queuedEvents: number;
  } {
    return {
      enabled: this.isEnabled,
      providers: this.providers.length,
      queuedEvents: this.eventQueue.length,
    };
  }
}

// Global analytics instance
const analytics = new AnalyticsManager();

/**
 * Log an analytics event
 */
export const logAnalyticsEvent = async (event: AnalyticsEvent): Promise<void> => {
  await analytics.track(event);
};

/**
 * Identify user for analytics
 */
export const identifyUser = async (userId: string, properties?: Record<string, any>): Promise<void> => {
  await analytics.identify(userId, properties);
};

/**
 * Flush pending analytics events
 */
export const flushAnalytics = async (): Promise<void> => {
  await analytics.flush();
};

/**
 * Set analytics enabled state
 */
export const setAnalyticsEnabled = (enabled: boolean): void => {
  analytics.setEnabled(enabled);
};

/**
 * Get analytics status
 */
export const getAnalyticsStatus = () => {
  return analytics.getStatus();
};

/**
 * Convenience functions for common events
 */

export const trackScanStart = async (method: 'camera' | 'gallery', userId?: string) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.SCAN_START,
    properties: { method },
    timestamp: new Date(),
    userId,
  });
};

export const trackScanSuccess = async (
  properties: {
    merchant: string;
    total?: number | null;
    confidence?: number;
    processingTime?: number;
  },
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.SCAN_SUCCESS,
    properties,
    timestamp: new Date(),
    userId,
  });
};

export const trackScanError = async (
  error: string,
  properties?: Record<string, any>,
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.SCAN_ERROR,
    properties: { error, ...properties },
    timestamp: new Date(),
    userId,
  });
};

export const trackReceiptSaved = async (
  properties: {
    merchant: string;
    total?: number | null;
    currency?: string;
    category?: string;
  },
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.RECEIPT_SAVED,
    properties,
    timestamp: new Date(),
    userId,
  });
};

export const trackReceiptEdited = async (
  properties: {
    receiptId: string;
    updatedFields: string[];
  },
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.RECEIPT_EDITED,
    properties,
    timestamp: new Date(),
    userId,
  });
};

export const trackReceiptDeleted = async (
  receiptId: string,
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.RECEIPT_DELETED,
    properties: { receiptId },
    timestamp: new Date(),
    userId,
  });
};

export const trackFilterApplied = async (
  properties: {
    filterType: string;
    filterValue: string;
    resultCount: number;
  },
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.FILTER_APPLIED,
    properties,
    timestamp: new Date(),
    userId,
  });
};

export const trackLogin = async (
  method: 'email' | 'google' | 'apple',
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.LOGIN,
    properties: { method },
    timestamp: new Date(),
    userId,
  });
};

export const trackSignup = async (
  method: 'email' | 'google' | 'apple',
  userId?: string
) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.SIGNUP,
    properties: { method },
    timestamp: new Date(),
    userId,
  });
};

export const trackLogout = async (userId?: string) => {
  await logAnalyticsEvent({
    event: AnalyticsEvents.LOGOUT,
    properties: {},
    timestamp: new Date(),
    userId,
  });
};

/**
 * Performance tracking utilities
 */

export class PerformanceTracker {
  private startTime: number;
  private eventName: string;
  private properties: Record<string, any>;

  constructor(eventName: string, properties: Record<string, any> = {}) {
    this.eventName = eventName;
    this.properties = properties;
    this.startTime = Date.now();
  }

  /**
   * End performance tracking and log event
   */
  async end(userId?: string, additionalProperties?: Record<string, any>): Promise<void> {
    const duration = Date.now() - this.startTime;
    
    await logAnalyticsEvent({
      event: this.eventName,
      properties: {
        ...this.properties,
        ...additionalProperties,
        duration,
      },
      timestamp: new Date(),
      userId,
    });
  }
}

/**
 * Create a performance tracker
 */
export const createPerformanceTracker = (
  eventName: string,
  properties?: Record<string, any>
): PerformanceTracker => {
  return new PerformanceTracker(eventName, properties);
};

// TODO: Implement custom analytics dashboard
// TODO: Add A/B testing support
// TODO: Implement user journey tracking
// TODO: Add crash reporting integration
// TODO: Implement analytics data export
// TODO: Add privacy-compliant analytics options

