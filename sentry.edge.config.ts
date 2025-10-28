import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided and not in development
if (process.env.SENTRY_DSN && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Set environment
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    
    // Performance monitoring
    tracesSampleRate: 0.1,
    
    // Only enable in production
    enabled: true,
    
    // Edge runtime specific configuration
    integrations: [
      // Add edge-specific integrations here if needed
    ],
    
    // Additional configuration
    beforeSend(event) {
      // Filter out development errors in production
      if (process.env.NODE_ENV === "production") {
        // Don't send events for localhost
        if (event.request?.url?.includes("localhost")) {
          return null;
        }
      }
      return event;
    },
    
    // Set organization and project for better tracking
    initialScope: {
      tags: {
        component: "edge",
        platform: "swaeduae",
      },
    },
  });
}