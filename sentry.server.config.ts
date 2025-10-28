import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided and not in development
if (process.env.SENTRY_DSN && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    
    // Set environment
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",
    
    // Performance monitoring
    tracesSampleRate: 0.1,
    
    // Enable logs to be sent to Sentry
    enableLogs: true,
    
    // Only enable in production
    enabled: true,
    
    // Server-specific configuration
    integrations: [
      // Add server-specific integrations here if needed
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
    
    initialScope: {
      tags: {
        component: "server",
        platform: "swaeduae",
      },
    },
  });
}